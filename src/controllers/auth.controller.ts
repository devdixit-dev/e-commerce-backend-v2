import { Request, Response } from 'express'
import bcrypt from 'bcryptjs';

import { makeLogFile } from '../utils/logger'
import User from '../models/user.model';
import SendEmail from '../services/email.service';

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