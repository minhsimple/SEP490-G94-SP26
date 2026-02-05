package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.entity.RefreshToken;
import vn.edu.fpt.entity.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user = :user AND rt.revoked = false")
    void revokeAllTokensByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.token = :token")
    void revokeByToken(@Param("token") String token);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpiredTokens();
}
