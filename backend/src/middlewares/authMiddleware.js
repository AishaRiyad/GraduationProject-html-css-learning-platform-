// backend/src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  console.log("Incoming authorization header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Extracted token:", token);
  }

  if (!token) {
    console.log("No token found in header!");
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    console.log("Token verified, user decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("protect middleware error:", err.message);

  
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "jwt expired" });
    }

    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};


export const requireAuth = protect;
