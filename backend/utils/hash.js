import { createHmac, randomBytes } from "node:crypto";

export const hashPassword = (password, userSalt = undefined) => {
  const salt = userSalt ?? randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return {
    salt,
    password: hashedPassword,
  };
};
