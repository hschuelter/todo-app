# Todo App

A todo application built with Next.js and TypeScript, featuring user authentication and complete CRUD operations for managing todos.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete todos
- 🔐 **User Authentication**: Secure login and registration system
- 🔒 **Protected Routes**: Authentication required for todo management
- ⚡ **Real-time Updates**: Instant todo updates without page refresh
- 🎨 **Modern UI**: Clean and intuitive user interface

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT Authentication
- **Database**: PostgreSQL
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the app.

## Usage

### Authentication
1. Register a new account or login with existing credentials
2. Access is required to manage todos

### Managing Todos
- **Create**: Click "Add Todo" to create a new task
- **Read**: View all your todos on the main dashboard
- **Update**: Click on a todo to edit its content or mark as complete
- **Delete**: Remove todos you no longer need

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Testing

The app includes comprehensive test coverage:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API route and authentication flow tests
- **E2E Tests**: Full user journey tests (if applicable)

Run tests with:
```bash
npm run test
```