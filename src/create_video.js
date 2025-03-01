const fs = require("fs");
const path = require("path");
const videoFolderPath = "../assets/videos";
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
ffmpeg.setFfprobePath(ffprobePath);  // Path to ffprobe
ffmpeg.setFfmpegPath(ffmpegPath);

// Return the path of an random gameplay video
async function getVideo() {
  const files = await fs.promises.readdir(videoFolderPath);

  // Filter video files (you can add more extensions if needed)
  const videoFiles = files.filter((file) =>
    [".mp4", ".avi", ".mov", ".mkv"].includes(path.extname(file).toLowerCase())
  );

  // Check if there are video files in the folder
  if (videoFiles.length === 0) {
    console.log("No video files found in the folder.");
    return;
  }

  // Pick a random video from the list
  const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];

  // Get the full path to the video file
  const videoPath = path.join(videoFolderPath, randomVideo);
  return videoPath;
}

// Get the duration of the audio file
const getAudioDuration = (audioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
};

// combine audio file with random video file and subtitles
async function combineAudioWithVideo(audioPath, videoPath, subtitlePath) {
  if (!audioPath || !videoPath) {
    throw new Error("Audio or video path is missing!");
  }

  // Get the audio duration
  const audioDuration = await getAudioDuration(audioPath);
  ffmpeg()
    .input(videoPath) // Add video input
    .input(audioPath) // Add audio input
    .input("../assets/audio/background_music.mp3") // Add background music
    .input(subtitlePath) // Subtitle input
    .complexFilter([
      "[1:a]volume=1.0[audionarration]", // Set narration volume
      "[2:a]volume=0.3[bgmusic]", // Reduce background music volume
      "[audionarration][bgmusic]amix=inputs=2:duration=shortest:dropout_transition=3[audio]", // Mix audio
    ])
    .outputOptions([
      "-c:v libx264", // Re-encode the video with H.264 codec
      "-c:a aac", // Encode audio as AAC
      "-b:a 192k", // Set audio bitrate (adjust as needed)
      "-map 0:v:0", // Ensure the first video stream is used
      "-map [audio]", // Use the mixed audio
      `-vf subtitles=${subtitlePath.replace(/\\/g, '/')}:force_style='Alignment=10,BorderStyle=0,Outline=1,Shadow=0,Fontsize=11,PrimaryColour=&HFFFFFF&'"`,  // Customize subtitle appearance
      `-t ${audioDuration}`, // Trim video to match audio duration
    ])
    .save("../finalVideo.mp4") // Define output file
    .on("end", () =>
      console.log("Merging completed of" + audioPath + videoPath)
    )
    .on("Error while creating video: ", (err) => console.error("Error:", err));
}

module.exports = { getVideo, combineAudioWithVideo };
