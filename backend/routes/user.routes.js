import express from "express";
import { db } from "../db/index.js";
import { usersTable } from "../models/index.js";
import {
  loginPostRequestBodySchema,
  signupPostRequestBodySchema,
} from "../validation/request.validation.js";
import { hashPassword } from "../utils/hash.js";
import { getUserByEmail } from "../service/user.service.js";
import { createUserToken } from "../utils/token.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: validationResult.error.issues,
    });
  }

  const { name, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res
      .status(400)
      .json({ message: `User with this ${email} already exists` });
  }

  const { salt, password: hashedPassword } = hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      salt,
    })
    .returning({
      id: usersTable.id,
    });

  return res
    .status(201)
    .json({ message: "User created successfully", data: user });
});

router.post("/login", async (req, res) => {
  const validationResult = await loginPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: validationResult.error.issues,
    });
  }

  const { email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return res
      .status(404)
      .json({ message: `User with email ${email} not found` });
  }

  const { password: hashedPassword } = hashPassword(
    password,
    existingUser.salt,
  );

  if (hashedPassword !== existingUser.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = await createUserToken({
    id: existingUser.id,
  });

  return res.status(200).json({
    message: "Login successful",
    access_token: token,
  });
});
export default router;
