import { Request, Response } from "express";

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

    const {
      contactPerson,
      contactnumber,
      pincode,
      locality,
      city,
      state,
      country
    } = address || {};

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

    if (address) {
      if (contactPerson) updatePayload["address.contactPerson"] = contactPerson;
      if (contactnumber) updatePayload["address.contactnumber"] = contactnumber;
      if (pincode) updatePayload["address.pincode"] = pincode;
      if (locality) updatePayload["address.locality"] = locality;
      if (city) updatePayload["address.city"] = city;
      if (state) updatePayload["address.state"] = state;
      if (country) updatePayload["address.country"] = country;
    }

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
    ).catch(() => {});

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

export const changePassword = () => { }

export const removeAccount = () => { }

export const addresses = () => { }

export const addAddress = () => { }

export const updateAddress = () => { }

export const removeAddress = () => { }

export const wishlist = () => { }

export const addToWishlist = () => { }

export const removeFromWishlist = () => { }