import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamp
    const extension = path.extname(file.name) || ".jpg";
    const sanitizedBase = path.basename(file.name, extension).toLowerCase().replace(/[^a-z0-9]/g, "_");
    const fileName = `upload_${Date.now()}_${sanitizedBase}${extension}`;

    // Attempt writing to /public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        message: "Image uploaded successfully to server disk.",
      });
    } catch (fsErr) {
      console.warn("⚠️ File system write failed (likely read-only cloud environment). Falling back to Data URL:", fsErr);
      // Fallback for read-only cloud filesystems
      const mimeType = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        message: "Image converted to high-resolution Data URL.",
      });
    }
  } catch (err: any) {
    console.error("❌ Error in upload-image API:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to process image upload." }, { status: 500 });
  }
}
