/**
 * Time utility functions for Marangog Hoops PWA
 * Handles 12-hour auto-expiration and relative time formatting
 */

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function isPostExpired(createdAt: string): boolean {
  const postTime = new Date(createdAt).getTime();
  const now = Date.now();
  return now - postTime > TWELVE_HOURS_MS;
}

export function getRemainingTimeText(createdAt: string): { text: string; isExpired: boolean; percentLeft: number } {
  const postTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsed = now - postTime;
  const remaining = TWELVE_HOURS_MS - elapsed;

  if (remaining <= 0) {
    return { text: 'Human Na (Expired)', isExpired: true, percentLeft: 0 };
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const percentLeft = Math.max(0, Math.min(100, Math.round((remaining / TWELVE_HOURS_MS) * 100)));

  if (hours > 0) {
    return { text: `${hours}h ${minutes}m left`, isExpired: false, percentLeft };
  }
  return { text: `${minutes}m left`, isExpired: false, percentLeft };
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 45) {
    return 'Karon pa lang'; // Just now
  }

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
