// Cliente WebRTC
const peerConnection = new RTCPeerConnection();
let dataChannel;

function createConnection() {
  dataChannel = peerConnection.createDataChannel("dataChannel");
  setupDataChannel();

  return new Promise((res, rej) => {
    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => res(peerConnection.localDescription))
      .catch(rej);
  });
}

function acceptConnection(offer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  return new Promise((res, rej) => {
    peerConnection
      .createAnswer()
      .then((answer) => {
        return peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        res(peerConnection.localDescription);
      })
      .catch(rej);
  });
}

peerConnection.ondatachannel = (event) => {
  dataChannel = event.channel;
  setupDataChannel();
};

function setupDataChannel() {
  dataChannel.onopen = () => console.log("Data channel opened");
  dataChannel.onmessage = (event) =>
    console.log("Received message:", event.data);
}

function sendMessage(message) {
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(message);
  }
}
