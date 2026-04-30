import { validateUserToken } from "../utils/token.js";

export const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next();
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization must start with Bearer" });
  }

  const [, token] = authHeader.split(" ");

  const decodedToken = await validateUserToken(token);

  if (!decodedToken) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  req.user = decodedToken;
  next();
};

export const ensureAuthenticated = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
