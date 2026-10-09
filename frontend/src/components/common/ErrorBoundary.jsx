import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full text-center p-8 bg-white border border-[#EFE5E0] shadow-xl rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#5A0D1A] border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#111827]">
              Notice
            </h1>
            <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">
              An unexpected display issue occurred while loading this page. You can reload or return safely to your dashboard.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] text-[11px] text-[#6B7280] font-mono text-left max-h-24 overflow-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-xs font-bold hover:bg-[#FAF8F5] transition shadow-2xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
