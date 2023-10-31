import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('https://codebridge.site:5000');

function App() {
    const [isSharing, setIsSharing] = useState(false);
    const [peers, setPeers] = useState([]);

    const videoRef = useRef();

    useEffect(() => {
        const peer = new Peer({ initiator: true, trickle: false });

        peer.on('signal', (data) => {
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

            newPeer.on('signal', (offer) => {
                socket.emit('offer', JSON.stringify(offer));
            });

            newPeer.on('stream', (stream) => {
                setPeers((prevPeers) => [...prevPeers, stream]);
            });
        });

        return () => {
            peer.destroy();
        };
    }, []);

    const startSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoRef.current.srcObject = stream;
            setIsSharing(true);
        } catch (error) {
            console.error('Error accessing display media:', error);
            alert('Failed to access display media. Please check your settings.');
        }
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
