# Overview

This is an HR Resume Management System built as a full-stack web application. The system allows HR professionals to upload, manage, view, and search through resume documents. It provides a clean, modern interface for handling PDF, DOC, and DOCX resume files with features like drag-and-drop upload, document preview, and comprehensive search functionality.

The application follows a modern web development stack with React on the frontend, Express.js on the backend, and PostgreSQL for data persistence, all tied together with TypeScript for type safety.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system using CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Upload**: Multer middleware for handling multipart/form-data
- **Development Server**: Custom Vite integration for hot module replacement
- **API Design**: RESTful endpoints with structured JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Connection**: Neon Database serverless PostgreSQL
- **Fallback**: In-memory storage implementation for development/testing
- **File Storage**: Local filesystem storage in uploads directory

## Authentication & Security
- **File Validation**: Strict file type checking (PDF, DOC, DOCX only)
- **File Size Limits**: 10MB maximum file size
- **Input Sanitization**: Zod schema validation for all inputs
- **CORS**: Configured for cross-origin requests

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

### UI & Styling
- **Shadcn/UI**: Pre-built accessible component library
- **Radix UI**: Low-level UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production

### File Handling
- **Multer**: Node.js middleware for file uploads
- **File System**: Node.js native fs module for file operations

### State Management
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and parsing