

const dayLabels = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
];

const numberOfDays = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
];

const isLeapYear = (year) => {
  return !(year % 4) && (year % 100) || !(year % 400);
};

class WeekUtility {
  /**
   * Returns day with 0 as Monday, 6 as Sunday
   */
  static getDay(date) {
    return date.getDay() - 1 < 0 ? 6: date.getDay() - 1;
  }

  /**
   * Returns string array "mon" to "fri"
   */
  static getDayLabels() {
    return dayLabels;
  }

  /**
   * Checks whether a date is within the specified week dates
   */
  static isDateWithinWeek(dateToCheck, weekDates) {
    for(let i = 0; i < weekDates.length; i++) {
      if (dateToCheck.getTime() === weekDates[i].getTime()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns adjacent dates of the same week as the input date
   */
  static getWeekDates(date) {
    let oneDay = 1000 * 60 * 60 * 24;
    let year = date.getFullYear();
    numberOfDays[1] = isLeapYear(year) ? 29: 28;

    let selectedDay = WeekUtility.getDay(date);
    let weekDates = [];

    let dateAsInteger = date.getTime();

    for (let before = 0; before < selectedDay; before++) {
      let tempDate = new Date(dateAsInteger - ((selectedDay - before) * oneDay));
      weekDates.push(tempDate);
    }

    weekDates.push(date);

    for (let after = selectedDay + 1; after < 7; after++) {
      let tempDate = new Date(dateAsInteger + ((after - selectedDay) * oneDay));
      weekDates.push(tempDate);
    }

    return weekDates;
  }
}

export default WeekUtility;