import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useToast } from '../../context/ToastContext';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { success } = useToast();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      success('연결이 복구되었습니다');
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, success]);

  if (isOnline) return null;

  return (
    <div className="offline-banner">
      인터넷 연결이 끊겼습니다. 변경 사항은 자동으로 저장됩니다.
    </div>
  );
};
