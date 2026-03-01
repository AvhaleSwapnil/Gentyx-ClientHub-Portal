import { NextRequest, NextResponse } from "next/server";

export interface SessionData {
    userId: string;
    role: string;
    issuedAt: number;
}

const MAX_AGE = 60 * 60 * 2 * 1000; // 2 hours

/**
 * Verifies the session from request cookies and optionally checks for a required role.
 * Returns the session data if valid, or a NextResponse (401/403) if invalid.
 */
export async function verifySession(
    req: NextRequest,
    requiredRole?: string | string[]
): Promise<{ session: SessionData | null; response?: NextResponse }> {
    const token = req.cookies.get("clienthub_token")?.value;
    const role = req.cookies.get("clienthub_role")?.value;
    const issuedAtStr = req.cookies.get("clienthub_issuedAt")?.value;

    if (!token || !role || !issuedAtStr) {
        return {
            session: null,
            response: NextResponse.json({ success: false, error: "Unauthorized: Missing session" }, { status: 401 })
        };
    }

    const issuedAt = Number(issuedAtStr);
    const now = Date.now();

    if (now - issuedAt > MAX_AGE) {
        return {
            session: null,
            response: NextResponse.json({ success: false, error: "Session expired" }, { status: 401 })
        };
    }

    const session: SessionData = {
        userId: token,
        role: role.toUpperCase(),
        issuedAt
    };

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole.map(r => r.toUpperCase()) : [requiredRole.toUpperCase()];
        if (!roles.includes(session.role)) {
            return {
                session: null,
                response: NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 })
            };
        }
    }

    return { session };
}
