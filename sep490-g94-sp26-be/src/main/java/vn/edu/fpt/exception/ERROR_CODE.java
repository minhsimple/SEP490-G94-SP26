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
    INVALID_PASSWORD(20011, "Sai mật khẩu", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(20012, "Username không đúng định dạng email", HttpStatus.BAD_REQUEST),
    ROLE_NOT_NULL(20013, "Role không được để trống", HttpStatus.BAD_REQUEST),


    /**
     * Other Error
     */
    ROLE_EXISTED(4001, "Vai trò đã tồn tại", HttpStatus.BAD_REQUEST),

    ROLE_NOT_EXISTED(4002, "Vai trò không tồn tại", HttpStatus.NOT_FOUND),



    PERMISSION_NOT_EXISTED(4003, "Quyền không tồn tại", HttpStatus.NOT_FOUND),
    PERMISSION_EXISTED(4004, "Quyền đã tồn tại", HttpStatus.NOT_FOUND),

    MENU_NOT_EXISTED(4005, "Menu không tồn tại", HttpStatus.NOT_FOUND),
    MENU_EXISTED(4006, "Menu đã tồn tại", HttpStatus.NOT_FOUND),

    DEPARTMENT_NOT_EXISTED(4007, "Đơn vị không tồn tại", HttpStatus.NOT_FOUND),
    DEPARTMENT_EXISTED(4008, "Đơn vị đã tồn tại", HttpStatus.NOT_FOUND),

    ERROR_WHILE_SEND_EMAIL(4009, "Lỗi khi gửi email", HttpStatus.SERVICE_UNAVAILABLE),
    FILE_NULL(4010, "Tập tin không được để trống", HttpStatus.BAD_REQUEST),
    NO_ACCESS_TO_RESOURCES(4011, "Không có quyền truy cập vào tài nguyên", HttpStatus.BAD_REQUEST),
    MULTIPLE_DEFAULT_ROLES_NOT_ALLOWED(4012, "Không được phép có nhiều vai trò mặc định", HttpStatus.SERVICE_UNAVAILABLE),

    /**
     * Notify Error
     */
    NOTY_CONFIG_NOT_FOUND(4015, "Không tìm thấy cấu hình thông báo", HttpStatus.NOT_FOUND),
    NOTY_CREATE_INVALID_PARAM(4016, "Ít nhất một tùy chọn - sendByEmail hoặc sendBySystem phải được chọn", HttpStatus.BAD_REQUEST),
    NOTY_EXISTED(4016, "Cấu hình thông báo đã tồn tại", HttpStatus.BAD_REQUEST),

    MENU_NEED_REMOVE_FROM_ROLE(4017, "Danh sách vai trò cần xóa menu: ", HttpStatus.BAD_REQUEST),

    DATA_NOT_FOUND(4020, "Không tìm thấy dữ liệu ", HttpStatus.BAD_REQUEST),
    TYPE_NOT_FOUND(4021, "Loại không tồn tại", HttpStatus.BAD_REQUEST),
    TYPE_NOT_PERMISSION(4022, "Không có quyền với loại hồ sơ", HttpStatus.BAD_REQUEST),
    PROFILE_NOT_PERMISSION(4023, "Hồ sơ không tồn tại hoặc không có quyền với hồ sơ", HttpStatus.BAD_REQUEST),

    /**
     * AppConfig Error
     */
    APP_CONFIG_EXISTED(4021, "Mã cấu hình đã tồn tại", HttpStatus.BAD_REQUEST),
    APP_CONFIG_NOT_FOUND(4022, "Mã cấu hình không tồn tại", HttpStatus.BAD_REQUEST),
    APP_CONFIG_MISSING_CODE(4028, "Thiếu thông tin mã cấu hình", HttpStatus.BAD_REQUEST),
    APP_CONFIG_MISSING_VALUE(4029, "Thiếu thông tin giá trị cấu hình", HttpStatus.BAD_REQUEST),

    ERROR_REDIS(5003, "Err redis", HttpStatus.BAD_REQUEST),
    ERROR_WHILE_CALL_CATEGORY_SERVICE(5002, "Lỗi khi call category service - ", HttpStatus.SERVICE_UNAVAILABLE);

    ERROR_CODE(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}