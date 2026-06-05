/**
 * Utility functions for timezone conversions
 */

/**
 * Converts Swedish time (day and hour) to UTC time
 * @param {Object} swedishTime - Object with day and hour in Swedish timezone
 * @param {string} swedishTime.day - Day of the week (monday, tuesday, etc.)
 * @param {string} swedishTime.hour - Hour in 24-hour format (00-23)
 * @returns {Object} UTC time object with day and hour
 */
function convertSwedishTimeToUTC(swedishTime) {
  if (!swedishTime || !swedishTime.day || !swedishTime.hour) {
    return swedishTime;
  }

  const swedishHour = parseInt(swedishTime.hour, 10);

  let utcHour = swedishHour - 2;

  // Handle day rollover
  let utcDay = swedishTime.day;

  if (utcHour < 0) {
    utcHour += 24;
    // Roll back to previous day
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const currentDayIndex = days.indexOf(swedishTime.day);
    const previousDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    utcDay = days[previousDayIndex];
  }

  return {
    day: utcDay,
    hour: utcHour.toString().padStart(2, '0'),
    original_swedish_time: swedishTime, // Keep original for reference
  };
}

/**
 * Converts UTC time back to Swedish time
 * @param {Object} utcTime - Object with day and hour in UTC
 * @param {string} utcTime.day - Day of the week (monday, tuesday, etc.)
 * @param {string} utcTime.hour - Hour in 24-hour format (00-23)
 * @returns {Object} Swedish time object with day and hour
 */
function convertUTCToSwedishTime(utcTime) {
  if (!utcTime || !utcTime.day || !utcTime.hour) {
    return utcTime;
  }

  const utcHour = parseInt(utcTime.hour, 10);

  // Convert to Swedish time by adding 1 hour
  let swedishHour = utcHour + 1;

  // Handle day rollover
  let swedishDay = utcTime.day;

  if (swedishHour >= 24) {
    swedishHour -= 24;
    // Roll forward to next day
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const currentDayIndex = days.indexOf(utcTime.day);
    const nextDayIndex = currentDayIndex === 6 ? 0 : currentDayIndex + 1;
    swedishDay = days[nextDayIndex];
  }

  return {
    day: swedishDay,
    hour: swedishHour.toString().padStart(2, '0'),
  };
}

module.exports = {
  convertSwedishTimeToUTC,
  convertUTCToSwedishTime,
};
