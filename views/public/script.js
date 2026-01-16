const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
let myStream;

// Feature: Get Camera and Mic
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myStream = stream;
  addVideoStream(myVideo, stream);

  // Feature: Answer Incoming Calls
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userStream => { addVideoStream(video, userStream) });
  });

  // Feature: Connect to New Users
  socket.on('user-connected', userId => {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userStream => { addVideoStream(video, userStream) });
  });
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

// Feature: Mute Audio Toggle
document.getElementById('mute-btn').addEventListener('click', (e) => {
  const enabled = myStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myStream.getAudioTracks()[0].enabled = false;
    e.target.innerText = "Unmute Mic";
    e.target.style.background = "#4285f4";
  } else {
    myStream.getAudioTracks()[0].enabled = true;
    e.target.innerText = "Mute Mic";
    e.target.style.background = "#ea4335";
  }
});

// Feature: Stop Video Toggle
document.getElementById('video-btn').addEventListener('click', (e) => {
  const enabled = myStream.getVideoTracks()[0].enabled;
  myStream.getVideoTracks()[0].enabled = !enabled;
  e.target.innerText = enabled ? "Start Video" : "Stop Video";
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}
