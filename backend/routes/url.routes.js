import express from "express";
import {
  shortenPostRequestBodySchema,
  urlIdParamsSchema,
  updateUrlRequestBodySchema,
} from "../validation/request.validation.js";
import { db } from "../db/index.js";
import { urlsTable } from "../models/index.js";
import { nanoid } from "nanoid";
import { ensureAuthenticated } from "../middleware/auth.middleware.js";
import { createShortCode } from "../service/url.service.js";
import { and, eq } from "drizzle-orm";

const router = express.Router();

const getDatabaseErrorCode = (error) => error?.cause?.code ?? error?.code;

router.post("/shorten", ensureAuthenticated, async (req, res) => {
  const validationResult = await shortenPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: validationResult.error.issues,
    });
  }

  const { url, code } = validationResult.data;

  const shortCode = code ?? nanoid(6);

  const userID = req.user.id;

  try {
    const [existingShortUrl] = await db
      .select()
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, shortCode));

    if (existingShortUrl) {
      return res.status(409).json({
        message: `Short code "${shortCode}" is already in use`,
      });
    }

    const result = await createShortCode(shortCode, url, userID);

    return res.status(201).json(result);
  } catch (error) {
    const databaseErrorCode = getDatabaseErrorCode(error);

    if (databaseErrorCode === "23505") {
      return res.status(409).json({
        message: `Short code "${shortCode}" is already in use`,
      });
    }

    if (databaseErrorCode === "23503") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/allShortUrls", ensureAuthenticated, async (req, res) => {
  const shortUrls = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, req.user.id));

  return res.status(200).json({ shortUrls });
});

router.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  const [result] = await db
    .select({
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
    })
    .from(urlsTable)
    .where(eq(urlsTable.shortCode, shortCode));

  if (!result) {
    return res.status(404).json({ message: "Invalid URL" });
  }

  return res.redirect(result.targetURL);
});

router.patch("/:id", ensureAuthenticated, async (req, res) => {
  const paramsValidationResult = await urlIdParamsSchema.safeParseAsync(
    req.params,
  );

  if (!paramsValidationResult.success) {
    return res.status(400).json({
      message: "Invalid URL id",
      errors: paramsValidationResult.error.issues,
    });
  }

  const { id } = paramsValidationResult.data;
  const validationResult = await updateUrlRequestBodySchema.safeParseAsync(
    req.body,
  );
  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: validationResult.error.issues,
    });
  }

  const { url, code } = validationResult.data;

  const userId = req.user.id;

  const [existingUrl] = await db
    .select()
    .from(urlsTable)
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, userId)));

  if (!existingUrl) {
    return res.status(404).json({
      message: "URL not found or unauthorized",
    });
  }

  const updateData = {};

  if (url) {
    updateData.targetURL = url;
  }

  if (code) {
    updateData.shortCode = code;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      message: "Nothing to update",
    });
  }

  try {
    const [updatedUrl] = await db
      .update(urlsTable)
      .set(updateData)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, userId)))
      .returning();

    return res.status(200).json({
      message: "URL updated successfully",
      data: updatedUrl,
    });
  } catch (error) {
    if (getDatabaseErrorCode(error) === "23505") {
      return res.status(409).json({
        message: `Short code "${code}" is already in use`,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  const paramsValidationResult = await urlIdParamsSchema.safeParseAsync(
    req.params,
  );

  if (!paramsValidationResult.success) {
    return res.status(400).json({
      message: "Invalid URL id",
      errors: paramsValidationResult.error.issues,
    });
  }

  const { id } = paramsValidationResult.data;
  const [deletedUrl] = await db
    .delete(urlsTable)
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)))
    .returning({ id: urlsTable.id });

  if (!deletedUrl) {
    return res.status(404).json({
      message: "URL not found or unauthorized",
    });
  }

  return res.status(200).json({ message: "URL deleted successfully" });
});

export default router;
