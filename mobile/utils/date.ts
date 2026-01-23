/**
 * Format a Firestore timestamp or Date object to a human-readable string
 * Pattern: dd/mm/yy, hr:min:ss am/pm
 */
export function formatTimestamp(
  timestamp: Date | { seconds: number; nanoseconds: number } | null | undefined
): string {
  if (!timestamp) {
    return 'Unknown date';
  }

  try {
    // Normalize input to Date object
    const date = timestamp instanceof Date
      ? timestamp
      : new Date((timestamp as { seconds: number }).seconds * 1000);

    // Check validity
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    // Format options: dd/mm/yy, hh:mm:ss am/pm
    // Using en-GB forces dd/mm ordering
    const formatted = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);

    // Format: "19/01/26, 7:15:37 pm"
    return formatted.replace(' at ', ', ');

  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown date';
  }
}