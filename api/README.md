# Todo API

A RESTful API for managing todo tasks built with NestJS, TypeScript, PostgreSQL, and Redis caching.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start:dev
```

## Run tests

```bash
# Run the tests
npm test todo.service.spec.ts

# unit tests with coverage
$ npm test -- --coverage
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=todoapp

# JWT
JWT_SECRET=your-jwt-secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

## API Documentation

The API provides interactive documentation via Swagger UI at:
```
http://localhost:3000/docs
```

## Authentication

All todo endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |

### Todos

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/todos` | Get all todos | ✅ |
| POST | `/todos` | Create new todo | ✅ |
| GET | `/todos/stats` | Get todo statistics | ✅ |
| GET | `/todos/:id` | Get specific todo | ✅ |
| PUT | `/todos/:id` | Update todo | ✅ |
| DELETE | `/todos/:id` | Delete todo | ✅ |
