# Login Function Class Diagram

## Flow Chart của Hàm Login

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AuthController                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ @PostMapping("/login")                                      │   │
│  │ login(LoginRequest request): ApiResponse<AuthResponse>      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ gọi
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AuthServiceImpl                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ login(LoginRequest request): AuthResponse                   │   │
│  │                                                             │   │
│  │ 1. Log info: "User login attempt for email: {}"            │   │
│  │ 2. try {                                                   │   │
│  │      authenticateUser(email, password)                     │   │
│  │    } catch (Exception) {                                   │   │
│  │      throw AppException(ERROR_CODE.USER_NOT_EXISTED)       │   │
│  │    }                                                       │   │
│  │ 3. user = findUserByEmail(email)                           │   │
│  │ 4. return buildAuthResponse(user)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────┬───────────┘
               │ gọi                                      │ gọi
               ▼                                          ▼
      ┌────────────────────┐            ┌───────────────────────────┐
      │  Helper Methods    │            │  Helper Methods           │
      │  ┌──────────────┐  │            │  ┌───────────────────┐    │
      │  │authenticateU │  │            │  │findUserByEmail()  │    │
      │  │ser(email,    │  │            │  │ - Find user by    │    │
      │  │password)     │  │            │  │   email & status  │    │
      │  │              │  │            │  │   (active)        │    │
      │  │• authManage  │  │            │  │ - Throw exception │    │
      │  │ .authenticate(│ │            │  │   if not found    │    │
      │  │  new Username│  │            │  └───────────────────┘    │
      │  │ PasswordAuth │  │            │                           │
      │  │ Token(email, │  │            │ ┌───────────────────┐    │
      │  │ password))   │  │            │ │buildAuthResponse()│    │
      │  └──────────────┘  │            │ │ 1. Generate       │    │
      │                    │            │ │    accessToken    │    │
      │                    │            │ │ 2. Generate       │    │
      │                    │            │ │    refreshToken   │    │
      │                    │            │ │ 3. Save refresh   │    │
      │                    │            │ │    token to DB    │    │
      │                    │            │ │ 4. Get role from  │    │
      │                    │            │ │    database       │    │
      │                    │            │ │ 5. Build response │    │
      │                    │            │ │    with tokens    │    │
      │                    │            │ └───────────────────┘    │
      └────────────────────┘            └───────────────────────────┘
               │                                      │
               │ gọi                                  │ gọi & sử dụng
               ▼                                      ▼
┌──────────────────────────┐   ┌──────────────────────────────────┐
│ AuthenticationManager    │   │ Các Repository & Utilities        │
│ (Spring Security)        │   │ ┌────────────────────────────┐   │
│ ┌──────────────────────┐ │   │ │ UserRepository             │   │
│ │ authenticate(token)  │ │   │ │ - findByEmailAndStatus()   │   │
│ │                      │ │   │ └────────────────────────────┘   │
│ │ - Validate username  │ │   │ ┌────────────────────────────┐   │
│ │   & password         │ │   │ │ RoleRepository             │   │
│ │ - Load user details  │ │   │ │ - findById()               │   │
│ │ - Verify password    │ │   │ └────────────────────────────┘   │
│ │ - Return auth token  │ │   │ ┌────────────────────────────┐   │
│ │                      │ │   │ │ RefreshTokenRepository     │   │
│ │ Throws               │ │   │ │ - save()                   │   │
│ │ AuthenticationException│ │   │ └────────────────────────────┘   │
│ └──────────────────────┘ │   │ ┌────────────────────────────┐   │
└──────────────────────────┘   │ │ JwtTokenUtil               │   │
                               │ │ - generateTokenWithUserId()│   │
                               │ │ - generateRefreshToken()   │   │
                               │ └────────────────────────────┘   │
                               │ ┌────────────────────────────┐   │
                               │ │ UserMapper                 │   │
                               │ │ - toResponse()             │   │
                               │ └────────────────────────────┘   │
                               └──────────────────────────────────┘
                                        │
                                        │ trả về
                                        ▼
                               ┌──────────────────────────────────┐
                               │ AuthResponse (DTO)               │
                               │ ┌────────────────────────────┐   │
                               │ │- accessToken: String       │   │
                               │ │- refreshToken: String      │   │
                               │ │- tokenType: String         │   │
                               │ │- userId: Integer           │   │
                               │ │- email: String             │   │
                               │ │- fullName: String          │   │
                               │ │- locationId: Integer       │   │
                               │ │- codeRole: String          │   │
                               │ └────────────────────────────┘   │
                               └──────────────────────────────────┘
```

## Entities & Relationships

```
┌──────────────────────────────────────┐
│           User (Entity)              │
├──────────────────────────────────────┤
│- id: Integer                         │
│- email: String                       │
│- passwordHash: String                │
│- fullName: String                    │
│- phone: String                       │
│- isActive: Boolean                   │
│- status: RecordStatus (active)       │
│- role_id: Integer (FK)               │
│- locationId: Integer                 │
└──────────────────────────────────────┘
          │
          │ 1:N (User has many RefreshTokens)
          ▼
