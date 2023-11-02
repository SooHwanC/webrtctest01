import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000');
// const socket = io('https://codebridge.site:5000');
// const socket = io('https://43.200.137.185:5000');

function App() {
    const [isSharing, setIsSharing] = useState(false);
    const [sharedStream, setSharedStream] = useState(null);
    const [peers, setPeers] = useState([]);
    const videoRef = useRef();

    console.log('sharedStream 확인', sharedStream);

    const startSharing = async () => {
        try {
            console.log('startSharing 실행');
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: true
            });
            
            videoRef.current.srcObject = stream;
            console.log('스트림 정보', stream);
            setIsSharing(true);

            // 서버로 스트림 전송
            socket.emit('share-screen', stream);
            console.log('startSharing 실행2');
        } catch (error) {
            console.error('Error accessing display media:', error);
            alert('Failed to access display media. Please check your settings.');
        }
    };

    // 서버에서 화면 전송 받기
    socket.on('shared-screen', (stream) => {
        console.log('shared-screen 실행');
        setSharedStream(stream);
    });

    const setupPeerListeners = (peer) => {
        peer.on('signal', (data) => {
            console.log('시그널 데이터 확인', data);
            socket.emit('offer', JSON.stringify(data));
        });

        peer.on('stream', (stream) => {
            videoRef.current.srcObject = stream;
        });

        socket.on('answer', (data) => {
            peer.signal(JSON.parse(data));
        });

        socket.on('new-peer', (data) => {
            const newPeer = new Peer({ trickle: false });
            newPeer.signal(JSON.parse(data));
            setupPeerListeners(newPeer);

            newPeer.on('stream', (stream) => {
                setPeers((prevPeers) => [...prevPeers, stream]);
            });
        });
    };

    const stopSharing = () => {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setIsSharing(false);
        socket.emit('stop-sharing');
    };

    return (
        <div>
            <div>
                {isSharing ? (
                    <div>
                        <h1>Your Shared Screen</h1>
                        <button onClick={stopSharing}>Stop Sharing</button>
                    </div>
                ) : (
                    <div>
                        <h1>Your Screen</h1>
                        <button onClick={startSharing}>Start Sharing</button>
                    </div>
                )}
            </div>
            <div>
                <h1>Remote Screen</h1>
                <video ref={videoRef} autoPlay playsInline />
            </div>
            <div>
                {peers.map((peerStream, index) => (
                    <video key={index} srcObject={peerStream} autoPlay playsInline />
                ))}
            </div>
        </div>
    );
}

export default App;
