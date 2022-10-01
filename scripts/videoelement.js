	function CreateVideoElement(){
const video = document.createElement("video"); // create a video element
video.src = ""; // set the file path
document.body.append(video); // add it to the page
video.style.display = "none"; // to hide the video
video.muted = true;
return video;
}