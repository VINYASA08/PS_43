import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/webm",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".mp4",
  ".webm",
]);

export interface UploadedFileResponse {
  name: string;
  url: string;
  type: string;
  size: number;
}

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid multipart form data." },
        { status: 400 }
      );
    }

    // Extract all file instances from the FormData payload
    const filesToProcess: File[] = [];
    
    // Check specific fields: "files", "file", or iterate all entries
    const filesField = formData.getAll("files");
    for (const item of filesField) {
      if (item instanceof File && item.name) {
        filesToProcess.push(item);
      }
    }

    const singleFileField = formData.getAll("file");
    for (const item of singleFileField) {
      if (item instanceof File && item.name && !filesToProcess.includes(item)) {
        filesToProcess.push(item);
      }
    }

    // If neither "files" nor "file" was used, scan all FormData entries
    if (filesToProcess.length === 0) {
      for (const [, value] of formData.entries()) {
        if (value instanceof File && value.name) {
          filesToProcess.push(value);
        }
      }
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { error: "No files found in the upload request." },
        { status: 400 }
      );
    }

    // Validate every file before persisting any
    for (const file of filesToProcess) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the maximum allowable size of 10MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
          },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name).toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isValidMime = ALLOWED_MIME_TYPES.has(mimeType);
      const isValidExt = ALLOWED_EXTENSIONS.has(ext);

      if (!isValidMime && !isValidExt) {
        return NextResponse.json(
          {
            error: `File "${file.name}" has an unsupported format. Allowed formats: JPEG, PNG, WebP, PDF, MP4, WebM.`,
          },
          { status: 400 }
        );
      }
    }

    // Ensure target directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const uploadedResults: UploadedFileResponse[] = [];

    for (const file of filesToProcess) {
      const ext = path.extname(file.name).toLowerCase();
      const sanitizedBase = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 50) || "upload";
      
      const timestamp = Date.now();
      const randomEntropy = Math.random().toString(36).substring(2, 8);
      const uniqueFilename = `${sanitizedBase}_${timestamp}_${randomEntropy}${ext}`;
      const destinationPath = path.join(uploadsDir, uniqueFilename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(destinationPath, buffer);

      uploadedResults.push({
        name: file.name,
        url: `/uploads/${uniqueFilename}`,
        type: file.type || ext.replace(".", ""),
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
    });
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process and store uploaded files." },
      { status: 500 }
    );
  }
}
