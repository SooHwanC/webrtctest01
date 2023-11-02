import React from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ScreenSharing = () => {
    const handleScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = stream.getVideoTracks()[0];

            console.log('videoTrack 확인', videoTrack);

            // 화면 공유된 stream을 서버로 전송
            socket.emit('shareScreen', videoTrack);

            // 다른 화면에 보여주기
            const videoElement = document.createElement('video');
            videoElement.srcObject = new MediaStream([videoTrack]);
            videoElement.play();
            document.body.appendChild(videoElement);
        } catch (error) {
            console.error('화면 공유 에러:', error);
        }
    };

    return (
        <div>
            <h1>화면 공유</h1>
            <button onClick={handleScreenShare}>화면 공유 시작</button>
        </div>
    );
};

export default ScreenSharing;
