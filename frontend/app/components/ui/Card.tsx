// components/ui/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b ${className}`}>
            {children}
        </div>
    );
}

interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}
