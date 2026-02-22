import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveUpload } from "~/server/upload-store";
import { parseOffice } from "officeparser";
import { htmlToText } from "~/utils/html-to-text";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse") as (
  buffer: Buffer,
) => Promise<{ text: string }>;

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name;
    const ct = file.type || "";
    let text = "";

    if (ct === "application/pdf" || name.endsWith(".pdf")) {
      const pdf = await pdfParse(buffer);
      text = pdf.text;
    } else if (
      ct.includes("presentation") ||
      ct.includes("powerpoint") ||
      ct.includes("wordprocessing") ||
      ct.includes("msword") ||
      ct.includes("spreadsheet") ||
      ct.includes("excel") ||
      /\.(pptx?|docx?|xlsx?)$/i.test(name)
    ) {
      const ast = await parseOffice(buffer);
      text = ast.toText();
    } else if (ct.includes("html") || name.endsWith(".html") || name.endsWith(".htm")) {
      text = htmlToText(buffer.toString("utf-8"));
    } else if (
      ct.startsWith("text/") ||
      ct.includes("json") ||
      ct.includes("rtf") ||
      name.endsWith(".txt") ||
      name.endsWith(".json") ||
      name.endsWith(".rtf")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from this file" },
        { status: 400 },
      );
    }

    const id = randomUUID();
    saveUpload(id, name, text);

    return NextResponse.json({ id, name });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 },
    );
  }
}
