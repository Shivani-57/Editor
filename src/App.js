import React from 'react';
import TextEditor from './TextEditor';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import {v4 as uuid} from "uuid"
import "./style.css"

function App() {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<Navigate to={`/${uuid()}`}/>} />
          <Route path='/:id'  element={<TextEditor />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
