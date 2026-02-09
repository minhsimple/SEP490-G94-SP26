package vn.edu.fpt.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationResponse {

    String accessToken;
    String refreshToken;
    Date expiryTime;
    Boolean isFirstLogin;
}

