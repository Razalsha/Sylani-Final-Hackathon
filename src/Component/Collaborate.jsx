import React, { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import {
    collection,
    doc,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/Firebase";
import { Container, Row, Col, Form, Button, Card, ListGroup, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Collaboration = () => {
    const [notes, setNotes] = useState([]); // State to hold all notes
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [filteredNotes, setFilteredNotes] = useState([]); // State for filtered notes
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [selectedNote, setSelectedNote] = useState(null); // State to hold the selected note for collaboration
    const [collaboratorEmail, setCollaboratorEmail] = useState(""); // State to hold new collaborator email

    const notesCollection = collection(db, "notes"); // Reference to the notes collection

    const navigate = useNavigate();

    // Format Firestore Timestamp to a human-readable date
    const formatTimestamp = (timestamp) => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toLocaleString();
        } else if (timestamp instanceof Date) {
            return timestamp.toLocaleString();
        }
        return "";
    };
  
    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, "users"); // Reference to 'users' collection
            const usersSnapshot = await getDocs(usersCollection); // Fetch all user documents
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return usersList;
        } catch (error) {
            console.error("Error fetching users: ", error);
            return [];
        }
    };
    
    // Fetch notes from Firestore on component mount
    useEffect(() => {
        const fetchNotes = async () => {
            const notesSnapshot = await getDocs(notesCollection);
            const notesList = notesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotes(notesList);
            setFilteredNotes(notesList);
        };
        fetchNotes();
    }, []);

    // Handle search functionality
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = notes.filter(
            (note) =>
                note.title.toLowerCase().includes(query) ||
                note.description.toLowerCase().includes(query)
        );
        setFilteredNotes(filtered);
    };

    // Handle adding a collaborator to a note
    const addCollaborator = async () => {
        if (!collaboratorEmail || !selectedNote) return;

        const noteRef = doc(db, "notes", selectedNote.id);
        await updateDoc(noteRef, {
            collaborators: arrayUnion(collaboratorEmail),
        });

        // Update locally
        const updatedNotes = notes.map((note) =>
            note.id === selectedNote.id
                ? {
                    ...note,
                    collaborators: [...(note.collaborators || []), collaboratorEmail],
                }
                : note
        );
        setNotes(updatedNotes);
        setFilteredNotes(updatedNotes);
        setCollaboratorEmail("");
        setShowModal(false);
    };

    // Handle removing a collaborator from a note
    const removeCollaborator = async (email) => {
        if (!selectedNote) return;

        const noteRef = doc(db, "notes", selectedNote.id);
        await updateDoc(noteRef, {
            collaborators: arrayRemove(email),
        });

        // Update locally
        const updatedNotes = notes.map((note) =>
            note.id === selectedNote.id
                ? {
                    ...note,
                    collaborators: note.collaborators.filter((collab) => collab !== email),
                }
                : note
        );
        setNotes(updatedNotes);
        setFilteredNotes(updatedNotes);
    };

    // Toggle the modal for collaboration management
    const handleModal = (note = null) => {
        setSelectedNote(note);
        setShowModal(!showModal);
    };

    // Logout functionality
    const handleLogout = () => {
        navigate("/"); // Redirect to login or home page
    };

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col lg={2} className="d-none d-lg-block vh-100 text-white p-3" style={{ backgroundColor: "rgba(153, 202, 60, 1)" }}>
                    <ListGroup variant="flush" className="mt-5">
                        <ListGroup.Item action href="#notes" className="text-white bg-transparent border-0">
                            <button onClick={() => navigate("/Notes")} style={{ border: "none" }}>Create Notes</button>
                        </ListGroup.Item>
                        <ListGroup.Item action href="#collaborations" className="text-white bg-transparent border-0">
                            Collaborations
                        </ListGroup.Item>
                        
                        <ListGroup.Item action href="#logout" className="text-white bg-transparent border-0">
                            <button onClick={handleLogout} style={{ border: "none" }}>Logout</button>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                {/* Main Content */}
                <Col lg={10} xs={12} className="p-4">
                    <div
                        style={{
                            background: "#CDEB93",
                            borderRadius: "20px",
                            padding: "30px",
                        }}
                    >
                        <h2 className="text-center mb-4 mt-4" style={{ color: "rgb(11, 117, 70)" }}>
                            Manage Collaborations
                        </h2>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Control
                                    type="text"
                                    placeholder="Search Notes"
                                    className="rounded-pill"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </Col>
                        </Row>

                        {/* Notes List */}
                        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                            {filteredNotes.map((note) => (
                                <Col key={note.id}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <Card.Title>{note.title}</Card.Title>
                                            <Card.Text>{note.description}</Card.Text>
                                        </Card.Body>
                                        <Card.Footer>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    Last edited at: {formatTimestamp(note.lastEditedAt)}
                                                </small>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleModal(note)}
                                                >
                                                    Collaborate
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

            {/* Modal for managing collaborations */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Collaborators</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Collaborators</h5>
                    <ListGroup>
                        {(selectedNote?.collaborators || []).map((email) => (
                            <ListGroup.Item key={email} className="d-flex justify-content-between align-items-center">
                                {email}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeCollaborator(email)}
                                >
                                    Remove
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Form className="mt-3">
                        <Form.Group>
                            <Form.Label>Add Collaborator</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter collaborator's Name"
                                value={collaboratorEmail}
                                onChange={(e) => setCollaboratorEmail(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={addCollaborator}>
                        Add Collaborator
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>

    );
};
 
export default  Collaboration;