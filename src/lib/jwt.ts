import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface IJwtPayload {
  userId: string;
  email: string;
}

export function signJwt(payload: IJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): IJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch {
    return null; // expired, malformed, or bad signature
  }
}
