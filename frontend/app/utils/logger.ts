// frontend/app/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    component?: string;
    action?: string;
    userId?: string;
    requestId?: string;
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    
    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
    }

    debug(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message, context));
        }
    }

    info(message: string, context?: LogContext): void {
        console.info(this.formatMessage('info', message, context));
    }

    warn(message: string, context?: LogContext): void {
        console.warn(this.formatMessage('warn', message, context));
    }

    error(message: string, error?: Error, context?: LogContext): void {
        const fullContext = error ? { ...context, error: error.message, stack: error.stack } : context;
        console.error(this.formatMessage('error', message, fullContext));
    }

    // API specific logging methods
    apiRequest(method: string, url: string, context?: LogContext): void {
        this.debug(`API Request: ${method} ${url}`, { ...context, type: 'api_request' });
    }

    apiResponse(method: string, url: string, status: number, duration?: number, context?: LogContext): void {
        const level = status >= 400 ? 'warn' : 'debug';
        const message = `API Response: ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
        
        if (level === 'warn') {
            this.warn(message, { ...context, type: 'api_response', status, duration });
        } else {
            this.debug(message, { ...context, type: 'api_response', status, duration });
        }
    }

    apiError(method: string, url: string, error: Error, context?: LogContext): void {
        this.error(`API Error: ${method} ${url}`, error, { ...context, type: 'api_error' });
    }
}

export const logger = new Logger();
export type { LogContext };