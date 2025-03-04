import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES!;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL!;

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
        return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
    }

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${SHOPIFY_APP_URL}/api/auth/callback`;

    return NextResponse.redirect(authUrl);
}
