# Login Function - Detailed Class Diagram

## PlantUML Diagram
File: `LOGIN_DIAGRAM.puml`

Dùng các tools online sau để xem diagram:
- **PlantUML Online**: https://www.plantuml.com/plantuml/uml/
- **Draw.io**: https://app.diagrams.net/

Paste nội dung của file `LOGIN_DIAGRAM.puml` vào để visualize.

---

## Mermaid Class Diagram

```mermaid
classDiagram
    direction TD
    
    class AuthController {
        - authService: AuthService
        + login(request: LoginRequest): ApiResponse~AuthResponse~
        + register(request: RegisterRequest): ApiResponse~AuthResponse~
        + refreshToken(request: HttpServletRequest): ApiResponse~AuthResponse~
        + getCurrentUser(): ApiResponse~UserResponse~
        + logout(request: HttpServletRequest): ApiResponse~Void~
        + logoutAllDevices(request: HttpServletRequest): ApiResponse~Void~
        - extractTokenFromRequest(request: HttpServletRequest): String
    }
    
    class AuthService {
        <<interface>>
        + login(request: LoginRequest): AuthResponse
        + register(request: RegisterRequest): AuthResponse
        + refreshToken(refreshToken: String): AuthResponse
        + getCurrentUser(email: String): UserResponse
        + logout(refreshToken: String): void
        + logoutAllDevices(token: String): void
    }
    
    class AuthServiceImpl {
        - userRepository: UserRepository
        - roleRepository: RoleRepository
        - refreshTokenRepository: RefreshTokenRepository
        - passwordEncoder: PasswordEncoder
        - jwtTokenUtil: JwtTokenUtil
        - authenticationManager: AuthenticationManager
        - userMapper: UserMapper
        - refreshExpiration: Long
        + login(request: LoginRequest): AuthResponse
        + register(request: RegisterRequest): AuthResponse
        + refreshToken(refreshTokenStr: String): AuthResponse
        + getCurrentUser(email: String): UserResponse
        + logout(refreshToken: String): void
        + logoutAllDevices(token: String): void
        - validateEmailNotExists(email: String): void
        - validateRefreshToken(refreshToken: String): void
        - authenticateUser(email: String, password: String): void
        - findUserByEmail(email: String): User
        - createUser(request: RegisterRequest): User
        - buildAuthResponse(user: User): AuthResponse
    }
    
    class User {
        - id: Integer
        - email: String
        - passwordHash: String
        - fullName: String
        - phone: String
        - isActive: Boolean
        - status: RecordStatus
        - role_id: Integer
        - locationId: Integer
        - createdAt: LocalDateTime
        - updatedAt: LocalDateTime
    }
    
    class Role {
        - id: Integer
        - code: String
        - name: String
        - description: String
    }
    
    class RefreshToken {
        - id: Integer
        - userId: Integer
        - token: String
        - expiresAt: LocalDateTime
        - revoked: Boolean
        - createdAt: LocalDateTime
    }
    
    class LoginRequest {
        - email: String
        - password: String
    }
    
    class AuthResponse {
        - accessToken: String
        - refreshToken: String
        - tokenType: String
        - userId: Integer
        - email: String
        - fullName: String
        - locationId: Integer
        - codeRole: String
    }
    
    class UserResponse {
        - id: Integer
        - email: String
        - fullName: String
        - phone: String
        - locationId: Integer
        - roleCode: String
    }
    
    class ApiResponse {
        - code: Integer
        - message: String
        - data: T
    }
    
    class UserRepository {
        <<interface>>
        + findByEmailAndStatus(email: String, status: RecordStatus): Optional~User~
        + findById(id: Integer): Optional~User~
    }
    
    class RoleRepository {
        <<interface>>
        + findById(id: Integer): Optional~Role~
    }
    
    class RefreshTokenRepository {
        <<interface>>
        + findByTokenAndRevokedFalse(token: String): Optional~RefreshToken~
        + findByToken(token: String): Optional~RefreshToken~
        + save(refreshToken: RefreshToken): RefreshToken
        + revokeAllTokensByUserId(userId: Integer): void
    }
    
    class JwtTokenUtil {
        + generateTokenWithUserId(email: String, userId: Integer): String
        + generateRefreshToken(email: String): String
        + validateToken(token: String): Boolean
        + extractUsername(token: String): String
    }
    
    class PasswordEncoder {
        + encode(rawPassword: String): String
        + matches(rawPassword: String, encodedPassword: String): Boolean
    }
    
    %% Relationships
    AuthController --> AuthService : uses
    AuthController --> LoginRequest : receives
    AuthController --> ApiResponse : returns
    
    AuthService <|.. AuthServiceImpl : implements
    
    AuthServiceImpl --> UserRepository : uses
    AuthServiceImpl --> RoleRepository : uses
    AuthServiceImpl --> RefreshTokenRepository : uses
    AuthServiceImpl --> JwtTokenUtil : uses
    AuthServiceImpl --> PasswordEncoder : uses
    AuthServiceImpl --> UserMapper : uses
    
    AuthServiceImpl --> User : works with
    AuthServiceImpl --> Role : works with
    AuthServiceImpl --> RefreshToken : works with
    
    UserRepository --> User : queries
    RoleRepository --> Role : queries
    RefreshTokenRepository --> RefreshToken : queries
    
    AuthServiceImpl --> LoginRequest : receives
    AuthServiceImpl --> AuthResponse : returns
    AuthServiceImpl --> UserResponse : returns
    
    User "1" --> "N" RefreshToken : has
    User "N" --> "1" Role : has
    
    ApiResponse --> AuthResponse : wraps
```

