import React from 'react';
import { Route, Routes, useLocation } from "react-router-dom";
import VideoCall from './components/VideoCall';

function App() {
  return (

    <Routes>
       <Route path="/room/:roomName" element={<VideoCall />}></Route>
    </Routes>

  );
}

export default App;
