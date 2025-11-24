import { Request, Response } from 'express'

import { makeLogFile } from '../utils/logger'
import User from '../models/user.model';
import RedisClient from '../config/redis.config';
import { signJwt } from '../services/jwt.service';
import SendEmail from '../services/email.service';

export const authInit = async (req: Request, res: Response) => {
  try{
    const {name, email, password} = req.body;

    const user = await User.findOne({ email });
    if(user) {
      return res.status(400).json({
        success: false,
        message: 'User already exist'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const payload = { name, email, password, otp };
    const key = signJwt(JSON.stringify(payload));

    await RedisClient.set(`${key}`, JSON.stringify(payload), "EX", 120)

    await SendEmail(
      email,
      `Welcome to the E-commerce API - Verification`,
      `Kindly verify your account. Your verification OTP is ${otp}.`
    );

    const entry = `\n[${new Date().toISOString()}] Auth init -> IP: ${req.ip} | Name: ${name} | Email: ${email}\n`
    makeLogFile("auth-init.log", entry);

    res.cookie('v_token', key, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });

    return res.status(200).json({
      success: true,
      message: `We've sent you the OTP for verification. kindly check your email to verify your account.`
    })
  }
  catch(error) {
    const entry = `[${new Date().toISOString()}] Error in auth init -> ${req.ip}`
    makeLogFile("error.log", entry)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}