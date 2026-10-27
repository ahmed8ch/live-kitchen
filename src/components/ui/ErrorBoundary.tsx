import { Component, ErrorInfo, ReactNode } from 'react';
import { FlameLinkLogo } from './FlameLinkLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('FlameLink ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('flamelink_multiplayer_store_v4');
        window.localStorage.removeItem('flamelink_multiplayer_store_v5');
      }
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#262626] flex items-center justify-center p-6 select-none">
          <div className="w-full max-w-lg bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl p-8 shadow-lg text-center space-y-6">
            <div className="flex justify-center">
              <FlameLinkLogo size="lg" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#262626]">
                Application Recovery Interface
              </h1>
              <p className="text-[13px] text-[#727272] leading-relaxed">
                FlameLink encountered an unexpected rendering condition. Use the controls below to restore the application state.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-white border border-[#ffd1dc] rounded-xl text-left overflow-x-auto text-[12px] font-mono-num text-[#FF0055]">
                <div className="font-bold mb-1">Error Diagnostics:</div>
                <div className="text-[#262626] break-words">{this.state.error.toString()}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 px-5 py-3 rounded-full bg-[#FF0055] text-white font-medium text-[13px] hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
              >
                Reset Session &amp; Return Home
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-3 rounded-full bg-white border border-[#e5e7eb] text-[#262626] font-medium text-[13px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
