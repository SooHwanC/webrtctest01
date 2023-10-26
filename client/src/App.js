import React from 'react';
import { Route, Routes, useLocation } from "react-router-dom";
import VideoCall from './components/VideoCall';
import ScreenShare from './components/ScreenShare';

function App() {
  return (

    // <Routes>

    //    <Route path="/room/:roomName" element={<VideoCall />}></Route>
    // </Routes>
    <div className="App">
      <ScreenShare />
    </div>

  );
}

export default App;
