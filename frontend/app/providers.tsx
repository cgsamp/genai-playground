// app/providers.tsx
'use client';

import { ReactNode } from 'react';
import axios from 'axios';

// Set up axios interceptors for error handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default function Providers({ children }: { children: ReactNode }) {
    return children;
}
