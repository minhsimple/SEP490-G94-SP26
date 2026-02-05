package vn.edu.fpt.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * This class is deprecated. Token is now extracted from Authorization header.
 * Kept for backward compatibility if needed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Deprecated
public class LogoutRequest {
    String refreshToken;
}
