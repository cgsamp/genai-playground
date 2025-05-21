// lib/fetcher.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Fetch error ${res.status}: ${errorBody}`);
    }

    return res.json();
}
