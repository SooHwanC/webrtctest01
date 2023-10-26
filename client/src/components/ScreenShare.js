import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ScreenShare = () => {
  const [socket, setSocket] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    if (screenStream) {
      const videoElement = document.getElementById('shared-screen');
      videoElement.srcObject = screenStream;
    }
  }, [screenStream]);

  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];

      const newSocket = io('13.125.232.118:3001');

      newSocket.on('connect', () => {
        newSocket.emit('startScreenShare', { peerId: newSocket.id });
      });

      videoTrack.onended = () => {
        newSocket.emit('stopScreenShare', { peerId: newSocket.id });
        newSocket.disconnect();
      };

      setSocket(newSocket);
      setScreenStream(stream);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  if (socket) {
    socket.on('startScreenShare', (data) => {
      console.log('Received startScreenShare event:', data);
    });

    socket.on('stopScreenShare', (data) => {
      console.log('Received stopScreenShare event:', data);
    });
  }

  return (
    <div>
      <button onClick={handleShareScreen}>Share Screen</button>
      <video id="shared-screen" autoPlay playsInline />
    </div>
  );
};

export default ScreenShare;
