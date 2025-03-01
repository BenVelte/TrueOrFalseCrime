const Story = require("./create_story");
const Video = require("./create_video");
const transformTextToSpeech = require("./audio_manager");
const Subtitles = require("./create_subtitles");

const storyOne = "Tell me a true crime story that can be read in 30 seconds";
const storyTwo =
  "Tell me a fictional true crime story that you created yourself that can be read in 30 seconds. It should be realistic.";

async function main() {
  // Randomize which story is true
  if (Math.random() < 0.5) {
    await Story.getStoryFromAPI(storyOne, storyTwo);
  } else {
    await Story.getStoryFromAPI(storyTwo, storyOne);
  }
  const story = await Story.createStoryFormat();
  let audioPath = await transformTextToSpeech(story);
  let gameplayVideoPath = await Video.getVideo();
  let subtitlePath = await Subtitles.createSubtitles(audioPath);
  await Video.combineAudioWithVideo(audioPath, gameplayVideoPath, subtitlePath);
}
main();
