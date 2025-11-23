import { Request, Response } from 'express'

import { makeLogFile } from '../utils/logger'

export const authInit = async (req: Request, res: Response) => {
  try{
    const {name, email, password} = req.body;
  }
  catch(error) {
    const entry = `[${new Date().toISOString()}] Error in auth init -> ${req.ip}`
    makeLogFile("error.log", entry)

    return res.json({
      success: false,
      message: 'Internal server error'
    });
  }
}