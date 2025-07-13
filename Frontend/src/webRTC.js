// src/webrtc/webRTC.js
import SimplePeer from 'simple-peer';
import {
  callEvents,
  signalPeerData,
} from './api/socket.js';
import { store } from './store/index.js';
import {
  setPeer,
  setRemoteStream,
  endCall,
} from './features/callSlice.js';

let peer = null;
let localStream = null;
let remoteStream = new MediaStream();

export const setLocalMediaStream = (stream) => {
  localStream = stream;
};

export const getLocalMediaStream = () => localStream;

export const createPeerConnection = ({ isInitiator, targetSocketId, iceServers }) => {
  peer = new SimplePeer({
    initiator: isInitiator,
    trickle: false,
    stream: localStream,
    config: { iceServers },
  });

  store.dispatch(setPeer(peer));

  peer.on('signal', (signalData) => {
    signalPeerData({ targetSocketId, signal: signalData });
  });

  peer.on('stream', (stream) => {
    remoteStream = stream;
    store.dispatch(setRemoteStream(stream));
  });

  peer.on('close', () => {
    cleanupPeer();
  });

  peer.on('error', (err) => {
    console.error('WebRTC Peer error:', err);
    cleanupPeer();
  });
};

export const handleSignalingData = (signal) => {
  if (peer) {
    peer.signal(signal);
  }
};

export const cleanupPeer = () => {
  if (peer) {
    peer.destroy();
    peer = null;
  }
  remoteStream = new MediaStream();
  store.dispatch(endCall());
};
