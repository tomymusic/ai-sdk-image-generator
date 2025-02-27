import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";

export async function POST(req: NextRequest) {
  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(new NextResponse(JSON.stringify({ error: "Error parsing form data" }), { status: 500 }));
        return;
      }

      const prompt = fields.prompt?.[0] || "";
      const imageFile = files.image?.[0];

      if (!imageFile || !prompt) {
        resolve(new NextResponse(JSON.stringify({ error: "Image and prompt are required" }), { status: 400 }));
        return;
      }

      const imageBuffer = fs.readFileSync(imageFile.filepath);
      const imageBase64 = imageBuffer.toString("base64");

      try {
        const response = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
            input: {
              prompt,
              image: `data:image/png;base64,${imageBase64}`,
            },
          }),
        });

        const data = await response.json();
        resolve(new NextResponse(JSON.stringify({ image_url: data.output }), { status: 200 }));
      } catch (error) {
        resolve(new NextResponse(JSON.stringify({ error: "Failed to generate image" }), { status: 500 }));
      }
    });
  });
}
