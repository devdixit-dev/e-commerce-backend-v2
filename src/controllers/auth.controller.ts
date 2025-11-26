import { Request, Response } from 'express'
import bcrypt from 'bcryptjs';

import { makeLogFile } from '../utils/logger'
import User from '../models/user.model';
import SendEmail from '../services/email.service';
import { signJwt, verifyJwt } from '../services/jwt.service';
import RedisClient from '../config/redis.config';

export const authInit = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exist'
      });
    }

    setTimeout(async () => {
      const hashPassword = await bcrypt.hash(password, 12);

      await User.create({
        name, email, password: hashPassword
      });

      await SendEmail(
        email,
        `Welcome Email`,
        `Welcome ${name} to the E-commerce API. Your account is successfully created with email ${email}.`
      );

      const entry = `\n[${new Date().toISOString()}] Auth init -> IP: ${req.ip} | Name: ${name} | Email: ${email}\n`
      makeLogFile("auth-init.log", entry);
    }, 3000);

    return res.status(200).json({
      success: true,
      message: `Welcome to the E-commerce API. Your account is created. You can do login now.`
    });
  }
  catch (error) {
    const entry = `\n[${new Date().toISOString()}] Error in auth init -> ${req.ip}\n`
    makeLogFile("error.log", entry)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const matchPass = await bcrypt.compare(password, user.password);
    if (!matchPass) {
      return res.status(403).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    setTimeout(async () => {
      await User.findByIdAndUpdate(
        user._id,
        { ips: { date: new Date, url: req.originalUrl || req.url, ip: req.ip } },
        { new: true }
      );

      const entry = `\n[${new Date().toISOString()}] Sign in init -> IP: ${req.ip} | ID: ${user._id}\n`
      makeLogFile("sign-in.log", entry);
    }, 3000);

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      verified: user.isVerified
    }

    const encypted = signJwt(payload);

    res.cookie('a_token', encypted, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token: encypted
    });
  }
  catch (error) {
    const entry = `\n[${new Date().toISOString()}] Error in sign in -> ${req.ip}\n`
    makeLogFile("error.log", entry)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const signOut = async (req: Request, res: Response) => {
  try {
    const id = (req as any).user.id

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    setTimeout(() => {
      const entry = `\n[${new Date().toISOString()}] Sign out init -> IP: ${req.ip} | ID: ${user._id}\n`
      makeLogFile("sign-out.log", entry);
    }, 3000)

    res.clearCookie('a_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'User logged out'
    });
  }
  catch (error) {
    const entry = `\n[${new Date().toISOString()}] Error in sign out -> ${req.ip}\n`
    makeLogFile("error.log", entry)

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

    const makeOTP = Math.floor(100000 + Math.random() * 900000);
    const otp = makeOTP.toString();

    setTimeout(async () => {
      await SendEmail(
        user.email,
        `Forgot Password - Verify Your Account`,
        `Your verification OTP is ${otp}. This otp will remain only for 2 minutes`
      );
    }, 3000)

    await RedisClient.set(user._id.toString(), otp, "EX", 120);

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      verified: user.isVerified
    }

    const encypted = signJwt(payload);

    res.cookie('v_token', encypted, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: `We've sent you the verification OTP on your email`,
      token: encypted
    });
  }
  catch (error) {
    const entry = `\n[${new Date().toISOString()}] Error in forgot password -> ${req.ip}\n`
    makeLogFile("error.log", entry)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if(!otp) {
      return res.status(411).json({
        success: false,
        message: 'OTP is required to verify your email'
      });
    }

    const token = req.cookies.v_token;
    if(!token) { 
      return res.status(404).json({
        success: false,
        message: 'Token not provided or invalid'
      });
    }

    const decrypted = verifyJwt(token);

    const storedOTP = await RedisClient.get(decrypted?.id || "")
    
    if(otp !== storedOTP) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect OTP'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Now you can reset your password',
      
    });
  }
  catch (error) {
    const entry = `\n[${new Date().toISOString()}] Error in forgot password -> ${req.ip}\n`
    makeLogFile("error.log", entry)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try{
    const { newPassword, confirmNewPassword } = req.body;

    if(newPassword !== confirmNewPassword) {
      return res.status(411).json({
        success: false,
        message: "Password not match"
      });
    }

    const decryptedUser = verifyJwt(req.cookies.v_token);
    const hashPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findByIdAndUpdate(
      decryptedUser?.id,
      { password: hashPassword },
      { new: true }
    ).lean();

    setTimeout(async () => {
      await SendEmail(
        String(decryptedUser?.email),
        `Your password reset successfully`,
        `Hello, ${decryptedUser?.name}. Your password is just changed. If this is not you, then you can contact us on email: msi.devdixit@gmail.com`
      )
    }, 3000);

    res.clearCookie('v_token');

    return res.status(200).json({
      success: true,
      message: 'Your password reset successfully'
    });
  }
  catch(error) {
    const entry = `\n[${new Date().toISOString()}] Error in reset password -> ${req.ip}\n`
    makeLogFile("error.log", entry)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}