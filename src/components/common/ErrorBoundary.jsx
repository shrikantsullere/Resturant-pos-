import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-surface rounded-3xl shadow-2xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 text-primary rounded-full flex items-center justify-center mx-auto text-4xl">
              ⚠️
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Something went wrong</h1>
              <p className="text-slate-500 text-sm font-medium">
                The application encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            {process.env.NODE_ENV !== 'production' && (
              <div className="bg-slate-50 p-4 rounded-xl text-left overflow-auto max-h-40">
                <code className="text-xs text-primary">{this.state.error?.toString()}</code>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
