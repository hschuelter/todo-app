# ToDo App

A classic To Do application, used for managing time sensitive tasks

## Features

- ✅ **User Authentication** - JWT-based authentication, secure login and registration system
- ✅ **Protected Routes**: Authentication required for todo management
- ✅ **CRUD Operations** - Create, read, update, delete todos
- ✅ **Redis Caching** - Optimized performance with caching
- ✅ **RabbitMQ Integration** - Event-driven notifications
- ✅ **Swagger Documentation** - Interactive API docs
- ✅ **Database Relations** - PostgreSQL with TypeORM
- ✅ **Real-time Updates**: Instant todo updates without page refresh
- ✅ **Statistics** - Get completion rates and task counts

## Tech Stack

- **API Framework**: NestJS
- **Frontend Framework**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **ORM**: TypeORM
- **Authentication**: JWT Authentication
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, React Testing Library


## Project setup

1. Start Dockers (PostgreSQL, RabbitMQ, Redis)
```bash
$ docker-compose --profile dev up -d
```
2. Getting the logs from Dockers
```bash
$ docker compose logs -f app-dev
```

3. Running the RabbitMQ worker
```bash
$ cd worker/
$ npm install
$ node worker.js
```

4. Stop Dockers
```bash
$ docker-compose --profile dev down
```
