import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "simple-peer";
import { io } from "socket.io-client";


const VideoCall = () => {
    const myVideoRef = useRef();
    const remoteVideoRef = useRef();
    const socketRef = useRef();
    const peerRef = useRef();
    const [isSharing, setIsSharing] = useState(false);

    const { roomName } = useParams();

    const startShare = () => {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) // 화면 공유 스트림 가져오기
            .then((stream) => {
                myVideoRef.current.srcObject = stream;
                setIsSharing(true);

                socketRef.current.emit("join room", roomName); // 방에 조인

                socketRef.current.on("other user", (userID) => {
                    // 새로운 유저가 들어왔을 때
                    const peer = new Peer({
                        initiator: true,
                        trickle: false,
                        stream: stream,
                    });

                    peer.on("signal", (data) => {
                        socketRef.current.emit("offer", { data, to: userID });
                    });

                    peer.on("stream", (stream) => {
                        remoteVideoRef.current.srcObject = stream;
                    });

                    socketRef.current.on("answer", (data) => {
                        peer.signal(data);
                    });

                    peerRef.current = peer;
                });

                socketRef.current.on("offer", (data) => {
                    // 다른 유저로부터 오퍼를 받았을 때aa
                    const peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: stream,
                    });

                    peer.on("signal", (data) => {
                        socketRef.current.emit("answer", { data, to: data.from });
                    });

                    peer.on("stream", (stream) => {
                        remoteVideoRef.current.srcObject = stream;
                    });

                    peer.signal(data);

                    peerRef.current = peer;
                });
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
            });
    };

    const stopShare = () => {
        const stream = myVideoRef.current.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
            track.stop();
        });

        myVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = null;
        setIsSharing(false);
        socketRef.current.disconnect();

        if (peerRef.current) {
            peerRef.current.destroy();
        }
    };

    useEffect(() => {
        const socket = io("http://localhost:8885"); // 소켓 연결
        socketRef.current = socket;
        console.log('소켓 연결', socket);
        return () => {
            socket.disconnect(); // 컴포넌트가 언마운트될 때 소켓 연결 해제
        };
    }, []);

    return (
        <div>
            {isSharing ? (
                <button onClick={stopShare}>Stop Sharing</button>
            ) : (
                <button onClick={startShare}>Start Sharing</button>
            )}
            <br />
            <video
                id="myVideo"
                style={{
                    width: 240,
                    height: 240,
                    backgroundColor: "black",
                }}
                ref={myVideoRef}
                autoPlay
            />
            <video
                id="remoteVideo"
                style={{
                    width: 240,
                    height: 240,
                    backgroundColor: "black",
                }}
                ref={remoteVideoRef}
                autoPlay
            />
        </div>
    );
};

export default VideoCall;
