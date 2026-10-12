/**
 * Time utility functions for Marangog Hoops PWA
 * Handles 12-hour auto-expiration and Facebook Stories-style relative time formatting (min vs hr)
 */

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function isPostExpired(createdAt: string): boolean {
  const postTime = new Date(createdAt).getTime();
  const now = Date.now();
  return now - postTime > TWELVE_HOURS_MS;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  const minutes = Math.floor(diffInSeconds / 60);

  // Less than 60 minutes: use "min / mins"
  if (minutes <= 1) {
    return '1 min ago';
  }
  if (minutes < 60) {
    return `${minutes} mins ago`;
  }

  // 1 hour or more: switch to "hr / hrs" like Facebook stories
  const hours = Math.floor(minutes / 60);
  if (hours <= 1) {
    return '1 hr ago';
  }
  return `${hours} hrs ago`;
}

export function formatMinsAgo(dateString: string): string {
  return formatTimeAgo(dateString);
}

export function formatRelativeTime(dateString: string): string {
  return formatTimeAgo(dateString);
}
