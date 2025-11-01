import React, { useEffect, useState } from 'react';
import { useOffline } from '../hooks/useOffline';

const WifiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a16.5 16.5 0 0 0-5 2.6A16.5 16.5 0 0 0 2 11a16.5 16.5 0 0 0 5 8.4" />
    <path d="M12 11a6 6 0 0 0-2 .4A6 6 0 0 0 7 16" />
    <circle cx="12" cy="16" r="2" />
  </svg>
);

const OfflineIndicator: React.FC = () => {
  const isOffline = useOffline();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiIcon className="h-5 w-5" />
      <span className="font-medium">You're offline</span>
      {showMessage && (
        <span className="text-sm ml-2">Changes will sync when online</span>
      )}
    </div>
  );
};

export default OfflineIndicator;

