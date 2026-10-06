# SPQR Mainframe

**Live site:** https://spqrmainframe.com

A combined Roblox/Luau and web-development showcase built around a large Roman Empire roleplay project. The repository demonstrates both the **player-facing gameplay systems** used in Roblox Studio and the **React/TypeScript information portal** used to organise the wider project.

## Start here

### Roblox gameplay engineering
➡️ **[`roblox/`](./roblox/README.md)**

Portfolio extracts include:

- server-authoritative sword and shield combat
- slash, stab and kick actions
- directional blocking and shield stamina
- guard break and stun states
- ViewportFrame inventory/equipment rendering
- validated equip/unequip networking
- reusable player status/state service
- name-tag selection with server authorization
- custom TextChatService role presentation
- state-aware sprint/movement controller

### Web / project systems
The root application is the **Roman Imperial Mainframe**, a React/TypeScript portal that brings government, military, development, departmental and judicial information into one searchable interface.

## What this project demonstrates

### Roblox / Luau
- client/server architecture
- RemoteEvents and RemoteFunctions
- server-side action validation
- gameplay state management
- combat geometry and guard-direction checks
- cooldown, stamina and stun systems
- 3D ViewportFrame UI rendering
- equipment synchronization
- TextChatService customization
- input and movement controllers

### Web engineering
- React and TypeScript application architecture
- client-side routing
- live Trello data integration
- TanStack Query state/caching
- reusable UI components
- responsive layouts
- search and entity-based navigation

## Roblox structure

```text
roblox/
├── src/
│   ├── client/
│   │   ├── CombatController.client.lua
│   │   ├── CustomChatController.client.lua
│   │   ├── InventoryController.client.lua
│   │   ├── MovementController.client.lua
│   │   └── NameTagSelector.client.lua
│   ├── server/
│   │   ├── CombatService.server.lua
│   │   ├── EquipmentService.server.lua
│   │   └── NameTagService.server.lua
│   └── shared/
│       ├── CombatConfig.lua
│       └── StatusService.lua
└── default.project.json
```

The gameplay samples follow a **client intent / server authority** model: input, UI and presentation happen locally, while state changes that affect other players are validated on the server.

## Mainframe features

### Central command dashboard
A single entry point into government, military, departments, development and judicial records with live board statistics.

### Live Trello integration
Public Trello boards act as external data sources and refresh automatically, allowing information to be maintained without rebuilding the front end.

### Structured navigation and search
Dedicated routes cover government, military, departments, development, judicial records, archive search and individual entity pages.

## Web tech stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack React Query
- Tailwind CSS
- Radix UI / shadcn-style components
- Vitest
- Trello public JSON data

## Running the web application

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Reviewing the Roblox code

The `roblox/default.project.json` file provides a Rojo-style mapping for the portfolio extracts. The samples are intentionally separated from private game assets, production map content and live project data so the engineering can be reviewed without exposing the complete experience.

## Why I built it

The wider project needed both gameplay systems inside Roblox and a central way to organise operational information outside the game. Building both sides created a useful opportunity to work across gameplay engineering, UI, networking, state management, APIs and web application structure.