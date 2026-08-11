# SPQR Roblox Gameplay Systems

This directory contains cleaned portfolio versions of Roblox Studio / Luau systems from the wider SPQR Roman roleplay project.

The code is presented separately from private game assets, production IDs, map content and live project data so the engineering can be reviewed without exposing the full experience.

## Included systems

- Sword and shield combat with slash, stab, kick, blocking, shield stamina, cooldowns and stun state
- Reusable player `StatusService`
- ViewportFrame inventory/equipment controller
- Approved name-tag selection through a server-controlled `NameBridge`
- Roblox-compliant custom chat presentation with role/team prefixes
- Sprint/movement controller that respects replicated gameplay states

## Structure

```text
roblox/
├── src/
│   ├── client/
│   ├── server/
│   └── shared/
└── default.project.json
```

The samples follow a **client intent / server authority** model. Input, animation and UI live on the client; combat validation and shared gameplay state are owned by the server.

These are portfolio-focused extracts rather than a complete playable place file.