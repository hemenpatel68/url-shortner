import { db } from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";

export const getUserByEmail = async (email) => {
  const [existingUser] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      password: usersTable.password,
      salt: usersTable.salt,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return existingUser;
};
