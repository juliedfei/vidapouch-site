import "server-only";

import {
 createHmac,
 timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_COOKIE =
 "vidapouch_admin_session";

const SESSION_DURATION_SECONDS =
 60 * 60 * 8;

type AdminSessionPayload = {
 email:
   string;

 expiresAt:
   number;
};

function getSessionSecret() {
 const secret =
   process.env
     .ADMIN_SESSION_SECRET;

 if (
   !secret
 ) {
   throw new Error(
     "ADMIN_SESSION_SECRET is not configured."
   );
 }

 return secret;
}

function encodePayload(
 payload:
   AdminSessionPayload
) {
 return Buffer
   .from(
     JSON.stringify(
       payload
     )
   )
   .toString(
     "base64url"
   );
}

function decodePayload(
 encodedPayload:
   string
) {
 try {
   const json =
     Buffer
       .from(
         encodedPayload,
         "base64url"
       )
       .toString(
         "utf8"
       );

   return JSON.parse(
     json
   ) as
     AdminSessionPayload;
 } catch {
   return null;
 }
}

function createSignature(
 encodedPayload:
   string
) {
 return createHmac(
   "sha256",
   getSessionSecret()
 )
   .update(
     encodedPayload
   )
   .digest(
     "base64url"
   );
}

function signaturesMatch(
 receivedSignature:
   string,
 expectedSignature:
   string
) {
 const receivedBuffer =
   Buffer.from(
     receivedSignature
   );

 const expectedBuffer =
   Buffer.from(
     expectedSignature
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

export function createAdminSessionToken(
 email:
   string
) {
 const payload:
   AdminSessionPayload = {
     email,

     expiresAt:
       Math.floor(
         Date.now() /
           1000
       ) +
       SESSION_DURATION_SECONDS,
 };

 const encodedPayload =
   encodePayload(
     payload
   );

 const signature =
   createSignature(
     encodedPayload
   );

 return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
 token:
   string |
   undefined
) {
 if (
   !token
 ) {
   return null;
 }

 const [
   encodedPayload,
   receivedSignature,
 ] =
   token.split(
     "."
   );

 if (
   !encodedPayload ||
   !receivedSignature
 ) {
   return null;
 }

 const expectedSignature =
   createSignature(
     encodedPayload
   );

 if (
   !signaturesMatch(
     receivedSignature,
     expectedSignature
   )
 ) {
   return null;
 }

 const payload =
   decodePayload(
     encodedPayload
   );

 if (
   !payload ||
   typeof payload.email !==
     "string" ||
   typeof payload.expiresAt !==
     "number"
 ) {
   return null;
 }

 const currentTime =
   Math.floor(
     Date.now() /
       1000
   );

 if (
   payload.expiresAt <=
     currentTime
 ) {
   return null;
 }

 return payload;
}

export function getAdminSessionMaxAge() {
 return SESSION_DURATION_SECONDS;
}
