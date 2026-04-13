import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const ai = new GoogleGenerativeAI(
  process.env.GOOGLE_GEMINI_KEY as string
);

export default ai;