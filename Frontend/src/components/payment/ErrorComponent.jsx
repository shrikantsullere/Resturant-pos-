import React from 'react';

const ErrorComponent = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center w-full max-w-md mx-auto">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-red-800 mb-2">{title}</h3>
      <p className="text-red-600 mb-6">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;
