import { Component, ErrorInfo, ReactNode } from 'react';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  appName: string;
  onClose?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props & { theme: string }, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`Error in ${this.props.appName}:`, error);
    logger.error('Error info:', errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const isDark = this.props.theme === 'dark';

      return (
        <div className={cn(
          "h-full flex flex-col items-center justify-center p-8 text-center",
          !isDark && "bg-[#FAF9F6] text-[#2C2C2C]",
          isDark && "bg-black/40 text-white"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
            !isDark && "bg-red-100",
            isDark && "bg-red-900/30"
          )}>
            <AlertTriangle className={cn(
              "w-10 h-10",
              !isDark && "text-red-600",
              isDark && "text-red-400"
            )} />
          </div>

          <h2 className={cn(
            "text-xl font-bold mb-2",
            !isDark && "text-gray-900",
            isDark && "text-white"
          )}>
            {this.props.appName} encountered an error
          </h2>

          <p className={cn(
            "text-sm mb-6 max-w-md",
            !isDark && "text-gray-600",
            isDark && "text-gray-400"
          )}>
            Something went wrong while running this app. You can try reloading it or close and reopen.
          </p>

          {this.state.error && (
            <details className={cn(
              "mb-6 max-w-md text-left w-full rounded-lg p-4 text-xs font-mono",
              !isDark && "bg-gray-100 text-gray-700",
              isDark && "bg-gray-900 text-gray-300"
            )}>
              <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
              <p className="whitespace-pre-wrap break-words">{this.state.error.toString()}</p>
              {this.state.error.stack && (
                <pre className="mt-2 text-[10px] opacity-70 whitespace-pre-wrap break-words">
                  {this.state.error.stack}
                </pre>
              )}
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors",
                "focus-visible:ring-2 focus-visible:outline-none",
                !isDark && "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500",
                isDark && "bg-blue-500 hover:bg-blue-400 text-white focus-visible:ring-blue-400"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload App</span>
            </button>

            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors",
                  "focus-visible:ring-2 focus-visible:outline-none",
                  !isDark && "bg-gray-300 hover:bg-gray-400 text-gray-800 focus-visible:ring-gray-500",
                  isDark && "bg-gray-700 hover:bg-gray-600 text-white focus-visible:ring-gray-500"
                )}
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to inject theme from Zustand store
export function ErrorBoundary({ children, appName, onClose }: Props) {
  const { theme } = useOSStore();

  return (
    <ErrorBoundaryClass theme={theme} appName={appName} onClose={onClose}>
      {children}
    </ErrorBoundaryClass>
  );
}