---

## Step-by-Step Login Flow

### 1️⃣ **Request Phase**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/v1/auth/login
       │ { email, password }
       ▼
┌──────────────────┐
│ AuthController   │
│ login()          │
└────────┬─────────┘
```

### 2️⃣ **Service Processing**
```
┌──────────────────────┐
│  AuthServiceImpl      │
│  login()             │
│                      │
│  1. authenticateUser │
│  2. findUserByEmail  │
│  3. buildAuthResponse│
└────────┬─────────────┘
```

### 3️⃣ **Authentication**
```
┌─────────────────────────┐
│ AuthenticationManager    │
│ authenticate(token)     │
│                         │
│ • Load user by email    │
│ • Verify password       │
│ • Return auth token     │
└──────────┬──────────────┘
           │
           ▼
┌──────────────────────┐
│ PasswordEncoder      │
│ matches()            │
│                      │
│ Compare with hash    │
└──────────────────────┘
```

### 4️⃣ **Token Generation**
```
┌──────────────────┐
│ JwtTokenUtil     │
│                  │
│ • accessToken    │
│ • refreshToken   │
└────────┬─────────┘
```

### 5️⃣ **Persistence**
```
┌──────────────────────────┐
│ RefreshTokenRepository   │
│ save(refreshToken)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ RefreshToken DB  │
└──────────────────┘
```

### 6️⃣ **Response**
```
┌──────────────────┐
│  AuthResponse    │
│                  │
│ • accessToken    │
│ • refreshToken   │
│ • userId         │
│ • email          │
│ • fullName       │
│ • codeRole       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ ApiResponse<T>       │
│ { data: AuthResponse }
└────────┬─────────────┘
         │
         ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

---

## Component Interaction Matrix

| Component | UserRepository | RoleRepository | RefreshTokenRepository | JwtTokenUtil | PasswordEncoder |
|-----------|---|---|---|---|---|
| **AuthServiceImpl** | ✅ (find user) | ✅ (get role) | ✅ (save token) | ✅ (generate) | ✅ (encode) |
| **AuthenticationManager** | ❌ | ❌ | ❌ | ❌ | ✅ (verify) |
| **JwtTokenUtil** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Error Scenarios

```
┌──────────────────────────────────────┐
│   Exception Handling                 │
├──────────────────────────────────────┤
│                                      │
│ ❌ Authentication Failed              │
│    └─> AppException(USER_NOT_EXISTED)│
│                                      │
│ ❌ User Not Found                     │
│    └─> AppException(USER_NOT_EXISTED)│
│                                      │
│ ❌ Role Not Found                     │
│    └─> AppException(USER_NOT_EXISTED)│
│                                      │
│ ❌ Invalid Refresh Token              │
│    └─> AppException(INVALID_TOKEN)   │
│                                      │
└──────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌────────────────────────────────────┐
│            User                    │
├────────────────────────────────────┤
│ PK: id                             │
│ email (UNIQUE)                     │
│ passwordHash                       │
│ fullName                           │
│ phone                              │
│ isActive                           │
│ status (RecordStatus)              │
│ FK: role_id ──┐                    │
│ locationId    │                    │
│ createdAt     │                    │
│ updatedAt     │                    │
└────────────────┼────────────────────┘
                 │ 1:N
                 │
                 ▼
         ┌────────────────────┐
         │      Role          │
         ├────────────────────┤
         │ PK: id             │
         │ code (UNIQUE)      │
         │ name               │
         │ description        │
         └────────────────────┘

┌────────────────────────────────────┐
│       RefreshToken                 │
├────────────────────────────────────┤
│ PK: id                             │
│ FK: userId ──┐                     │
│ token (UNIQUE)                     │
│ expiresAt                          │
│ revoked (DEFAULT: false)           │
│ createdAt                          │
└────────────────┼────────────────────┘
                 │ 1:N
                 │
                 ▼
         ┌────────────────────┐
         │      User          │
         └────────────────────┘
```

---

## Configuration & Annotations

### AuthServiceImpl
```java
@Service           // Spring Bean
@Slf4j             // Logging
@RequiredArgsConstructor  // Constructor injection
@Transactional     // Transaction management
```

### Methods
- `@Override @Transactional` - login method có transaction
- `@Value("${jwt.refresh-expiration:604800000}")` - Configuration injection

### Spring Security Integration
```
AuthenticationManager
    └─> ProviderManager
        └─> DaoAuthenticationProvider
            ├─> UserDetailsService
            ├─> PasswordEncoder
            └─> User Authentication
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Entry Point** | `POST /api/v1/auth/login` |
| **Input** | `LoginRequest { email, password }` |
| **Output** | `ApiResponse<AuthResponse>` |
| **Main Service** | `AuthServiceImpl.login()` |
| **Security** | Spring Security + JWT |
| **Database Operations** | 2-3 queries (user, role, save token) |
| **Error Handling** | Custom `AppException` with error codes |
| **Transaction** | Yes, `@Transactional` |
| **Logging** | SLF4J via `@Slf4j` |

