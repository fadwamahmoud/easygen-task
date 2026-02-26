import { getToken } from '../auth/token';

const BASE_URL = import.meta.env.VITE_API_URL as string;

type ApiError = {
    message?: string | string[];
    error?: string;
    statusCode?: number;
};

export async function api<T>(
    path: string,
    options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    //   consistent error messages
    // 
    // typed return values
    // 
    // easy auth: true option
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (options.auth) {
        const token = getToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        let body: ApiError | null = null;
        try {
            body = await res.json();
        } catch {
            // ignore
        }
        const message =
            (Array.isArray(body?.message) ? body?.message.join(', ') : body?.message) ||
            body?.error ||
            `Request failed with status ${res.status}`;

        throw new Error(message);
    }

    return res.json() as Promise<T>;
}