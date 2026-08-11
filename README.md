# Roman Imperial Mainframe

A full-stack-style front-end command and information portal built for a large Roblox Roman Empire roleplay project. The application brings government, military, development, departmental and judicial information into one searchable interface instead of spreading operational information across multiple external boards and documents.

## What it demonstrates

- Designing a structured information system around a real community/project workflow
- React and TypeScript application architecture
- Client-side routing across multiple functional areas
- Live Trello data integration with automatic refresh
- Search and entity-based navigation
- Reusable UI components and responsive layouts
- Query caching/state management with TanStack Query
- Data-driven presentation of government, military and development records

## Main features

### Central command dashboard
The landing page provides a single entry point into government, military, departments, development and judicial records, together with live board statistics.

### Live Trello integration
Public Trello boards are treated as the underlying data source. The application retrieves board data and refreshes it automatically so information can be maintained outside the website without rebuilding the front end.

### Structured navigation
Dedicated routes separate major areas of the project:

- Government
- Military
- Departments
- Development
- Judicial records
- Global archive search
- Individual entity pages

### Searchable records
Users can move from broad categories into individual records through dynamic entity routes, making the application behave more like an internal information system than a static website.

## Tech stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack React Query
- Tailwind CSS
- Radix UI / shadcn-style components
- Vitest
- Trello public JSON data

## Project structure

```text
src/
├── components/     Reusable interface components
├── config/         External data-source configuration
├── hooks/          Data-fetching and application hooks
├── pages/          Main application routes
└── App.tsx         Routing and application composition
```

## Running locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Why I built it

The project was created to solve an organisational problem in a large Roblox roleplay project: operational information existed across multiple systems and needed a central, easier-to-navigate interface. The result is a themed management portal that combines external live data with a custom React front end.

## Portfolio note

This repository focuses on the web/application side of the wider Roblox project. Separate Roblox/Luau repositories are used for gameplay systems so individual systems such as combat, equipment and server-side services can be reviewed independently.