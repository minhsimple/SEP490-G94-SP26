package vn.edu.fpt.util.enums;

import lombok.Getter;

@Getter
public enum BookingTime {
    SLOT_1(6, 0, 12, 0),   // Sáng: 06:00 - 12:00
    SLOT_2(12, 0, 18, 0),  // Chiều: 12:00 - 18:00
    SLOT_3(6, 0, 18, 0);   // Cả ngày: 06:00 - 18:00

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
