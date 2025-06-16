# Authentication and Logging Setup Guide

This project now includes comprehensive authentication, authorization, and logging features.

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=home_library
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Server Configuration
PORT=4000

# JWT Configuration - CHANGE THESE IN PRODUCTION!
JWT_ACCESS_SECRET=your-super-secret-access-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Logging Configuration
LOG_LEVEL=2
LOG_MAX_FILE_SIZE=1024
```

## JWT Secrets

⚠️ **IMPORTANT**: Change the JWT secrets in production! Use strong, randomly generated keys:

```bash
# Generate strong secrets (example)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Logging Levels

The logging system supports 5 levels (0-4):
- `0` - ERROR only
- `1` - ERROR + WARN
- `2` - ERROR + WARN + LOG (default)
- `3` - ERROR + WARN + LOG + DEBUG
- `4` - ERROR + WARN + LOG + DEBUG + VERBOSE

## Features Implemented

### 1. Logging & Error Handling
- ✅ Custom LoggingService with dependency injection
- ✅ Custom Exception Filter for error handling
- ✅ Request/Response logging middleware
- ✅ Uncaught exception and unhandled rejection handlers
- ✅ Log file rotation based on size
- ✅ Separate error log files
- ✅ Environment variable for logging level

### 2. Authentication & Authorization
- ✅ POST /auth/signup - User registration with password hashing
- ✅ POST /auth/login - User authentication with JWT tokens
- ✅ POST /auth/refresh - Token refresh functionality
- ✅ JWT Access tokens with userId and login in payload
- ✅ Global authentication guard protecting all routes except:
  - `/auth/signup`
  - `/auth/login`
  - `/auth/refresh`
  - `/doc`
  - `/`
- ✅ Bearer token authentication scheme
- ✅ Password hashing with bcrypt

## API Endpoints

### Authentication Endpoints

#### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "login": "user123",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully"
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "login": "user123",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints

All other endpoints now require authentication. Include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## Database Migration

Run the migration to ensure proper password field configuration:

```bash
npm run migration:run
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env` file

3. Run database migrations:
```bash
npm run migration:run
```

4. Start the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Testing

Run authentication tests:
```bash
# All auth tests
npm run test:auth

# Refresh token tests specifically
npm run test:refresh
```

## Log Files

The application creates log files in the `logs/` directory:
- `app.log` - All application logs
- `error.log` - Error logs only
- Rotated files: `app_YYYY-MM-DDTHH-MM-SS.log`

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Tokens**: Separate access and refresh tokens with different expiration times
3. **Global Authentication**: All routes protected except public endpoints
4. **Error Handling**: Comprehensive error handling with proper HTTP status codes
5. **Request Logging**: All requests logged with sensitive data redacted

## Troubleshooting

### Common Issues

1. **JWT_ACCESS_SECRET not set**: Make sure your `.env` file has the JWT secrets configured
2. **Database connection errors**: Verify your database configuration in `.env`
3. **Migration errors**: Ensure database exists and user has proper permissions
4. **Log file permissions**: Ensure the application has write permissions to create the `logs/` directory

### Error Codes

- `400` - Bad Request (invalid input data)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (authentication failed)
- `500` - Internal Server Error (unexpected server error) 