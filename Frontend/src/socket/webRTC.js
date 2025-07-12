import Peer from "simple-peer";
import { setLocalStreamRoom, setRemoteStreams } from "../actions/roomActions.js";
import { setLocalStream } from "../actions/videoChatActions.js";
import { store } from "../store/index.js";
import { signalPeerData } from "./socketConnection.js";

export const getLocalStreamPreview = (audioOnly, callback, room) => {
  const constraints = { audio: true, video: audioOnly ? false : true };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      if (room) {
        store.dispatch(setLocalStreamRoom(stream));
      } else {
        store.dispatch(setLocalStream(stream));
      }

      if (callback) {
        callback();
      }
    })
    .catch((err) => {
      console.log(err);
      console.log("Error getting local stream");
    });
};

const peerConfiguration = () => {
  const turnIceServers = null;

  if (turnIceServers) {
    // TODO use TURN server credentials
  } else {
    console.warn("Using only STUN server");
    return {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };
  }
};

export const newPeerConnection = (initiator) => {
  const stream = store.getState().videoChat.localStream;

  if (!stream) {
    throw new Error("No local stream");
  }

  const configuration = peerConfiguration();
  const peer = new Peer({
    initiator: initiator,
    trickle: false,
    config: configuration,
    stream: stream,
  });

  return peer;
};

let peers = {};

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const localStream = store.getState().room.localStreamRoom;

  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config: peerConfiguration(),
    stream: localStream,
  });

  peers[connUserSocketId].on("signal", (data) => {
    const signalData = {
      signal: data,
      connUserSocketId: connUserSocketId,
    };

    signalPeerData(signalData);
  });

  peers[connUserSocketId].on("stream", (remoteStream) => {
    remoteStream.connUserSocketId = connUserSocketId;
    addNewRemoteStream(remoteStream);
  });
};

export const handleSignalingData = (data) => {
  const { connUserSocketId, signal } = data;

  if (peers[connUserSocketId]) {
    peers[connUserSocketId].signal(signal);
  }
};

const addNewRemoteStream = (remoteStream) => {
  const remoteStreams = store.getState().room.remoteStreams;
  const newRemoteStreams = [...remoteStreams, remoteStream];

  store.dispatch(setRemoteStreams(newRemoteStreams));
};

export const closeAllConnections = () => {
  Object.entries(peers).forEach(([connUserSocketId, peer]) => {
    if (peer) {
      peer.destroy();
      delete peers[connUserSocketId];
    }
  });
};

export const handleParticipantLeftRoom = (data) => {
  const { connUserSocketId } = data;

  if (peers[connUserSocketId]) {
    peers[connUserSocketId].destroy();
    delete peers[connUserSocketId];
  }

  const remoteStreams = store.getState().room.remoteStreams;

  const newRemoteStreams = remoteStreams.filter(
    (remoteStream) =>
      remoteStream.connUserSocketId !== connUserSocketId
  );

  store.dispatch(setRemoteStreams(newRemoteStreams));
};

export const switchOutgoingTracks = (stream) => {
  for (let socket_id in peers) {
    for (let index in peers[socket_id].streams[0].getTracks()) {
      for (let index2 in stream.getTracks()) {
        if (
          peers[socket_id].streams[0].getTracks()[index].kind ===
          stream.getTracks()[index2].kind
        ) {
          peers[socket_id].replaceTrack(
            peers[socket_id].streams[0].getTracks()[index],
            stream.getTracks()[index2],
            peers[socket_id].streams[0]
          );
          break;
        }
      }
    }
  }
};
