import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validation/token.validation.js";

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  throw new Error("JWT_SECRET is missing");
};

export const createUserToken = async (payload) => {
  const validationResult = await userTokenSchema.safeParseAsync(payload);

  if (!validationResult.success) {
    console.error(validationResult.error.issues);
    throw new Error("Token validation failed");
  }

  const validatedPayload = validationResult.data;
  const token = jwt.sign(validatedPayload, getJwtSecret(), { expiresIn: "1h" });

  return token;
};

export const validateUserToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, getJwtSecret());
    const validationResult = await userTokenSchema.safeParseAsync(decodedToken);

    if (!validationResult.success) {
      return null;
    }

    return validationResult.data;
  } catch (error) {
    return null;
  }
};
