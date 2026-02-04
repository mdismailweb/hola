/**
 * Formats a 24-hour time string (HH:MM) to 12-hour format (h:MM AM/PM)
 * @param {string} timeStr - Time in "HH:MM" format
 * @returns {string} Formatted time or original string if invalid
 */
export const formatTime12Hour = (timeStr) => {
    if (!timeStr) return '';

    // Handle empty or invalid input gracefully
    if (typeof timeStr !== 'string' || !timeStr.includes(':')) {
        return timeStr; // Return as-is if not in expected format
    }

    try {
        // Handle potential seconds (HH:MM:SS) by taking first two parts
        const parts = timeStr.split(':');
        const hoursStr = parts[0];
        const minutesStr = parts[1];

        const hours = parseInt(hoursStr, 10);

        if (isNaN(hours)) return timeStr;

        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;

        return `${hours12}:${minutesStr} ${period}`;
    } catch (e) {
        console.warn('Error formatting time:', e);
        return timeStr;
    }
};
