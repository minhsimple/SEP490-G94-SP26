package vn.edu.fpt.util.schedule;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.respository.RefreshTokenRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenCleanupSchedule {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Tự động xóa các refresh token đã hết hạn.
     * Chạy mỗi 1 giờ (3600000 ms).
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanUpExpiredRefreshTokens() {
        log.info("Starting cleanup of expired refresh tokens...");
        refreshTokenRepository.deleteExpiredTokens();
        log.info("Expired refresh tokens cleanup completed.");
    }
}
