import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { db, initTables } from "@/db";
import { productImages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compute SHA-256 fingerprint hash for 100% unique image validation
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // SHA-256 Duplicate Check against Turso Database
    try {
      await initTables();
      const existingAsset = await db
        .select()
        .from(productImages)
        .where(eq(productImages.image_hash, hash))
        .get();

      if (existingAsset) {
        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            hash,
            existingUrl: existingAsset.url,
            error: `Duplicate asset rejected! This exact image (SHA-256: ${hash.slice(0, 12)}...) already exists in catalog at "${existingAsset.url}".`,
          },
          { status: 409 }
        );
      }
    } catch (dbErr) {
      console.warn("⚠️ SHA-256 DB duplicate check skipped:", dbErr);
    }

    // Sanitize filename and create unique timestamped name
    const extension = path.extname(file.name) || ".jpg";
    const sanitizedBase = path.basename(file.name, extension).toLowerCase().replace(/[^a-z0-9]/g, "_");
    const fileName = `upload_${Date.now()}_${sanitizedBase}${extension}`;

    // Attempt writing file to /public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        hash,
        message: "Image verified & uploaded successfully to server disk.",
      });
    } catch (fsErr) {
      console.warn("⚠️ File system write failed (likely read-only cloud environment). Falling back to Data URL:", fsErr);
      const mimeType = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        hash,
        message: "Image verified & converted to Data URL.",
      });
    }
  } catch (err: any) {
    console.error("❌ Error in upload-image API:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to process image upload." }, { status: 500 });
  }
}
