import React, { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config/Firebase"; // Adjust the path to your firebase.js
import { getAuth, signOut } from 'firebase/auth';
import { Container, Row, Col, Form, Button, ListGroup, Card, Modal } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState(""); // Store the search query
    const [notes, setNotes] = useState([]); // State to hold all notes
    const [showModal, setShowModal] = useState(false); // State to toggle Add/Edit Modal
    const [currentNote, setCurrentNote] = useState(null); // State to hold the note being edited
    const [filteredNotes, setFilteredNotes] = useState([]); // State for filtered notes

    const [newNote, setNewNote] = useState({
        title: "",
        description: "",
        createdBy: "User 1", // Hardcoded for now (replace with actual user data)
    });

    // Example Usage:
    const noteData = {
        title: "My New Note",
        content: "This is the note content.",
        createdBy: "user1@example.com",
        createdAt: serverTimestamp(),
        collaborators: ["user1@example.com"],
        lastEditedBy: "user1@example.com"
    };


    const formatTimestamp = (timestamp) => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toLocaleString(); // Convert Firebase Timestamp to readable string
        } else if (timestamp instanceof Date) {
            return timestamp.toLocaleString(); // If it's already a Date object, format it
        }
        return ''; // Return empty string if timestamp is not available
    };

    const notesCollection = collection(db, "notes");

    // Fetch all notes on component mount
    useEffect(() => {
        const fetchNotes = async () => {
            const notesSnapshot = await getDocs(notesCollection);
            const notesList = notesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotes(notesList); // Set all notes
            setFilteredNotes(notesList); // Initially show all notes
        };
        fetchNotes();
    }, []);

    // Toggle Modal
    const handleModal = (note = null) => {
        setCurrentNote(note);
        setNewNote(note || { title: "", description: "", createdBy: "User 1" });
        setShowModal(!showModal);
    };

    // Handle Form Input Changes
    const handleChange = (e) => {
        setNewNote({ ...newNote, [e.target.name]: e.target.value });
    };

    // Save or Edit Note
    const saveNote = async () => {
        if (currentNote) {
            // Update existing note in Firestore
            const noteRef = doc(db, "notes", currentNote.id);
            await updateDoc(noteRef, {
                ...newNote,
                lastEditedBy: "User 1",
                lastEditedAt: serverTimestamp(), // Firebase server timestamp
            });

            // Update locally
            const updatedNotes = notes.map((note) =>
                note.id === currentNote.id
                    ? { ...note, ...newNote, lastEditedBy: "User 1", lastEditedAt: new Date().toLocaleString() }
                    : note
            );
            setNotes(updatedNotes);
            setFilteredNotes(updatedNotes); // Update filtered notes as well
        } else {
            // Add new note to Firestore
            const docRef = await addDoc(notesCollection, {
                ...newNote,
                createdAt: serverTimestamp(), // Firebase server timestamp
                lastEditedBy: "User 1",
                lastEditedAt: serverTimestamp(),
            });
            // Add locally
            const noteToAdd = {
                ...newNote,
                id: docRef.id,
                createdAt: new Date().toLocaleString(),
                lastEditedBy: "User 1",
                lastEditedAt: new Date().toLocaleString(),
            };
            setNotes([...notes, noteToAdd]);
            setFilteredNotes([...filteredNotes, noteToAdd]); // Update filtered notes
        }
        setShowModal(false); // Close modal
    };

    // Delete Note
    const deleteNote = async (id) => {
        // Delete from Firestore
        const noteRef = doc(db, "notes", id);
        await deleteDoc(noteRef);

        // Delete locally
        const updatedNotes = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
        setFilteredNotes(updatedNotes); // Update filtered notes after deletion
    };

    // Handle Search Functionality
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter notes based on the search query (title or description)
        const filtered = notes.filter(
            (note) =>
                note.title.toLowerCase().includes(query) ||
                note.description.toLowerCase().includes(query)
        );
        setFilteredNotes(filtered); // Update filtered notes
    };

    const handleCommentInput = (e, noteId) => {
        const updatedNotes = notes.map((note) =>
            note.id === noteId ? { ...note, newComment: e.target.value } : note
        );
        setNotes(updatedNotes);
    };

    // Add comment to a note
    const addComment = async (noteId) => {
        const selectedNote = notes.find((note) => note.id === noteId);
        if (!selectedNote.newComment) return;

        const updatedComments = [...(selectedNote.comments || []), selectedNote.newComment];

        // Update Firestore
        const noteRef = doc(db, "notes", noteId);
        await updateDoc(noteRef, { comments: updatedComments });

        // Update State
        const updatedNotes = notes.map((note) =>
            note.id === noteId
                ? { ...note, comments: updatedComments, newComment: "" }
                : note
        );
        setNotes(updatedNotes);
    };



    const navigate = useNavigate();
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                alert('Logged out successfully!');
                navigate('/'); // Redirect to main page
            })
            .catch((error) => {
                console.error('Error logging out: ', error);
                alert('Failed to log out!');
            });
    };

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col lg={2} className="d-none d-lg-block vh-100 text-white p-3" style={{ backgroundColor: 'rgba(153, 202, 60, 1)' }}>
                    <div className="text-center mb-4"></div>

                    <ListGroup variant="flush" className="mt-5">
                        <ListGroup.Item action href="#courses" className="text-white bg-transparent border-0">
                            Create Notes
                        </ListGroup.Item>
                        {/* <ListGroup.Item action href="#students" className="text-white bg-transparent border-0">
                            All Notes
                        </ListGroup.Item> */}
                        <ListGroup.Item action href="#settings" className="text-white bg-transparent border-0">
                            <button onClick={() => navigate("/Collaborate")} style={{ border: 'none' }}>
                                Collaboration</button>
                        </ListGroup.Item>
                        <ListGroup.Item action href="#logout" className="text-white bg-transparent border-0">
                            <button onClick={handleLogout} style={{ border: 'none' }}>Logout</button>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                {/* Main Content */}
                <Col lg={10} xs={12} className="p-4">
                    <div
                        style={{
                            background: ' #CDEB93',
                            borderRadius: "20px",
                            padding: "30px",
                        }}
                    >
                        <h2 className="text-center mb-4 mt-4 " style={{ color: 'rgb(11, 117, 70)' }}>
                            Create Notes
                        </h2>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Control type="text" placeholder="Search" className="rounded-pill"
                                    value={searchQuery}
                                    onChange={handleSearch} // Search handler
                                />
                            </Col>
                            <Col>
                                <Button variant="success" onClick={() => handleModal()}>
                                    + Add Note
                                </Button>
                            </Col>
                        </Row>
                        {/* Notes List */}
                        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                            {notes.map((note) => (
                                <Col key={note.id}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <Card.Title>{note.title}</Card.Title>
                                            <Card.Text>{note.description}</Card.Text>

                                            {/* Comment Section */}
                                            <div className="mt-3">
                                                <h6>Comments:</h6>
                                                {/* Display Comments */}
                                                {note.comments && note.comments.length > 0 ? (
                                                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                                                        {note.comments.map((comment, index) => (
                                                            <li key={index} style={{ borderBottom: "1px solid #ccc", paddingBottom: "5px", marginBottom: "5px" }}>
                                                                {comment}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No comments yet.</p>
                                                )}

                                                {/* Add Comment */}
                                                <Form>
                                                    <Form.Group className="mt-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Add a comment"
                                                            value={note.newComment || ""}
                                                            onChange={(e) => handleCommentInput(e, note.id)}
                                                        />
                                                    </Form.Group>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => addComment(note.id)}
                                                    >
                                                        Add Comment
                                                    </Button>
                                                </Form>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    Created by: {note.createdBy}
                                                    <br />
                                                    Last edited at: {formatTimestamp(note.lastEditedAt)}
                                                </small>
                                            </div>
                                            <div>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleModal(note)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => deleteNote(note.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>



                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Col>
            </Row>

            {/* Modal for Add/Edit Note */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{currentNote ? "Edit Note" : "Add Note"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={newNote.title}
                                onChange={handleChange}
                                placeholder="Enter note title"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                rows={3}
                                value={newNote.description}
                                onChange={handleChange}
                                placeholder="Enter note description"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveNote}>
                        {currentNote ? "Update Note" : "Add Note"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Dashboard;
