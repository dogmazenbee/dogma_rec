import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VideoRoom from './components/VideoRoom';
import AdminPanel from './components/AdminPanel';
import JoinRoom from './components/JoinRoom';
import Calendar from './components/Calendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room" element={<VideoRoom />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;