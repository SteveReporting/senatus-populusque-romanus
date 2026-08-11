# Roblox Systems Architecture

## Design goals

The portfolio extracts are organized around four rules:

1. **The client requests; the server decides.**
2. **Shared gameplay state is observable but not client-authoritative.**
3. **UI code reacts to replicated data instead of owning inventory/combat truth.**
4. **Project-specific assets and IDs stay outside the reusable gameplay layer where possible.**

## Combat flow

```text
Player input
   │
   ▼
CombatController.client.lua
   │  RemoteEvent: CombatAction
   ▼
CombatService.server.lua
   │
   ├── validates cooldown/state
   ├── performs server-side target search
   ├── checks range + facing + line of sight
   ├── resolves directional blocking
   └── applies damage / stamina / stun
            │
            ▼
      StatusService.lua
            │
            └── replicated character attributes
```

The client never sends the target player or final damage value. This reduces the useful attack surface for common RemoteEvent abuse.

## Shield / guard model

A blocking defender is protected only when the attacker is inside the configured guard-facing cone. Attacks outside that cone can connect normally, allowing rear and sufficiently rearward side attacks.

Normal guarded attacks consume shield stamina. A depleted shield breaks guard and creates a short stun window.

The kick is intentionally different:

- against an active guard, it removes a large chunk of shield stamina;
- against an open target, it applies a short stun;
- the attacker drops their own guard while kicking, creating risk on a miss;
- the action has a long cooldown compared with normal attacks.

## Player state

`StatusService` writes gameplay state to character attributes such as:

```text
State_Attacking
State_Blocking
State_Kicking
State_Stunned
State_EquipmentLocked
ShieldStamina
```

Timed state uses replacement tokens so refreshing a stun does not allow an older delayed task to clear the newer stun early.

## Inventory / equipment flow

```text
PlayerData/<PlayerName>/
├── Inventory/
└── Equipped/
```

`InventoryController.client.lua` observes both containers and keeps one UI representation per item module. Reparenting between `Inventory` and `Equipped` updates the existing frame rather than treating the item as deleted.

3D previews are generated with a `WorldModel` inside each `ViewportFrame`. The controller clones the render model, disables physics/script behavior, calculates its bounds and fits a dedicated camera to the object.

Equip requests are sent to `EquipmentService.server.lua`, which verifies that the supplied instance belongs to that player's own data tree before moving it. Slot conflicts are resolved on the server.

## Identity and chat

`NameTagService.server.lua` owns the allowed tag definitions and authorization rules. The client requests the list it is allowed to display and can only submit a known key back to the server.

The selected role is replicated through player attributes and reused by both overhead name tags and `CustomChatController.client.lua`.

Chat presentation uses Roblox `TextChatService`; it decorates the already-managed message prefix rather than replacing Roblox's filtering, permissions or delivery system.

## Movement

`MovementController.client.lua` handles responsive sprint input but reads replicated combat/status attributes before applying sprint speed. Blocking, attacking, kicking, equipment locks and stun states therefore automatically constrain movement without tightly coupling the movement controller to combat internals.
