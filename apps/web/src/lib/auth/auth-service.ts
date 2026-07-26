"use server";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "parmaconnect_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PRIVILEGED_SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours for admin

export interface SessionPayload extends JWTPayload {
  userId: string;
  communityId: string;
  role: string;
  sessionId: string;
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(
  payload: SessionPayload,
  isPrivileged = false,
): Promise<string> {
  const duration = isPrivileged
    ? PRIVILEGED_SESSION_DURATION_MS
    : SESSION_DURATION_MS;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + duration) / 1000))
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  communityId: string,
  role: string,
  ipAddress?: string,
  userAgent?: string,
  isPrivileged = false,
): Promise<{ token: string; sessionId: string }> {
  // Create DB session record
  const session = await db.session.create({
    data: {
      userId,
      sessionToken: crypto.randomUUID(),
      expires: new Date(
        Date.now() +
          (isPrivileged ? PRIVILEGED_SESSION_DURATION_MS : SESSION_DURATION_MS),
      ),
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });

  // Create JWT
  const payload: SessionPayload = {
    userId,
    communityId,
    role,
    sessionId: session.id,
  };
  const token = await createSessionToken(payload, isPrivileged);

  return { token, sessionId: session.id };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function revokeSession(sessionId: string) {
  await db.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export async function revokeAllUserSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

export async function login(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: true; user: { id: string; name: string; role: string; communityId: string } } | { success: false; error: string }> {
  const user = await db.user.findFirst({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.passwordHash) {
    return { success: false, error: "Email atau kata sandi salah" };
  }

  if (user.status !== "ACTIVE") {
    return { success: false, error: "Akun tidak aktif atau dinonaktifkan" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Email atau kata sandi salah" };
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create session
  const isPrivileged = ["SUPER_ADMIN", "ADMIN"].includes(user.role);
  const { token } = await createSession(
    user.id,
    user.communityId,
    user.role,
    ipAddress,
    userAgent,
    isPrivileged,
  );

  await setSessionCookie(token);

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name ?? "User",
      role: user.role,
      communityId: user.communityId,
    },
  };
}

export async function logout() {
  const session = await getSessionFromCookie();
  if (session?.sessionId) {
    await revokeSession(session.sessionId);
  }
  await clearSessionCookie();
}

export async function register(
  email: string,
  password: string,
  name: string,
  communityId: string,
): Promise<{ success: true; userId: string } | { success: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check existing
  const existing = await db.user.findFirst({
    where: { email: normalizedEmail, communityId },
  });
  if (existing) {
    return { success: false, error: "Email sudah terdaftar" };
  }

  if (password.length < 8) {
    return { success: false, error: "Kata sandi minimal 8 karakter" };
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      communityId,
      email: normalizedEmail,
      passwordHash,
      name,
      role: "RESIDENT",
      status: "ACTIVE",
    },
  });

  return { success: true, userId: user.id };
}