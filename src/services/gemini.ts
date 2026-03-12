import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a patient and supportive literacy teacher for adults. Your goal is to help adults learn to read and write through interactive, engaging stories. Keep stories simple, age-appropriate (for adults), and tailored to their current reading level (e.g., beginner, intermediate, advanced). Provide positive reinforcement and encourage them at every step. Use simple vocabulary but meaningful adult themes like family, work, community, and personal growth."
});

export const generateStory = async (level: string, topic: string) => {
  const prompt = `Generate a very short, engaging story for an adult learner at the ${level} reading level. The story should be about ${topic}. After the story, provide 3 simple reading comprehension questions with 3 multiple-choice answers each. Format the output as JSON with the following structure: { "title": "...", "content": "...", "questions": [{ "question": "...", "options": ["...", "...", "..."], "answerIndex": 0 }] }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Strip code blocks if present
  const jsonString = text.replace(/```json|```/g, "").trim();
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to generate a valid story format.");
  }
};

export default model;
