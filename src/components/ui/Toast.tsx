import { useEffect } from 'react';

interface Props {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = type === 'error';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
      isError
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        isError ? 'bg-red-100' : 'bg-green-100'
      }`}>
        {isError ? (
          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 transition-opacity ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
