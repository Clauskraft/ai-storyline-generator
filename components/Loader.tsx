
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gray-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-t-[var(--color-primary)] border-gray-600 rounded-full animate-spin"></div>
      <p className="text-[var(--color-primary)] font-medium text-center">{message}</p>
    </div>
  );
};

export default Loader;