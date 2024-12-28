
import React, { useState } from "react";
import { auth } from "../config/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button , Card , Form} from "react-bootstrap";
import classroomImage from "./classroom.png";

function Regiester() {
  const backgroundStyle = {
    backgroundImage: `url(${classroomImage})`,
    backgroundSize: "cover", // Ensures the image covers the entire container
    backgroundPosition: "center", // Centers the image
    backgroundRepeat: "no-repeat", // Prevents tiling
    height: "100vh", // Full viewport height
    color: "white", // Text color for readability
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful!");
      navigate("/Login");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div style={backgroundStyle}>
      <Container>
        <Row className="align-items-center justify-content-center text-center" style={{ height: "100%" }}>
          <Col className="mt-5">
            
             <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Card className='py-4 mt-5 '
                style={{
                  marginTop: '120px',
                  width: '400px',
                  padding: '20px',
                  borderRadius: '15px',
                  background: "linear-gradient(180deg, #99CA3C 0%, #0030B3 100%)",
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Title */}
                <h1
                  style={{
                    textAlign: 'center',
                    color:'white',
                    marginBottom: '30px',
                  }}
                >
                  Regiester Form
                </h1>

                {/* Form */}
                <Form onSubmit={handleRegister} >
                  {/* Email Input */}
                  <Form.Group controlId="formEmail" style={{ marginBottom: '15px', marginLeft:'30px' }}>
                    <Form.Control 
                      type="text"
                      placeholder="Username"
                      
                      style={{
                        backgroundColor: '#D6F5B0',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px',
                      }}
                    />
                  </Form.Group>

                  {/* Subject Input */}
                  <Form.Group controlId="formSubject" style={{ marginBottom: '20px', marginLeft:'30px'}} className="d-flex justify-content-center">
                  <Form.Control 
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        backgroundColor: '#D6F5B0',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px',
                      }}
                    />
                  </Form.Group>
                  <Form.Group controlId="formSubject" style={{ marginBottom: '20px', marginLeft:'30px'}}>
                  <Form.Control
                      type="Password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        backgroundColor: '#D6F5B0',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px',
                      }}
                    />
                  </Form.Group>

                  {/* Submit Button */}
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      type="submit"
                      style={{
                        backgroundColor: 'rgba(153, 202, 60, 1)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        color: 'white',
                      }}
                    >
                      Regiester
                    </Button>
                    <Button onClick={() => navigate("/Login")}
                      type="submit"
                      style={{
                        backgroundColor: 'rgba(153, 202, 60, 1)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        color: 'white',
                        marginLeft:'10px'
                      }}
                    >
                      Login
                    </Button>
                  </div>
                </Form>
              </Card>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Regiester
