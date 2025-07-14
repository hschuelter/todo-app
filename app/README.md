# Todo App

The frontend for the todo application, built with Next.js and TypeScript, featuring user authentication and complete CRUD operations for managing tasks.

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