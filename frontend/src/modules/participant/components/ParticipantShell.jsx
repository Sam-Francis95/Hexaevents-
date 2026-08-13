import { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { AppShell } from '../../../shared/components/layout/AppShell';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getUnreadCount } from '../services/notificationService';
import { PARTICIPANT_PAGE_TITLES } from '../pageTitles';
import { ChatbotWidget } from './ChatbotWidget';

/**
 * Thin wrapper around the shared AppShell that supplies participant-specific
 * data (unread notification count, current page title) without teaching the
 * shared shell about any single module's routes or services. Also mounts
 * the participant-owned chatbot widget, available on every participant page.
 */
export function ParticipantShell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getUnreadCount(user.id).then((res) => {
      if (!cancelled) setUnreadCount(res.data || 0);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const title = PARTICIPANT_PAGE_TITLES.find((entry) => matchPath(entry.path, pathname))?.title;

  return (
    <>
      <AppShell unreadCount={unreadCount} title={title} />
      <ChatbotWidget />
    </>
  );
}
