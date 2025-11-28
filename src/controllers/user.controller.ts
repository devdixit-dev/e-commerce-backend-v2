import { Request, Response } from "express";
import bcrypt from 'bcryptjs';

import { makeLogFile } from "../utils/logger"
import User from "../models/user.model";
import emailQueue from "../queues/email.queue";

export const profile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any)?.user?.id)
      .select('-__v -isActive -failedLoginAttempts')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in getting profile -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const {
      contactNumber,
      address,
      dob,
      gender,
      alternateContactNumber
    } = req.body;

    const user = await User.findById((req as any)?.user?.id)
      .select('-__v -isActive -failedLoginAttempts')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let updatePayload: any = {};

    if (contactNumber) updatePayload.contactNumber = contactNumber;
    if (dob) updatePayload.dob = dob;
    if (gender) updatePayload.gender = gender;
    if (alternateContactNumber) updatePayload.alternateContactNumber = alternateContactNumber;

    await User.updateOne({ _id: user._id }, { $set: updatePayload });

    await emailQueue.add(`email:${user.email}`,
      {
        to: user.email,
        subject: `Details Updated`,
        text: `Hello, ${user.name} Your details has been updated successfully.`
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3
      }
    ).catch(() => { });

    return res.status(200).json({
      success: true,
      message: "Your details has been updated successfully"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in updating profile -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any)?.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(411).json({
        success: false,
        message: 'Password field is required to change your password'
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      user._id,
      { password: hash }
    );

    return res.status(200).json({
      success: true,
      message: "Your password changed successfully"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in changing password -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const removeAccount = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any)?.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await User.findByIdAndUpdate(
      user._id,
      { isActive: false }
    );

    await emailQueue.add(
      `email:${user.email}`,
      {
        to: user.email,
        subject: `Account Removed`,
        text: `Your account is removed successfully.`
      }
    ).catch(() => { });

    res.clearCookie('a_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: "Your account remove successfully"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in removing account -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const addresses = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any)?.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `You have ${user.address.length} addresses`,
      data: user.address
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in getting addresses -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const addAddress = async (req: Request, res: Response) => {
  try {
    const {
      contactPerson,
      contactnumber,
      addressLineOne,
      addressLineTwo,
      pincode,
      locality,
      city,
      state,
      country
    } = req.body;

    let filter: any = {};
    if(contactPerson) filter.contactPerson = contactPerson;
    if(contactnumber) filter.contactnumber = contactnumber;
    if(addressLineOne) filter.addressLineOne = addressLineOne;
    if(addressLineTwo) filter.addressLineTwo = addressLineTwo;
    if(pincode) filter.pincode = pincode;
    if(locality) filter.locality = locality;
    if(city) filter.city = city;
    if(state) filter.state = state;
    if(country) filter.country = country;

    await User.findByIdAndUpdate(
      (req as any).user.id,
      filter
    );

    return res.status(200).json({
      success: true,
      message: "Address added successfully"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in adding addresses -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateAddress = () => { }

export const removeAddress = () => { }

export const wishlist = () => { }

export const addToWishlist = () => { }

export const removeFromWishlist = () => { }