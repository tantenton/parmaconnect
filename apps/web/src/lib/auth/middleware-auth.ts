"use server";

import { jwtVerify } from "jose";
import { env } from "@/lib/env";

const SESSION_COOKIE = "parmaconnect_session";

export interface MiddlewareSessionPayload {
  userId: string;
  communityId: string;
  role: string;
  sessionId: string;
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export async function verifySessionToken(
  token: string,
): Promise<MiddlewareSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as MiddlewareSessionPayload;
  } catch {
    return null;
  }
}
