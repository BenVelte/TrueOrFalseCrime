// Imports the Google Cloud client library
const textToSpeech = require("@google-cloud/text-to-speech");

// Import other required libraries
const { writeFile } = require("node:fs/promises");

process.env.GOOGLE_APPLICATION_CREDENTIALS = "../config/tiktoktruecrime.json";

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

// transform the story into speech and returns its path
async function transformTextToSpeech(text) {
  try {
    const request = {
      input: { text: text },
      voice: { languageCode: "en-US", name: "en-US-Wavenet-I" },
      audioConfig: { audioEncoding: "LINEAR16", speakingRate: 1.2 },
    };
    const [response] = await client.synthesizeSpeech(request);

    // Save the generated binary audio content to a local file
    await writeFile("../assets/audio/story.mp3", response.audioContent, "binary");
    console.log("Voiceover created")
    return "../assets/audio/story.mp3";
  } catch (e) {
    console.log(e);
  }
}
module.exports = transformTextToSpeech;
