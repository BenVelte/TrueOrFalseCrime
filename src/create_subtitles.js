const path = require("path");
require("dotenv").config({ path: "../.env" });
const fs = require("fs").promises;
const revai = require("revai-node-sdk");

async function createSubtitles(audioPath) {
  try {
    const client = new revai.RevAiApiClient(process.env.revAIKey);

    // Submit job and handle errors
    let job;
    try {
      job = await client.submitJobLocalFile(audioPath);
    } catch (err) {
      console.error("Error submitting job:", err);
      return;
    }

    console.log("Waiting for transcription...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 seconds before checking again
    try {
      let captions = await client.getCaptions(job.id);
      console.log("Transcription successfull");
      const outputFilePath = path.join("../assets/subtitles", "captions.srt");
      await fs.writeFile(outputFilePath, captions);
      console.log("Subtitles created and saved");
      return outputFilePath;
    } catch (err) {
      console.error("Error fetching job status:", err);
    }
  } catch (e) {
    console.log("Error while saving the subtitles: " + JSON.stringify(e));
  }
}
module.exports = { createSubtitles };
