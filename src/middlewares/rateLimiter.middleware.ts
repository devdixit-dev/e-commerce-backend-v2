import rateLimit from "express-rate-limit";

const customRateLimiter = (time: number, max: number) => {
  return rateLimit({
    windowMs: time,
    max: max,
    message: "Too many requests. Try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Try again later."
      });
    }
  });
}

export default customRateLimiter;