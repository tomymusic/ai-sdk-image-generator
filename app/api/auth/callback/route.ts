import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL!;

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    const code = url.searchParams.get("code");
    const hmac = url.searchParams.get("hmac");

    if (!shop || !code || !hmac) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verificar HMAC (seguridad)
    const params = new URLSearchParams(url.searchParams);
    params.delete("hmac");
    const sortedParams = [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const calculatedHmac = crypto
        .createHmac("sha256", SHOPIFY_API_SECRET)
        .update(new URLSearchParams(sortedParams).toString())
        .digest("hex");

    if (calculatedHmac !== hmac) {
        return NextResponse.json({ error: "HMAC validation failed" }, { status: 400 });
    }

    // Intercambiar el código por un Access Token
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET,
            code,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        return NextResponse.json({ error: "Failed to get access token" }, { status: 400 });
    }

    const accessToken = data.access_token;

    // Guardar el token en una base de datos (de momento, lo devolvemos como respuesta)
    return NextResponse.json({ success: true, access_token: accessToken });
}
