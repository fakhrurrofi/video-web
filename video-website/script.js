const videoUpload = document.getElementById('videoUpload');
const videoList = document.getElementById('videoList');
const videoSelect = document.getElementById('videoSelect');
const scheduleForm = document.getElementById('scheduleForm');
const scheduledList = document.getElementById('scheduledList');
const videoElement = document.getElementById('videoElement');

let videoQueue = [];
let scheduledVideos = [];

// Fungsi untuk menambahkan video ke daftar
function addVideoToList(file) {
  const listItem = document.createElement('li');
  listItem.textContent = file.name;
  videoList.appendChild(listItem);

  // Tambahkan ke dropdown
  const option = document.createElement('option');
  option.value = file.name;
  option.textContent = file.name;
  videoSelect.appendChild(option);

  // Simpan file ke antrian
  videoQueue.push(file);
}

// Event: Upload video
videoUpload.addEventListener('change', (event) => {
  const files = event.target.files;
  Array.from(files).forEach(file => addVideoToList(file));
});

// Event: Jadwalkan video
scheduleForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const selectedVideoName = videoSelect.value;
  const scheduledTime = new Date(scheduleForm.scheduleTime.value);
  const duration = parseInt(scheduleForm.playDuration.value, 10);
  const isLoop = scheduleForm.loopVideo.checked;

  const video = videoQueue.find(video => video.name === selectedVideoName);

  if (video) {
    const videoObj = { video, scheduledTime, duration, isLoop };
    scheduledVideos.push(videoObj);

    const listItem = document.createElement('li');
    listItem.textContent = `${selectedVideoName} - ${scheduledTime.toLocaleString()} (${duration}s, Loop: ${isLoop})`;

    // **Tombol Hapus Jadwal**
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌ Hapus';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', () => {
      scheduledVideos = scheduledVideos.filter(v => v !== videoObj);
      scheduledList.removeChild(listItem);
    });

    // **Tombol Tunda Jadwal**
    const delayBtn = document.createElement('button');
    delayBtn.textContent = '⏳ Tunda';
    delayBtn.style.marginLeft = '10px';
    delayBtn.addEventListener('click', () => {
      const newTime = new Date(videoObj.scheduledTime.getTime() + 5 * 60 * 1000); // Tunda 5 menit
      videoObj.scheduledTime = newTime;
      listItem.textContent = `${selectedVideoName} - ${newTime.toLocaleString()} (${duration}s, Loop: ${isLoop})`;
      listItem.appendChild(deleteBtn);
      listItem.appendChild(delayBtn);
    });

    listItem.appendChild(deleteBtn);
    listItem.appendChild(delayBtn);
    scheduledList.appendChild(listItem);
  }
});

// Fungsi untuk masuk ke fullscreen
function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) { // Safari
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // IE/Edge
    element.msRequestFullscreen();
  } else {
    console.warn("Fullscreen API is not supported in this browser.");
  }
}

// Fungsi untuk keluar dari fullscreen
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { // Safari
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE/Edge
    document.msExitFullscreen();
  }
}

// Fungsi untuk memutar video dengan durasi tertentu
function playVideo(video, isLoop, duration) {
  const videoURL = URL.createObjectURL(video);
  videoElement.src = videoURL;
  videoElement.loop = isLoop; // Atur mode loop
  videoElement.play();

  enterFullscreen(videoElement);

  if (!isLoop) {
    setTimeout(() => {
      videoElement.pause();
      videoElement.currentTime = 0;
      exitFullscreen();
      alert("Video playback stopped after scheduled duration.");
    }, duration * 1000);
  }

  videoElement.addEventListener('ended', () => {
    exitFullscreen();
    videoElement.currentTime = 0;
  });
}

// Interval untuk memutar video sesuai jadwal
setInterval(() => {
  const now = new Date();

  scheduledVideos.forEach((item, index) => {
    if (now >= item.scheduledTime) {
      playVideo(item.video, item.isLoop, item.duration);

      // Hapus dari jadwal setelah diputar
      scheduledVideos.splice(index, 1);
      scheduledList.removeChild(scheduledList.children[index]);
    }
  });
}, 1000);
