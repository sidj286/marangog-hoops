/**
 * Time utility functions for Marangog Hoops PWA
 * Handles 12-hour auto-expiration and minutes-ago formatting
 */

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function isPostExpired(createdAt: string): boolean {
  const postTime = new Date(createdAt).getTime();
  const now = Date.now();
  return now - postTime > TWELVE_HOURS_MS;
}

export function formatMinsAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  const minutes = Math.floor(diffInSeconds / 60);

  if (minutes <= 1) {
    return '1 min ago';
  }
  return `${minutes} mins ago`;
}

export function formatRelativeTime(dateString: string): string {
  return formatMinsAgo(dateString);
}
