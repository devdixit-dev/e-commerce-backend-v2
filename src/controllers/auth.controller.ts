import { Request, Response } from 'express'
import bcrypt from 'bcryptjs';

import { makeLogFile } from '../utils/logger'
import User from '../models/user.model';
import SendEmail from '../services/email.service';
import { signJwt } from '../services/jwt.service';

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
    if(!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const matchPass = await bcrypt.compare(password, user.password);
    if(!matchPass) {
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

      const entry = `\n[${new Date().toISOString()}] Sign in -> ${req.ip}\n`
      makeLogFile("sign-in.log", entry);

      await SendEmail(
        user.email,
        `Sign in detected`,
        `We noticed a sign-in to your E commerce API account. If this was you, you don’t need to do anything. If not, we’ll help you secure your account.\n
        You can contact us via email: msi.devdixit@gmail.com`
      );
    }, 3000);

    const payload = {
      id: user._id,
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

    // user.ips.push({ date: new Date(), url: req.originalUrl || req.url, ip: req.ip })
    // user.markModified('ips')
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