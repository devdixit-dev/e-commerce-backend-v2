import { Request, Response, NextFunction } from 'express';

import { makeLogFile } from '../utils/logger'
import { verifyJwt } from '../services/jwt.service';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.a_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found or invalid"
      });
    }

    const verified = verifyJwt(token);
    if (!verified) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access denied'
      });
    }

    (req as any).user = verified;
    next();
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in auth middleware -> ${req.ip}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.a_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found or invalid"
      });
    }

    const verified = verifyJwt(token);
    if (!verified || verified.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access denied'
      });
    }

    (req as any).user = verified;
    next();
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in admin middleware -> ${req.ip}\n`)

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}