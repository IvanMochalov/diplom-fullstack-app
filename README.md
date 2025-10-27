# My Fullstack App

Vite + React + Express + SQLite fullstack application.

## Tech Stack
- **Frontend**: Vite + React
- **Backend**: Express.js + Node.js
- **Database**: SQLite + Prisma ORM
- **Tools**: Concurrently, Nodemon, Prisma Studio

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/IvanMochalov/diplom-fullstack-app.git
cd diplom-fullstack-app
```
2. Install dependencies:
```bash
npm run install-all
```

3. Run the application:
```bash
npm run dev
```

## Available Scripts
`npm run dev` - Start both client and server in development mode

`npm run server` - Start only the backend server

`npm run client` - Start only the frontend development server

`npm run build` - Build the frontend for production

`npm run install-all` - Install all dependencies (root, server, client)

`npm run db:studio` - Open Prisma Studio for database management

## Database Management

View and edit your database through Prisma Studio:
```bash
npm run db:studio
```