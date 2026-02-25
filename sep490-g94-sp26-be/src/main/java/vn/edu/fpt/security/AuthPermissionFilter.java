package vn.edu.fpt.security;//package com.example.weddinglinkbe.security;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpHeaders;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Slf4j
//@Component
//public class AuthPermissionFilter extends OncePerRequestFilter {
//
//    private final AuthPermissionService authPermissionService;
//
//    public AuthPermissionFilter(AuthPermissionService authPermissionService) {
//        this.authPermissionService = authPermissionService;
//    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response,
//                                    FilterChain filterChain) throws ServletException, IOException {
//
//        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
//
//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            String token = authHeader.substring(7);
//
//            try {
//                // Xác thực token với auth-service
//                String accountId = authPermissionService.verifyTokenAndGetAccountId(token);
//                AccountInternalResponse accountInternalResponse = authPermissionService.getPermission(accountId);
//
//                var authorities = accountInternalResponse.getPermissions().stream()
//                        .map(SimpleGrantedAuthority::new)
//                        .toList();
//
//                // Set authentication vào SecurityContext
//                var authentication = new UsernamePasswordAuthenticationToken(
//                        accountId,
//                        accountInternalResponse.getAccount(),
//                        authorities
//                );
//                SecurityContextHolder.getContext().setAuthentication(authentication);
//
//            } catch (InvalidTokenException e) {
//                // Token không hợp lệ → trả 401 ngay lập tức
//                SecurityContextHolder.clearContext();
//                log.error("Invalid token: {}", e.getMessage());
//
//                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                response.setContentType("application/json");
//                response.getWriter().write("{\"error\":\"Invalid Token\"}");
//                response.getWriter().flush();
//                return; // ← cực kỳ quan trọng: dừng filter chain
//            }
//        }
//
//        // Token hợp lệ hoặc không có token → tiếp tục chain
//        filterChain.doFilter(request, response);
//    }
//}