┌──────────────────────────────────────┐
│      RefreshToken (Entity)           │
├──────────────────────────────────────┤
│- id: Integer                         │
│- userId: Integer (FK)                │
│- token: String (JWT)                 │
│- expiresAt: LocalDateTime            │
│- revoked: Boolean                    │
│- createdAt: LocalDateTime            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│          Role (Entity)               │
├──────────────────────────────────────┤
│- id: Integer                         │
│- code: String (e.g., "ADMIN")        │
│- name: String                        │
│- description: String                 │
└──────────────────────────────────────┘
          ▲
          │ 1:N (Role has many Users)
          │
```

## DTOs

```
┌────────────────────────────────────┐
│   LoginRequest (Input DTO)         │
├────────────────────────────────────┤
│- email: String                     │
│- password: String                  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   AuthResponse (Output DTO)        │
├────────────────────────────────────┤
│- accessToken: String               │
│- refreshToken: String              │
│- tokenType: String = "Bearer"      │
│- userId: Integer                   │
│- email: String                     │
│- fullName: String                  │
│- locationId: Integer               │
│- codeRole: String                  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   ApiResponse<T> (Wrapper)         │
├────────────────────────────────────┤
│- code: Integer                     │
│- message: String                   │
│- data: T (AuthResponse)            │
└────────────────────────────────────┘
```

## Sequence Diagram

```
Client          AuthController      AuthServiceImpl      AuthManager         UserRepository
  │                  │                    │                  │                    │
  │──LoginRequest────>│                    │                  │                    │
  │                  │                    │                  │                    │
  │                  │──login(request)────>│                  │                    │
  │                  │                    │                  │                    │
  │                  │                    │─authenticateUser()─>                   │
  │                  │                    │                  │                    │
  │                  │                    │                  │─validate password ─>
  │                  │                    │                  │<─ success/error ─ │
  │                  │                    │<─ return ────────│                    │
  │                  │                    │                  │                    │
  │                  │                    │──findUserByEmail()────────────────────>
  │                  │                    │<─ User object ───────────────────────│
  │                  │                    │                  │                    │
  │                  │                    │──buildAuthResponse(user)──>            │
  │                  │                    │                  │                    │
  │                  │                    │  ● Generate access token              │
  │                  │                    │  ● Generate refresh token             │
  │                  │                    │  ● Save refresh token to DB           │
  │                  │                    │  ● Get role info                      │
  │                  │                    │                  │                    │
  │                  │<─ AuthResponse ────│                  │                    │
  │                  │                    │                  │                    │
  │<ApiResponse(data)│                    │                  │                    │
  │                  │                    │                  │                    │
```

## Error Handling

```
┌─────────────────────────────────────────────────────────┐
│                   Exception Flow                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Authentication Failed                                 │
│  │                                                      │
│  ├─> authenticateUser() throws Exception               │
│      │                                                  │
│      └─> catch (Exception)                             │
│          └─> throw AppException(USER_NOT_EXISTED)      │
│                                                         │
│  User Not Found                                        │
│  │                                                      │
│  ├─> findUserByEmail()                                 │
│      └─> userRepository returns Optional.empty()       │
│          └─> throw AppException(USER_NOT_EXISTED)      │
│                                                         │
│  Role Not Found                                        │
│  │                                                      │
│  ├─> buildAuthResponse()                               │
│      └─> roleRepository returns Optional.empty()       │
│          └─> throw AppException(USER_NOT_EXISTED)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Summary

1. **Input**: `LoginRequest` (email, password)
2. **Authentication**: Xác thực thông tin đăng nhập qua Spring Security
3. **User Lookup**: Tìm user trong database theo email (status = active)
4. **Token Generation**: 
   - Tạo access token (JWT)
   - Tạo refresh token (JWT)
5. **Token Persistence**: Lưu refresh token vào database
6. **Role Resolution**: Lấy thông tin role của user
7. **Response Building**: Xây dựng `AuthResponse` với đầy đủ thông tin
8. **Output**: Trả về `ApiResponse<AuthResponse>` cho client

## Key Components

| Component | Role |
|-----------|------|
| **AuthController** | REST endpoint, nhận request và trả response |
| **AuthServiceImpl** | Business logic xử lý login |
| **AuthenticationManager** | Spring Security, xác thực credentials |
| **UserRepository** | Truy cập database User |
| **RoleRepository** | Truy cập database Role |
| **RefreshTokenRepository** | Lưu refresh token vào database |
| **JwtTokenUtil** | Tạo và validate JWT tokens |
| **PasswordEncoder** | Mã hóa và xác thực password |

## Annotations & Decorators

- `@PostMapping("/login")` - HTTP POST endpoint
- `@Transactional` - Kích hoạt transaction để đảm bảo consistency
- `@RequiredArgsConstructor` - Lombok tạo constructor với dependencies
- `@Slf4j` - Logging
- `@Service` - Spring service bean

