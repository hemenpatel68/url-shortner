import { db } from "../db/index.js";
import { urlsTable } from "../models/index.js";

export const createShortCode = async (shortCode, url, userID) => {
  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode,
      targetURL: url,
      userId: userID,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
    });

  return result;
};
