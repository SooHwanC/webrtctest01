import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://codebridge.site');
// const socket = io('http://localhost:5000');

function App() {
    const [isSharing, setIsSharing] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);

    const videoRef = useRef();

    const startSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoRef.current.srcObject = stream;
            setIsSharing(true);

            // WebRTC 연결 설정
            let peerConnection = new RTCPeerConnection();
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // 상대방에게 offer 전송
            socket.emit('offer', { offer });
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
        setRemoteStream(null);

        // WebRTC 연결 종료 후 상대방에게 종료 메시지 전송
        socket.emit('stop-sharing');
    };


    useEffect(() => {
        let peerConnection = null;

        // 서버에서 온 offer 처리
        socket.on('offer', async (data) => {
            const remoteOffer = new RTCSessionDescription(data.offer);
            await peerConnection.setRemoteDescription(remoteOffer);

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // 상대방에게 answer 전송
            socket.emit('answer', { answer });
        });

        // 서버에서 온 answer 처리
        socket.on('answer', async (data) => {
            const remoteAnswer = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(remoteAnswer);
        });

        // 서버에서 화면 공유 중지 메시지 처리
        socket.on('stop-sharing', () => {
            stopSharing();
        });

        return () => {
            stopSharing();
        };
    }, []);

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
                {remoteStream && <video ref={videoRef} autoPlay playsInline srcObject={remoteStream} />}
            </div>
        </div>
    );
}

export default App;
