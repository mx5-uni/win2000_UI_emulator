function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    //hours = hours % 12;
    //hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    const timeString = `${formattedHours}:${minutes} ${ampm}`

    document.getElementById('timeThing').textContent = timeString;
}

updateClock();
setInterval(updateClock, 1000);





let notepadWindow = document.getElementById("notepadWindow");
function openNotepad(){
    notepadWindow.style.visibility = "visible";
}
function closeNotepad(){
    notepadWindow.style.visibility = "hidden";
}

let musicplayerWindow = document.getElementById("musicplayerWindow");
function openMusicPlayer(){
    musicplayerWindow.style.visibility = "visible";
}
function closeMusicPlayer(){
    musicplayerWindow.style.visibility = "hidden";
}




const windows = document.querySelectorAll('.window')

let z = 1

windows.forEach( (window) => {
    // bring window forwards
    window.addEventListener('mousedown', () => {
        z = z+1
        window.style.zIndex = z
    })

    // clicking top bar?
    const topBar = window.querySelector('.topBar')
    topBar.addEventListener('mousedown', (event) => {
        let l = window.offsetLeft
        let t = window.offsetTop

        let startX = event.pageX
        let startY = event.pageY
        
        const drag = (event) => {
            window.style.left = l + (event.pageX - startX) + 'px'
            window.style.top = t + (event.pageY - startY) + 'px'
        }

        const mouseup = () => {
            document.removeEventListener("mousemove", drag)
            document.removeEventListener("mouseup", mouseup)
        }

        document.addEventListener("mousemove", drag)
        document.addEventListener("mouseup", mouseup)
    })

    // clicking corner?
    const corner = window.querySelector('.cornerImg')
    corner.addEventListener('mousedown', (event) => {
        let w = window.clientWidth
        let h = window.clientHeight

        let startX = event.pageX
        let startY = event.pageY
        
        const drag = (event) => {
            event.preventDefault()

            let newWidth = (w + (event.pageX - startX)) > 240 ? (w + (event.pageX - startX)) : 240
            let newHeight = (h + (event.pageY - startY)) > 140 ? (h + (event.pageY - startY)) : 140

            if (window.id == 'notepadWindow') {
                newWidth = (w + (event.pageX - startX)) > 240 ? (w + (event.pageX - startX)) : 240
                newHeight = (h + (event.pageY - startY)) > 140 ? (h + (event.pageY - startY)) : 140
            } else if (window.id == 'musicplayerWindow') {
                newWidth = (w + (event.pageX - startX)) > 300 ? (w + (event.pageX - startX)) : 300
                newHeight = (h + (event.pageY - startY)) > 255 ? (h + (event.pageY - startY)) : 255
            }
            
            window.style.width = newWidth + 'px'
            window.style.height = newHeight + 'px'
        }

        const mouseup = () => {
            document.removeEventListener("mousemove", drag)
            document.removeEventListener("mouseup", mouseup)
        }

        document.addEventListener("mousemove", drag)
        document.addEventListener("mouseup", mouseup)
    })
})











// music player section


// variables
let track_author = document.getElementById('mus_author');
let track_title = document.getElementById('mus_track');
let track_duration = document.getElementById('mus_duration');
let track_elapsed = document.getElementById('mus_elapsed');

let playpause_btn = document.getElementById('playpause_btn');
let playpause_btn_cont = document.getElementById('toggle_button_container1');

let loop_btn = document.getElementById('loop_btn');
let loop_btn_cont = document.getElementById('toggle_button_container2');
let loop_state = 0;

let shuffle_btn = document.getElementById('shuffle_btn');
let shuffle_btn_cont = document.getElementById('toggle_button_container3');
let shuffle_state = 0;

let volume_slider = document.getElementById('volume_slider');

let volume_btn = document.getElementById('volume_btn');
let volume_btn_cont = document.getElementById('toggle_button_container4');
let mute_state = 0;

let seek_slider = document.getElementById("seek_slider");

let playlistCont = document.getElementById('mus_playlist');

let track_index = 0;
let isPlaying = false;
let updateTimer;

let curr_track = document.createElement('audio');

let track_list = []

let playlists;

async function loadPlaylists() {
    const response = await fetch("playlists.json");
    playlists = await response.json();
}

