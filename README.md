# Home Library Service

A REST API service for managing a home library with users, artists, albums, tracks, and favorites. Built with NestJS, TypeORM, and PostgreSQL, containerized with Docker.

## Features

- **User Management**: Create, read, update, delete users with password management
- **Artist Management**: Manage artists with Grammy status
- **Album Management**: Manage albums with artist relationships
- **Track Management**: Manage tracks with artist and album relationships  
- **Favorites**: Add/remove artists, albums, and tracks to/from favorites
- **Database**: PostgreSQL with TypeORM for data persistence
- **Containerization**: Docker and Docker Compose setup
- **Security**: Input validation, UUID-based IDs, password exclusion from responses

## Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)
- Git

## Quick Start with Docker

### 1. Clone the repository
```bash
git clone <repository-url>
cd nodejs2025Q2-service
```

### 2. Environment Setup
The `.env` file is already configured with default values for Docker setup:
```env
PORT=4000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=home_library
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

### 3. Run with Docker Compose
```bash
# Build and start all services (PostgreSQL + App)
npm run docker:up

# Or manually:
docker-compose up -d
```

### 4. Development Mode with Hot Reload
```bash
# Run in development mode with file watching
npm run docker:dev

# Or manually:
docker-compose --profile dev up -d
```

### 5. Verify the application
```bash
# Check if services are running
docker-compose ps

# Test the API
curl http://localhost:4000/user
```

## Docker Commands

```bash
# Build the application image
npm run docker:build

# Scan for security vulnerabilities
npm run docker:scan

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
docker-compose logs -f app

# Access database
docker exec -it home-library-postgres psql -U postgres -d home_library
```

## API Endpoints

### Users (`/user`)
- `GET /user` - Get all users
- `GET /user/:id` - Get user by ID
- `POST /user` - Create user
- `PUT /user/:id` - Update user password
- `DELETE /user/:id` - Delete user

### Artists (`/artist`)
- `GET /artist` - Get all artists
- `GET /artist/:id` - Get artist by ID
- `POST /artist` - Create artist
- `PUT /artist/:id` - Update artist
- `DELETE /artist/:id` - Delete artist

### Albums (`/album`)
- `GET /album` - Get all albums
- `GET /album/:id` - Get album by ID
- `POST /album` - Create album
- `PUT /album/:id` - Update album
- `DELETE /album/:id` - Delete album

### Tracks (`/track`)
- `GET /track` - Get all tracks
- `GET /track/:id` - Get track by ID
- `POST /track` - Create track
- `PUT /track/:id` - Update track
- `DELETE /track/:id` - Delete track

### Favorites (`/favs`)
- `GET /favs` - Get all favorites
- `POST /favs/artist/:id` - Add artist to favorites
- `DELETE /favs/artist/:id` - Remove artist from favorites
- `POST /favs/album/:id` - Add album to favorites
- `DELETE /favs/album/:id` - Remove album from favorites
- `POST /favs/track/:id` - Add track to favorites
- `DELETE /favs/track/:id` - Remove track from favorites

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/migrations/InitialMigration

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Local Development (without Docker)

### 1. Install dependencies
```bash
npm install
```

### 2. Setup PostgreSQL
```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=home_library -p 5432:5432 -d postgres:15-alpine
```

### 3. Update environment
```env
DB_HOST=localhost
```

### 4. Run the application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Testing

```bash
# Run all tests (requires running application)
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```

## Architecture

### Database Schema
- **users**: User accounts with login/password
- **artists**: Artist information with Grammy status
- **albums**: Albums with artist relationships
- **tracks**: Tracks with artist and album relationships
- **favorites**: User favorites (simplified single-user system)

### Docker Architecture
- **Custom Network**: `home-library-network` for service communication
- **Volumes**: Persistent storage for PostgreSQL data and logs
- **Health Checks**: Automatic service health monitoring
- **Auto Restart**: Services restart automatically on failure
- **Security**: Non-root user in application container

### Key Features
- **TypeORM Integration**: Database ORM with entity relationships
- **Input Validation**: Class-validator for request validation
- **Error Handling**: Proper HTTP status codes and error messages
- **Security**: Password exclusion, UUID validation
- **Containerization**: Multi-stage Docker builds for optimization

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `4000` |
| `DB_HOST` | Database host | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_DATABASE` | Database name | `home_library` |
| `DB_SYNCHRONIZE` | Auto-sync database schema | `true` |
| `DB_LOGGING` | Enable database logging | `false` |

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env file or stop conflicting services
   lsof -ti:4000 | xargs kill -9
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL container is running
   docker-compose ps
   docker-compose logs postgres
   ```

3. **Application won't start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```

4. **Tests failing**
   ```bash
   # Ensure application is running before tests
   curl http://localhost:4000/user
   npm test
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Submit a pull request

## License

This project is licensed under the UNLICENSED license.
