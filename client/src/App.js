import React, { useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import Peer from "simple-peer";

function App() {
  const socketRef = useRef();
  const container = useRef()
  const userVideo = useRef();
  const userAudio = useRef();
  const peersRef = useRef([]);
  const audioPeersRef = useRef([]);
  const roomID = "room";

  useEffect(() => {
      socketRef.current = io.connect("/");
  }, []);

  function stream() {
    container.current.style.display = "none"
    navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          socketRef.current.on("all users", (users) => {
            users.forEach((userID) => {
              console.log(userID);
              const peer = createPeer(userID, socketRef.current.id, stream);
              peersRef.current.push({
                peerID: userID,
                peer,
              });
            });
          });
          socketRef.current.on("user joined", (payload) => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
            });
          });

          socketRef.current.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            item.peer.signal(payload.signal);
          });
        });
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        userAudio.current.srcObject = stream;
        userAudio.current.muted = "true";
        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", (users) => {
          users.forEach((userID) => {
            console.log(userID);
            const peer = createAudioPeer(userID, socketRef.current.id, stream);
            audioPeersRef.current.push({
              peerID: userID,
              peer,
            });
          });
        });
        socketRef.current.on("user joined audio", (payload) => {
          const peer = addAudioPeer(payload.signal, payload.callerID, stream);
          audioPeersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
        });

        socketRef.current.on("receiving returned audio signal", (payload) => {
          const item = audioPeersRef.current.find(
            (p) => p.peerID === payload.id
          );
          item.peer.signal(payload.signal);
        });
      });
      const stream = "";
      socketRef.current.emit("join room", roomID);
      socketRef.current.on("all users", (users) => {
        users.forEach((userID) => {
          console.log(userID);
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current.push({
            peerID: userID,
            peer,
          });
        });
      });
      socketRef.current.on("user joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
      });

      socketRef.current.on("receiving returned signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
      socketRef.current.on("all users", (users) => {
        users.forEach((userID) => {
          console.log(userID);
          const peer = createAudioPeer(userID, socketRef.current.id, stream);
          audioPeersRef.current.push({
            peerID: userID,
            peer,
          });
        });
      });
      socketRef.current.on("user joined audio", (payload) => {
        const peer = addAudioPeer(payload.signal, payload.callerID, stream);
        audioPeersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
      });

      socketRef.current.on("receiving returned audio signal", (payload) => {
        const item = audioPeersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
  }
  function watch() {
    container.current.style.display = "none"
    userVideo.current.style.display = "flex"
    const stream = "";
      socketRef.current.emit("join room", roomID);
      socketRef.current.on("all users", (users) => {
        users.forEach((userID) => {
          console.log(userID);
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current.push({
            peerID: userID,
            peer,
          });
        });
      });
      socketRef.current.on("user joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
      });

      socketRef.current.on("receiving returned signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
      socketRef.current.on("all users", (users) => {
        users.forEach((userID) => {
          console.log(userID);
          const peer = createAudioPeer(userID, socketRef.current.id, stream);
          audioPeersRef.current.push({
            peerID: userID,
            peer,
          });
        });
      });
      socketRef.current.on("user joined audio", (payload) => {
        const peer = addAudioPeer(payload.signal, payload.callerID, stream);
        audioPeersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
      });

      socketRef.current.on("receiving returned audio signal", (payload) => {
        const item = audioPeersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo.current.addEventListener("loadedmetadata", () => {
        try {
          userVideo.current.play();
        } catch (err) {}
        window.addEventListener("mousedown", () => {
          userVideo.current.play();
        });
      });
    });

    return peer;
  }

  function createAudioPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending audio signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("stream", async (stream) => {
      userAudio.current.srcObject = stream;
      userAudio.current.addEventListener("loadedmetadata", () => {
        try {
          userAudio.current.play();
        } catch (err) {}
        window.addEventListener("mousedown", () => {
          userAudio.current.play();
        });
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo.current.addEventListener("loadedmetadata", () => {
        try {
          userVideo.current.play();
        } catch (err) {}
        window.addEventListener("mousedown", () => {
          userVideo.current.play();
        });
      });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function addAudioPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning audio signal", { signal, callerID });
    });

    peer.on("stream", async (stream) => {
      userAudio.current.srcObject = stream;
      userAudio.current.addEventListener("loadedmetadata", () => {
        try {
          userAudio.current.play();
        } catch (err) {}
        window.addEventListener("mousedown", () => {
          userAudio.current.play();
        });
      });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div className="App">
      <div className="container" ref={container}>
        <button className="btn" definer="stream" onClick={stream}>Stream</button>
        <button className="btn" definer="watch" onClick={watch}>Watch</button>
      </div>
      <video className="video" controls ref={userVideo}></video>
      <audio className="audio" controls ref={userAudio}></audio>
    </div>
  );
}

export default App;
