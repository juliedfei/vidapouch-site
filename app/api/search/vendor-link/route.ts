import {
  NextResponse,
 } from "next/server";
 
 import {
  resolveLiveMerchantOffer,
 } from "@/lib/search/resolveLiveMerchantOffer";
 
 export const runtime =
  "nodejs";
 
 export const dynamic =
  "force-dynamic";
 
 type VendorLinkRequest = {
  retailer?:
    string;
 
  productTitle?:
    string;
 
  bottlePrice?:
    number;
 
  shoppingProductId?:
    string;
 
  immersiveProductPageToken?:
    string;
 
  serpApiImmersiveProductUrl?:
    string;
 };
 
 export async function POST(
  request:
    Request
 ) {
  try {
    const body =
      (await request.json()) as
        VendorLinkRequest;
 
    const retailer =
      body.retailer?.trim() ??
      "";
 
    const productTitle =
      body.productTitle?.trim() ??
      "";
 
    const shoppingProductId =
      body.shoppingProductId
        ?.trim() ||
      null;
 
    const immersiveProductPageToken =
      body
        .immersiveProductPageToken
        ?.trim() ??
      "";
 
    const originalBottlePrice =
      typeof body.bottlePrice ===
        "number" &&
      Number.isFinite(
        body.bottlePrice
      ) &&
      body.bottlePrice >
        0
        ? body.bottlePrice
        : null;
 
    if (!retailer) {
      return NextResponse.json(
        {
          error:
            "Retailer is required.",
        },
        {
          status:
            400,
        }
      );
    }
 
    if (
      !immersiveProductPageToken
    ) {
      return NextResponse.json(
        {
          error:
            "The exact Google Shopping product token is missing.",
        },
        {
          status:
            400,
        }
      );
    }
 
    const offer =
      await resolveLiveMerchantOffer({
        retailer,
 
        productTitle,
 
        bottlePrice:
          originalBottlePrice,
 
        shoppingProductId,
 
        immersiveProductPageToken,
      });
 
    return NextResponse.json(
      offer
    );
  } catch (error) {
    console.error(
      "VidaSearch immersive vendor lookup failed:",
      error
    );
 
    const message =
      error instanceof Error
        ? error.message
        : "Exact vendor lookup failed.";
 
    let status =
      500;
 
    if (
      message.includes(
        "not configured"
      )
    ) {
      status =
        422;
    }
 
    if (
      message.includes(
        "could not be found"
      )
    ) {
      status =
        404;
    }
 
    if (
      message.includes(
        "took too long"
      )
    ) {
      status =
        504;
    }
 
    return NextResponse.json(
      {
        error:
          message,
      },
      {
        status,
      }
    );
  }
 }
 