import { Request, Response } from "express";
import ThumbnailModel from "../models/ThumbnailModel.js";

export const getUsersThumbnails = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    const thumbnail = await ThumbnailModel.find({ userId }).sort({
      createdAt: -1,
    });
    res.json({ thumbnail });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    const { id } = req.params;
    const thumbnail = await ThumbnailModel.findOne({
      userId,
      _id: id,
    });
    res.json({ thumbnail });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};