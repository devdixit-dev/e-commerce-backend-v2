import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export const signJwt = (payload: string) => {
  try{
    if(!payload) return null;

    const signed = jwt.sign(JSON.parse(payload), `${secret}`, { expiresIn: '5m' });
    return signed;
  }
  catch(error) {
    console.error(`signing jwt error - ${error}`);
    return null
  }
}

export const verifyJwt = (token: string) => {
  try{
    if(!token) return null;

    const verified = jwt.verify(token, `${secret}`);
    return verified
  }
  catch(error) {
    console.error(`verifying jwt error - ${error}`);
    return null;
  }
}