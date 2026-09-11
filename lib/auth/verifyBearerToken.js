import { verifyAccessToken } from "./jwt";
import { hasRequiredRole } from "./roles";

export function getBearerToken(request) { // extract access_token dari request
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.split(" ")[1];
}

export function requireAuth(request, minRole = null) {
    const token = getBearerToken(request);
    if (!token) {
        return { error: "Unauthorized", status: 401 };
    }

    try {
        const payload = verifyAccessToken(token); // validasi access_token

        if (minRole && !hasRequiredRole(payload.role, minRole)) { // cek jik role tidak memenuhi
            return { error: "Forbidden", status: 403 };
        }

        return { payload };
    } catch (err) {
        return { error: "Invalid or expired token", status: 401 };
    }
}