import { Request, Response } from "express";

import { makeLogFile } from "../utils/logger"

export const profile = (req: Request, res: Response) => {
  try{

  }
  catch(error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in getting profile -> ${req.ip}\n`);
  }
}

export const updateProfile = () => {}

export const changePassword = () => {}

export const removeAccount = () => {}

export const addresses = () => {}

export const addAddress = () => {}

export const updateAddress = () => {}

export const removeAddress = () => {}

export const wishlist = () => {}

export const addToWishlist = () => {}

export const removeFromWishlist = () => {}