import {GoogleGenAI} from "@google/genai"
const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_GEMINI_KEY as string
})
export default ai