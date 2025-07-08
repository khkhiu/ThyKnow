// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          {/* No separate /streak route needed - it's embedded in stats tab */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;