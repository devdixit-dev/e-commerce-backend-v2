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
      dob,
      gender,
      alternateContactNumber
    } = req.body;

    let updatePayload: any = {};
    if (contactNumber) updatePayload.contactNumber = contactNumber;
    if (dob) updatePayload.dob = dob;
    if (gender) updatePayload.gender = gender;
    if (alternateContactNumber) updatePayload.alternateContactNumber = alternateContactNumber;

    const update = await User.findByIdAndUpdate(
      (req as any).user.id,
      { contactNumber, dob, gender, alternateContactNumber }
    )
      .select("-__v -isActive -failedLoginAttempts")
      .lean();

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await emailQueue.add(`email:${update.email}`,
      {
        to: update.email,
        subject: `Details Updated`,
        text: `Hello, ${update.name} Your details has been updated successfully.`
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
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(411).json({
        success: false,
        message: 'Password field is required to change your password'
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const change = await User.findByIdAndUpdate(
      (req as any)?.user?.id,
      { password: hash }
    );

    if (!change) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

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
    const remove = await User.findByIdAndUpdate(
      (req as any).user.id,
      { isActive: false }
    );

    if (!remove) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await emailQueue.add(
      `email:${remove.email}`,
      {
        to: remove.email,
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

export const address = async (req: Request, res: Response) => {
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
      message: `Address fetched`,
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
    if (contactPerson) filter.contactPerson = contactPerson;
    if (contactnumber) filter.contactnumber = contactnumber;
    if (addressLineOne) filter.addressLineOne = addressLineOne;
    if (addressLineTwo) filter.addressLineTwo = addressLineTwo;
    if (pincode) filter.pincode = pincode;
    if (locality) filter.locality = locality;
    if (city) filter.city = city;
    if (state) filter.state = state;
    if (country) filter.country = country;

    const add = await User.findByIdAndUpdate(
      (req as any).user.id,
      {
        address: {
          contactPerson,
          contactnumber,
          addressLineOne,
          addressLineTwo,
          pincode,
          locality,
          city,
          state,
          country
        }
      }
    );

    if (!add) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

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

export const updateAddress = async (req: Request, res: Response) => {
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
    if (contactPerson) filter.contactPerson = contactPerson;
    if (contactnumber) filter.contactnumber = contactnumber;
    if (addressLineOne) filter.addressLineOne = addressLineOne;
    if (addressLineTwo) filter.addressLineTwo = addressLineTwo;
    if (pincode) filter.pincode = pincode;
    if (locality) filter.locality = locality;
    if (city) filter.city = city;
    if (state) filter.state = state;
    if (country) filter.country = country;

    const updateAddress = await User.findByIdAndUpdate(
      (req as any).user.id,
      {
        address: {
          contactPerson,
          contactnumber,
          addressLineOne,
          addressLineTwo,
          pincode,
          locality,
          city,
          state,
          country
        }
      }
    );

    if (!updateAddress) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: false,
      message: "Your address was updated"
    });
  }
  catch (error) {
    makeLogFile("error.log", `\n[${new Date().toISOString()}] Error in updating addresse -> ${req.ip}\n`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const wishlist = () => { }

export const addToWishlist = () => { }

export const removeFromWishlist = () => { }