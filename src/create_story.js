const fs = require("fs").promises;
require("dotenv").config({ path: "../.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const jsonFile = "../assets/story.json";

// API Request to AI which tells two storys and stores them into the json file
async function getStoryFromAPI(promptOne, promptTwo) {
  const genAI = new GoogleGenerativeAI(process.env.geminiAPIKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const resultOne = await model.generateContent(promptOne);
  const resultTwo = await model.generateContent(promptTwo);

  await updateJSONFile(resultOne.response.text(), resultTwo.response.text());
  console.log("Story created");
}

// Update the json file with the new AI story
async function updateJSONFile(storyOne, storyTwo) {
  try {
    let jsonData = JSON.parse(await fs.readFile(jsonFile, "utf-8"));

    jsonData.story.one = storyOne;
    jsonData.story.two = storyTwo;

    await fs.writeFile(jsonFile, JSON.stringify(jsonData, null, 2), "utf-8");
  } catch (e) {
    console.log("Error while updating the JSON file: " + e);
  }
}

// Create the story format from the json file and returns the final string
async function createStoryFormat() {
  let finalStory;
  const data = await fs.readFile(jsonFile, "utf8");
  const jsonData = JSON.parse(data);
  finalStory =
    jsonData.general.introduction +
    jsonData.general.title_one +
    jsonData.story.one +
    jsonData.general.title_two +
    jsonData.story.two +
    jsonData.general.outro;
  return finalStory;
}
module.exports = { createStoryFormat, getStoryFromAPI };
