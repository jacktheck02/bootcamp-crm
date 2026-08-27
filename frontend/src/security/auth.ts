/* Simple client auth helpers using server token format: lab.<username>.<role>.<hash> */
const STORAGE_KEY = "crm:accessToken";
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export type User = { username: string | null; role: string | null; token: string };

async function getFriendlyErrorMessage(response: Response, fallback: string): Promise<string> {
    // If server responded 401, always prefer the canonical message we want:
    if (response.status === 401) {
        return "Invalid credentials";
    }

    // Try to parse JSON { message: "..." } if present
    try {
        const json = await response.clone().json();
        if (json && typeof json === "object" && typeof (json as any).message === "string" && (json as any).message.trim().length > 0) {
            return (json as any).message;
        }
    } catch {
        // not JSON — fall through to text parse
    }

    // Try text body
    try {
        const text = await response.clone().text();
        if (text && text.trim().length > 0) {
            return text;
        }
    } catch {
        // ignore
    }

    return fallback;
}

export async function login(username: string, password: string): Promise<User | null> {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const message = await getFriendlyErrorMessage(res, "Invalid credentials");
        throw new Error(message);
    }

    const body = await res.json();
    const token = body?.accessToken;
    if (!token) throw new Error("No token returned");

    localStorage.setItem(STORAGE_KEY, token);
    return getUser();
}

export function logout(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

export function getUser(): User | null {
    const token = getToken();
    if (!token) return null;
    // server issues: "lab.<username>.<role>.<hash>"
    const parts = token.split(".");
    const username = parts[1] ?? null;
    const role = parts[2] ?? null;
    return { username, role, token };
}