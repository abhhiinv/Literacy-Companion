import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log("Initializing Gemini AI with API Key:", API_KEY ? "Present" : "Missing");

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const generateStory = async (level: string, topic: string) => {
  console.log(`Generating story for level: ${level}, topic: ${topic}`);
  
  const prompt = `You are a patient literacy teacher. Generate a very short, engaging story for an adult learner at the ${level} reading level about ${topic}. After the story, provide 3 simple reading comprehension questions with 3 multiple-choice answers each. 

Format the output as JSON with exactly this structure: 
{ 
  "title": "Story Title", 
  "content": "Story content here...", 
  "questions": [
    { "question": "Question text?", "options": ["A", "B", "C"], "answerIndex": 0 }
  ] 
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini raw response:", text);
    
    // Strip code blocks if present
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export default model;
