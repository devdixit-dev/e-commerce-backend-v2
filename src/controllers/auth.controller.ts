import { Request, Response } from 'express'
import bcrypt from 'bcryptjs';

import { makeLogFile } from '../utils/logger'
import User from '../models/user.model';
import { signJwt } from '../services/jwt.service';
import RedisClient from '../config/redis.config';
import emailQueue from '../queues/email.queue';
import loggerQueue from '../queues/logger.queue';

export const authInit = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exist'
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await User.create({
      name, email, password: hashPassword
    });

    await emailQueue.add(`email:${email}`,
      {
        to: email,
        subject: `Welcome Email`,
        text: `Welcome ${name} to the E-commerce API. Your account is successfully created with email ${email}.`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    ).catch(() => { });

    await loggerQueue.add(`log:${req.ip}`,
      {
        filename: "auth-init.log",
        entry: `\n[${new Date().toISOString()}] Auth init -> IP: ${req.ip} | Name: ${name} | Email: ${email}\n`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    ).catch(() => { });

    return res.status(200).json({
      success: true,
      message: `Welcome to the E-commerce API. Your account is created. You can do login now.`
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in auth init -> ${req.ip} - Error ${error}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found or removed'
      });
    }

    const matchPass = await bcrypt.compare(password, user.password);
    if (!matchPass) {
      if (user.failedLoginAttempts >= 3) {
        return res.status(403).json({
          success: false,
          message: "Your account is locked cause of 3 failed login attempts. Contact admin"
        });
      }

      user.failedLoginAttempts += 1;
      await user.save();

      return res.status(403).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.isVerified
    }

    const encypted = signJwt(payload);

    res.cookie('a_token', encypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000
    });

    await loggerQueue.add(`log:${req.ip}`,
      {
        filename: "sign-in.log",
        entry: `\n[${new Date().toISOString()}] Sign in init -> IP: ${req.ip} | ID: ${user._id}\n`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    );

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token: encypted
    });
  }
  catch (error) {
    console.error(error);
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in sign in -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const signOut = async (req: Request, res: Response) => {
  try {
    res.clearCookie('a_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });

    await loggerQueue.add(`log:${req.ip}`,
      {
        filename: "sign-out.log",
        entry: `\n[${new Date().toISOString()}] Sign out -> IP: ${req.ip}\n`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    );

    return res.status(200).json({
      success: true,
      message: 'User logged out'
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in sign out -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    await RedisClient.set(`otp:${user._id}`, otp, "EX", 120);

    await emailQueue.add(`email:${email}`,
      {
        to: user.email,
        subject: `Forgot Password`,
        text: `Your verification OTP is ${otp}. This otp will valid only for 2 minutes`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    );

    return res.status(200).json({
      success: true,
      message: `We've sent you the verification OTP on your email`
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in forgot password -> ${req.ip} - Error ${error}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const stored = await RedisClient.get(`otp:${user._id}`);
    if (!stored || stored !== String(otp)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect OTP"
      });
    }

    await User.findByIdAndUpdate(
      user._id,
      { isVerified: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Your email is verified'
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in verifying email -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(411).json({
        success: false,
        message: "Password not match"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const stored = await RedisClient.get(`otp:${user._id}`);
    if (!stored || stored !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await User.findByIdAndUpdate(
      user._id,
      { password: hashed }
    );

    await emailQueue.add(`email:${user?.email}`,
      {
        to: user?.email,
        subject: `Your password reset successfully`,
        text: `Hello, ${user?.name}. Your password is just changed. If this is not you, then you can contact us on email: msi.devdixit@gmail.com`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    );

    res.clearCookie('a_token');

    return res.status(200).json({
      success: true,
      message: 'Your password reset successfully'
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in reset password -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: false,
        message: "Your email is already verified"
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    await RedisClient.set(`otp:${user._id}`, otp, "EX", 120);

    await emailQueue.add(`email:${email}`,
      {
        to: user.email,
        subject: `Forgot Password - Verify Your Account`,
        text: `Your verification OTP is ${otp}. This otp will valid only for 2 minutes`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    );

    return res.status(200).json({
      success: true,
      message: "Verification mail sent"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in reset password -> ${req.ip} - Error ${error}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}