import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

interface JwtPayloadType {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean
}

export const signJwt = (payload: JwtPayloadType): string | null => {
  try {
    if (!payload) return null;

    return jwt.sign(payload, secret, { expiresIn: '30m' });
  } catch (error) {
    console.error(`signJwt error: ${error}`);
    return null;
  }
};

export const verifyJwt = (token: string): JwtPayloadType | null => {
  try {
    if (!token) return null;

    // jwt.verify can return: string | JwtPayload
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Validate shape
    if (typeof decoded !== 'object' || !decoded.id) {
      return null;
    }

    return decoded as JwtPayloadType;
  } catch (error) {
    console.error(`verifyJwt error: ${error}`);
    return null;
  }
};