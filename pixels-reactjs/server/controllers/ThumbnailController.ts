import { Request, Response } from "express";
import ThumbnailModel from "../models/ThumbnailModel.js";
import ai from "../configs/ai.js";

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const session = req.session as any;

    // ✅ AUTH CHECK
    if (!session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.userId;

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    // ✅ VALIDATION
    if (!title || !style) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ SAFE PROMPT BUILDING
    const safeStyle = style || "Bold & Graphic";

    let prompt = `Create a catchy YouTube thumbnail idea for: "${title}" in ${safeStyle} style.`;

    if (color_scheme) {
      prompt += ` Use ${color_scheme} color scheme.`;
    }

    if (user_prompt) {
      prompt += ` Additional details: ${user_prompt}`;
    }

    // ✅ AI CALL (SAFE)
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // ✅ SAFE TEXT EXTRACTION
    const text = response.text() || "No AI response";
    console.log("AI TEXT:", text);

    // ✅ PLACEHOLDER IMAGE (since Gemini = text only)
    const imageUrl = `https://via.placeholder.com/1280x720.png?text=${encodeURIComponent(title)}`;

    // ✅ CREATE & SAVE
    const thumbnail = new ThumbnailModel({
      userId,
      title,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      image_url: imageUrl,
      isGenerating: false,
    });

    await thumbnail.save();

    // ✅ RESPONSE
    return res.json({
      message: "Thumbnail generated successfully",
      thumbnail,
      ai_text: text,
    });

  } catch (error: any) {
    console.log("GENERATE ERROR:", error?.message || error);

    return res.status(500).json({
      message: "Something went wrong while generating thumbnail",
    });
  }
};

// ✅ DELETE (unchanged but slightly safer)
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    await ThumbnailModel.findOneAndDelete({ _id: id, userId });
    return res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.log("DELETE ERROR:", error?.message || error);

    return res.status(500).json({
      message: "Failed to delete thumbnail",
    });
  }
};