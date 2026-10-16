import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { getAuth } from "../auth/auth";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  session?: any;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in to access this resource.",
      });
      return;
    }

    req.user = session.user as AuthenticatedUser;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error checking session:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired session.",
    });
  }
}
