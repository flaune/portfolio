/**
 * Logging utility for development debugging
 *
 * In production, these logs are no-ops to avoid console spam.
 * In development, they provide helpful debugging information.
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'log' | 'warn' | 'error' | 'info';

class Logger {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  private formatMessage(level: LogLevel, ...args: any[]): void {
    if (!isDevelopment) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${this.namespace}]`;

    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }

  log(...args: any[]): void {
    this.formatMessage('log', ...args);
  }

  info(...args: any[]): void {
    this.formatMessage('info', ...args);
  }

  warn(...args: any[]): void {
    this.formatMessage('warn', ...args);
  }

  error(...args: any[]): void {
    this.formatMessage('error', ...args);
  }
}

/**
 * Create a logger instance for a specific namespace
 * @param namespace - The component or module name
 * @returns Logger instance
 */
export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}
