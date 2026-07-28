import {
    timingSafeEqual,
   } from "node:crypto";
   
   import {
    NextResponse,
   } from "next/server";
   
   import {
    ADMIN_SESSION_COOKIE,
    createAdminSessionToken,
    getAdminSessionMaxAge,
   } from "@/lib/admin/adminSession";
   
   export const runtime =
    "nodejs";
   
   type LoginRequestBody = {
    email?:
      string;
   
    password?:
      string;
   };
   
   function secureTextMatches(
    received:
      string,
    expected:
      string
   ) {
    const receivedBuffer =
      Buffer.from(
        received
      );
   
    const expectedBuffer =
      Buffer.from(
        expected
      );
   
    if (
      receivedBuffer.length !==
        expectedBuffer.length
    ) {
      return false;
    }
   
    return timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    );
   }
   
   export async function POST(
    request:
      Request
   ) {
    try {
      const configuredEmail =
        process.env
          .ADMIN_EMAIL
          ?.trim()
          .toLowerCase();
   
      const configuredPassword =
        process.env
          .ADMIN_PASSWORD;
   
      if (
        !configuredEmail ||
        !configuredPassword
      ) {
        console.error(
          "Admin login credentials are not configured."
        );
   
        return NextResponse.json(
          {
            error:
              "Admin login is not configured.",
          },
          {
            status:
              500,
          }
        );
      }
   
      const body =
        await request.json() as
          LoginRequestBody;
   
      const email =
        body.email
          ?.trim()
          .toLowerCase() ??
        "";
   
      const password =
        body.password ??
        "";
   
      const emailMatches =
        secureTextMatches(
          email,
          configuredEmail
        );
   
      const passwordMatches =
        secureTextMatches(
          password,
          configuredPassword
        );
   
      if (
        !emailMatches ||
        !passwordMatches
      ) {
        return NextResponse.json(
          {
            error:
              "The email address or password is incorrect.",
          },
          {
            status:
              401,
          }
        );
      }
   
      const token =
        createAdminSessionToken(
          configuredEmail
        );
   
      const response =
        NextResponse.json({
          success:
            true,
        });
   
      response.cookies.set(
        ADMIN_SESSION_COOKIE,
        token,
        {
          httpOnly:
            true,
   
          secure:
            process.env
              .NODE_ENV ===
            "production",
   
          sameSite:
            "lax",
   
          path:
            "/",
   
          maxAge:
            getAdminSessionMaxAge(),
        }
      );
   
      return response;
    } catch (
      error
    ) {
      console.error(
        "Unable to complete admin login:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "Unable to sign in. Please try again.",
        },
        {
          status:
            500,
        }
      );
    }
   }