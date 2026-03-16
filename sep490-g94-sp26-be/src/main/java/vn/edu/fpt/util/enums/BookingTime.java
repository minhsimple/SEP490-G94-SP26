package vn.edu.fpt.util.enums;

import lombok.Getter;

@Getter
public enum BookingTime {
    //day consists of 2 fixed shifts: Lunch (10:00-14:00) and Dinner (17:00-21:00).
    // The standard duration is 4 hours per shift.
    SLOT_1(10, 0, 14, 0),   // Sáng: 10:00 - 14:00
    SLOT_2(17, 0, 21, 0),  // Chiều: 17:00 - 21:00
    SLOT_3(9, 0, 17, 0);   // Cả ngày: 9:00 - 17:00

    private final int startHour;
    private final int startMinute;
    private final int endHour;
    private final int endMinute;

    BookingTime(int startHour, int startMinute, int endHour, int endMinute) {
        this.startHour = startHour;
        this.startMinute = startMinute;
        this.endHour = endHour;
        this.endMinute = endMinute;
    }
}
