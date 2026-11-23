import jwt from "jwt-simple";

const jwtSecret = process.env.JWT_SECRET || "local-dev-secret-key";

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.decode(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
