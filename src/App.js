import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Regiester from './Component/Regiester';
import Login from './Component/Login';
import Notes from './Component/Notes';
import Collaborate from './Component/Collaborate';



function App() {
  return (
    <>
    <div className="App">
      <Router>
        <Routes>
        <Route path="/" element={<Regiester />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Notes" element={<Notes />} />
        <Route path="/Collaborate" element={<Collaborate />} />
        </Routes>
      </Router>
    </div>
    </>
  )

}

export default App;
