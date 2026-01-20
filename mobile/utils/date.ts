/**
 * Date Formatting Utilities
 */

/**
 * Format a Firestore timestamp or Date object to a human-readable string
 * @param timestamp - Date object or Firestore timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: Date | { seconds: number; nanoseconds: number } | null | undefined
): string {
  if (!timestamp) {
    return 'Unknown date';
  }

  try {
    let date: Date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      // Firestore Timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      return 'Unknown date';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Relative time for recent reports
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    // Full date for older reports
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown date';
  }
}
