package vn.edu.fpt.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ERROR_CODE {

    UNKNOWN_EXCEPTION(9999, "Lỗi chưa xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9000, "Sai enum key", HttpStatus.BAD_REQUEST),

    /**
     * Authentication error
     */
    INVALID_TOKEN(1001, "Token không hợp lệ", HttpStatus.BAD_REQUEST),
    EXPIRED_TOKEN(1002, "Token đã hết hạn", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1003, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1004, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1005, "Không được xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1006, "Bạn không có quyền", HttpStatus.FORBIDDEN),
    INVALID_AUTH(1007, "Tên người dùng hoặc mật khẩu không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN(1008, "Refresh token không hợp lệ", HttpStatus.BAD_REQUEST),
    /**
     * Valid Error
     **/
    INVALID_PAGE_SIZE(2001, "Kích thước trang không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_PAGE_NUMBER(2002, "Số trang không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME_REQ(2003, "Tên người dùng phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD_REQ(2004, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER_FORMAT(2005, "Định dạng số điện thoại không đúng", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL_FORMAT(2006, "Định dạng email không đúng", HttpStatus.BAD_REQUEST),
    USERNAME_OR_EMAIL_ARE_INCORRECT(2007, "Tên người dùng hoặc email không đúng", HttpStatus.NOT_FOUND),
    INVALID_DATE_FORMAT(2008, "Định dạng ngày tháng sai - ", HttpStatus.BAD_REQUEST),
    OUT_OF_RANGE_DATE(2009, "Ngày vượt quá phạm vi cho phép", HttpStatus.BAD_REQUEST),
    EXCEEDS_THE_CURRENT_DATE(2010, "Ngày vượt quá ngày hiện tại", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(2011, "Sai mật khẩu", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2012, "Username không đúng định dạng email", HttpStatus.BAD_REQUEST),
    ROLE_NOT_NULL(2013, "Role không được để trống", HttpStatus.BAD_REQUEST),


    /**
     * Role Error
     */
    ROLE_EXISTED(4001, "Vai trò đã tồn tại", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(4002, "Vai trò không tồn tại", HttpStatus.NOT_FOUND),

    /**
     * Lead Error
     */
    LEAD_NOT_EXISTED(5001, "Khách hàng tiềm năng không tồn tại", HttpStatus.NOT_FOUND),
    LEAD_NOT_IN_NEW_STATE(5002, "Khách hàng tiềm năng không ở trạng thái mới", HttpStatus.BAD_REQUEST),
    LEAD_NOT_MATCH_LOCATION(5003, "Khách hàng tiềm năng không thuộc chi nhánh", HttpStatus.BAD_REQUEST),

    /**
     * Customer Error
     */
    CUSTOMER_NOT_EXISTED(6001, "Khách hàng không tồn tại", HttpStatus.NOT_FOUND),
    CUSTOMER_CITIZEN_ID_NUMBER_EXISTED(6002, "Số CMND/CCCD đã tồn tại", HttpStatus.BAD_REQUEST),
    CUSTOMER_PHONE_EXISTED(6003, "Số điện thoại đã tồn tại", HttpStatus.BAD_REQUEST),
    CUSTOMER_EMAIL_EXISTED(6004, "Email đã tồn tại", HttpStatus.BAD_REQUEST),
    CUSTOMER_TAX_CODE_EXISTED(6005, "Mã số thuế đã tồn tại", HttpStatus.BAD_REQUEST),

    /**
     * Location Error
     */
    LOCATION_NOT_EXISTED(7001, "Địa điểm không tồn tại", HttpStatus.NOT_FOUND),
    LOCATION_EXISTED(7002, "Địa điểm đã tồn tại", HttpStatus.BAD_REQUEST),

    /**
     * Category Menu Item Error
     */
    CATEGORY_MENU_ITEM_NOT_EXISTED(8001, "Danh mục món ăn không tồn tại", HttpStatus.NOT_FOUND),
    CATEGORY_MENU_ITEM_EXISTED(8002, "Danh mục món ăn đã tồn tại", HttpStatus.BAD_REQUEST),

    /**
     * Menu Item Error
     */
    MENU_ITEM_NOT_EXISTED(9001, "Món ăn không tồn tại", HttpStatus.NOT_FOUND),
    MENU_ITEM_EXISTED(9002, "Món ăn đã tồn tại", HttpStatus.BAD_REQUEST),
    MENU_ITEM_CODE_EXISTED_SAME_LOCATION(9003, "Mã món ăn đã tồn tại trong chi nhánh", HttpStatus.BAD_REQUEST),

    /**
     * Set Menu Error
     */
    SET_MENU_LOCATION_NOT_MATCH_MENU_ITEM(10001, "Set menu có món ăn không thuộc chi nhánh", HttpStatus.BAD_REQUEST),
    SET_MENU_NOT_EXISTED(10002, "Set menu không tồn tại", HttpStatus.NOT_FOUND),
    SET_MENU_CODE_EXISTED_SAME_LOCATION(10003, "Mã code set menu đã tồn tại trong chi nhánh", HttpStatus.BAD_REQUEST),
    SET_MENU_EMPTY_MENU_ITEM(10004, "Set menu phải có ít nhất 1 món ăn", HttpStatus.BAD_REQUEST),

    /**
     * Set Menu Item Error
     */
    SET_MENU_ITEM_NOT_EXISTED(20001, "Món ăn trong set menu không tồn tại", HttpStatus.NOT_FOUND),

    /**
     * Service Error
     */
    SERVICE_NOT_EXISTED(11001, "Dịch vụ không tồn tại", HttpStatus.NOT_FOUND),
    SERVICE_EXISTED(11002, "Dịch vụ đã tồn tại", HttpStatus.BAD_REQUEST),
    SERVICE_PACKAGE_NOT_FOUND(11003, "Gói dịch vụ không tồn tai", HttpStatus.BAD_REQUEST),

    /**
     * Hall Error
     */
    HALL_INACTIVE(12001, "Hội trường không tồn tại", HttpStatus.NOT_FOUND),
    HALL_NOT_EXISTED(12001, "Hội trường không tồn tại", HttpStatus.NOT_FOUND),
    HALL_EXISTED(12002, "Hội trường đã tồn tại", HttpStatus.BAD_REQUEST),


    /**
     * File Error
     */
    FILE_EMPTY(13001, "File không được để trống", HttpStatus.BAD_REQUEST),
    FILE_INVALID_CONTENT_TYPE(13002, "Chỉ chấp nhận file ảnh jpg", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(13003, "Kích thước file vượt quá 5MB", HttpStatus.BAD_REQUEST),
    FILE_ERROR(13004, "Lỗi xử lý file", HttpStatus.INTERNAL_SERVER_ERROR),

    /**
     * Booking Error
     */
    BOOKING_NOT_EXISTED(14001, "Đặt tiệc không tồn tại", HttpStatus.NOT_FOUND),
    BOOKING_NO_EXISTED(14002, "Mã đặt tiệc đã tồn tại", HttpStatus.BAD_REQUEST),
    BOOKING_INVALID_STATE_TRANSITION(14003, "Không thể chuyển trạng thái đặt tiệc", HttpStatus.BAD_REQUEST),
    WEDDING_TIME_CONFLICT(14004, "Trùng lịch đặt tiệc", HttpStatus.BAD_REQUEST),
    BOOKING_INVALID_NUMBER_OF_GUESTS(14005, "Số lượng khách quá lớn", HttpStatus.BAD_REQUEST),

    /**
     * Payment Error
     */
    PAYMENT_CONFIG_MISSING(15001, "Payment configuration is missing", HttpStatus.BAD_REQUEST),
    PAYMENT_PROVIDER_ERROR(15002, "Payment provider error", HttpStatus.BAD_GATEWAY),
    PAYMENT_INVALID_SIGNATURE(15003, "Chữ ký webhook không hợp lệ", HttpStatus.BAD_REQUEST),
    PAYMENT_INVALID_STATE(15004, "Trạng thái thanh toán không phù hợp với payos", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(16001, "Thanh toán không tồn tại", HttpStatus.NOT_FOUND),

    /**
     * Invoice Error
     */
    INVOICE_NOT_FOUND(17001, "Hóa đơn ko tồn tại", HttpStatus.NOT_FOUND),
    /**
     * Other Error
     */
    INVALID_REQUEST(30000, "Request không hợp lệ", HttpStatus.BAD_REQUEST);

    ERROR_CODE(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}