function setPlaylist(playlist_index) {
    track_list = playlists[playlist_index];
    updatePlaylistView();
}

function updatePlaylistView() {
    track_list.forEach(track => {
        const trackElement = document.createElement("div");
        trackElement.textContent = `${track.author} - ${track.title}`;

        playlistCont.appendChild(trackElement);
    });
}

function loadTrack(track_index) {
    clearInterval(updateTimer);
    resetValues();

    curr_track.src = track_list[track_index].path;

    curr_track.addEventListener("loadedmetadata", updateDuration, { once: true });

    curr_track.load();

    track_author.textContent = track_list[track_index].author;
    track_title.textContent = track_list[track_index].title;

    updateTimer = setInterval(seekUpdate, 500);

    curr_track.addEventListener("ended", nextTrackWithLoop);
}



function updateDuration() {
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration % 60);
    track_duration.textContent = `${durationMinutes.toString().padStart(2, "0")}:${durationSeconds.toString().padStart(2, "0")}`;

    seek_slider.setAttribute("max", Math.floor(curr_track.duration));
}

function resetValues() {
    track_duration.textContent = "--:--";
}

function seekUpdate() {
    let durationMinutes = Math.floor(curr_track.currentTime / 60);
    let durationSeconds = Math.floor(curr_track.currentTime % 60);
    track_elapsed.textContent = `${durationMinutes.toString().padStart(2, "0")}:${durationSeconds.toString().padStart(2, "0")}`;

    let seekPosition = 0;
    seekPosition = curr_track.currentTime;
    seek_slider.value = seekPosition;
}

function seekTo() {
    let seekCalculated = seek_slider.value;

    curr_track.currentTime = seekCalculated;
    seekUpdate();
}

function setVolume() {
    if (mute_state == 0) {
        curr_track.volume = volume_slider.value /100;
    } else if (mute_state == 1) {
        curr_track.volume = 0;
    }
}

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;

  // Replace icon with the pause icon
  playpause_btn.textContent = '❚❚';

  playpause_btn_cont.classList.add('toggled_button');
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;

  // Replace icon with the play icon
  playpause_btn.textContent = '▶';

  playpause_btn_cont.classList.remove('toggled_button');
}

function nextTrack() {
  // Go back to the first track if the
  // current one is the last in the track list
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;

  // Load and play the new track
  loadTrack(track_index);
  if (isPlaying == true) {playTrack();}
}

function prevTrack() {
  // Go back to the last track if the
  // current one is the first in the track list
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length - 1;
  
  // Load and play the new track
  loadTrack(track_index);
  if (isPlaying == true) {playTrack();}
}

function loop_state_toggle() {
    if (loop_state == 0) {
        loop_state = 1;
        loop_btn_cont.classList.add('toggled_button');
        loop_btn.textContent = '⟳';
    } else if (loop_state == 1) {
        loop_state = 2;
        loop_btn.textContent = '⟺';
    } else if (loop_state == 2) {
        loop_state = 0;
        loop_btn_cont.classList.remove('toggled_button');
        loop_btn.textContent = '↻';
    }
}

function nextTrackWithLoop() {
    if (loop_state == 0) {
        nextTrack();
    } else if (loop_state == 1) {
        loadTrack(track_index);
        playTrack();
    } else if (loop_state == 2) {
        nextTrack();
    }
}

function shuffle_state_toggle() {
    if (shuffle_state == 0) {
        shuffle_state = 1;
        shuffle_btn_cont.classList.add('toggled_button');
    } else if (shuffle_state == 1) {
        shuffle_state = 0;
        shuffle_btn_cont.classList.remove('toggled_button');
    }
}

function toggle_mute_state() {
    if (mute_state == 0) {
        mute_state = 1;
        volume_btn_cont.classList.add('toggled_button');
        volume_btn.textContent = 'X';
        setVolume();
    } else if (mute_state == 1) {
        mute_state = 0;
        volume_btn_cont.classList.remove('toggled_button');
        volume_btn.textContent = '🔊';
        setVolume();
    }
}


async function startUpMusicPlayer() {
    await loadPlaylists();
    setPlaylist(0);
    loadTrack(0);
}

startUpMusicPlayer();