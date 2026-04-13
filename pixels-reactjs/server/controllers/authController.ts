import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("REGISTER BODY:", req.body); 
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    (req.session as any).isLoggedIn = true;
    (req.session as any).userId = newUser._id;
    return res.json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log("LOGIN BODY:", req.body); 
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password as string
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    (req.session as any).isLoggedIn = true;
    (req.session as any).userId = user._id;
    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((error: any) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }

    return res.json({ message: "Logout successfully" });
  });
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    if (!session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(session.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    return res.json({ user });
  } catch (error: any) {
    console.log("VERIFY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};