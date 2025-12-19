import Cart from "../models/cart.model";
import handleResponse from "../services/handleResponse.service";
import { makeLogFile } from "../utils/logger";
import {Request, Response} from 'express';

export const getCartItems = async (req: Request, res: Response) => {
  try{
    const user = (req as any).user.id;

    const getItems = await Cart.find({ addedBy: user.id });
    if(!getItems) {
      handleResponse(res, 404, "There is no items found in your cart", getItems);
    }
  }
  catch(error) {
    console.error(`Error getting cart items: ${error}`);
    makeLogFile('error.log', `\n[${new Date().toISOString()}] Error in getting cart items -> ${req.ip} - Error ${error}\n`);
    handleResponse(res, 500, "Internal server error");
  }
}