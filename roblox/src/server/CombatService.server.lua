--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local CombatConfig = require(Shared:WaitForChild("CombatConfig"))
local StatusService = require(Shared:WaitForChild("StatusService"))

local remotes = ReplicatedStorage:FindFirstChild("Remotes") or Instance.new("Folder")
remotes.Name = "Remotes"
remotes.Parent = ReplicatedStorage

local combatAction = remotes:FindFirstChild("CombatAction") or Instance.new("RemoteEvent")
combatAction.Name = "CombatAction"
combatAction.Parent = remotes

local lastAction: {[Player]: {[string]: number}} = {}
local lastShieldDamage: {[Model]: number} = setmetatable({}, { __mode = "k" })

local function getCharacterParts(player: Player): (Model?, Humanoid?, BasePart?)
    local character = player.Character
    if not character then
        return nil, nil, nil
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    local root = character:FindFirstChild("HumanoidRootPart")

    if not humanoid or not root or not root:IsA("BasePart") or humanoid.Health <= 0 then
        return nil, nil, nil
    end

    return character, humanoid, root
end

local function initializeCharacter(character: Model)
    character:SetAttribute("ShieldStamina", CombatConfig.MaxShieldStamina)
    character:SetAttribute("State_Blocking", nil)
    character:SetAttribute("State_Stunned", nil)
    character:SetAttribute("State_Attacking", nil)
    character:SetAttribute("State_Kicking", nil)
end

local function canUseAction(player: Player, actionName: string, cooldown: number): boolean
    local playerActions = lastAction[player]
    if not playerActions then
        playerActions = {}
        lastAction[player] = playerActions
    end

    local now = os.clock()
    local previous = playerActions[actionName] or 0
    if now - previous < cooldown then
        return false
    end

    playerActions[actionName] = now
    return true
end

local function isGuardFacingAttacker(targetRoot: BasePart, attackerRoot: BasePart): boolean
    local delta = attackerRoot.Position - targetRoot.Position
    if delta.Magnitude < 0.001 then
        return true
    end

    local directionToAttacker = delta.Unit
    return targetRoot.CFrame.LookVector:Dot(directionToAttacker) >= CombatConfig.Guard.FrontDotThreshold
end

local function hasLineOfSight(attackerCharacter: Model, targetCharacter: Model, from: Vector3, to: Vector3): boolean
    local params = RaycastParams.new()
    params.FilterType = Enum.RaycastFilterType.Exclude
    params.FilterDescendantsInstances = { attackerCharacter }

    local hit = workspace:Raycast(from, to - from, params)
    return hit == nil or hit.Instance:IsDescendantOf(targetCharacter)
end

local function findTarget(attackerCharacter: Model, attackerRoot: BasePart, attackData): (Model?, Humanoid?, BasePart?)
    local overlap = OverlapParams.new()
    overlap.FilterType = Enum.RaycastFilterType.Exclude
    overlap.FilterDescendantsInstances = { attackerCharacter }

    local parts = workspace:GetPartBoundsInRadius(attackerRoot.Position, attackData.Range, overlap)
    local seen: {[Model]: boolean} = {}
    local candidates = {}

    for _, part in parts do
        local model = part:FindFirstAncestorOfClass("Model")
        if model and not seen[model] then
            seen[model] = true

            local humanoid = model:FindFirstChildOfClass("Humanoid")
            local root = model:FindFirstChild("HumanoidRootPart")

            if humanoid and humanoid.Health > 0 and root and root:IsA("BasePart") then
                local offset = root.Position - attackerRoot.Position
                local distance = offset.Magnitude

                if distance > 0.001 then
                    local facingDot = attackerRoot.CFrame.LookVector:Dot(offset.Unit)
                    if facingDot >= attackData.ArcDotThreshold
                        and hasLineOfSight(attackerCharacter, model, attackerRoot.Position, root.Position)
                    then
                        table.insert(candidates, {
                            character = model,
                            humanoid = humanoid,
                            root = root,
                            distance = distance,
                        })
                    end
                end
            end
        end
    end

    table.sort(candidates, function(a, b)
        return a.distance < b.distance
    end)

    local closest = candidates[1]
    if not closest then
        return nil, nil, nil
    end

    return closest.character, closest.humanoid, closest.root
end

local function setShieldStamina(character: Model, amount: number)
    character:SetAttribute(
        "ShieldStamina",
        math.clamp(amount, 0, CombatConfig.MaxShieldStamina)
    )
end

local function damageGuard(character: Model, amount: number)
    local current = character:GetAttribute("ShieldStamina")
    if typeof(current) ~= "number" then
        current = CombatConfig.MaxShieldStamina
    end

    local remaining = math.max(0, current - amount)
    setShieldStamina(character, remaining)
    lastShieldDamage[character] = os.clock()

    if remaining <= 0 then
        StatusService.Clear(character, "Blocking")
        StatusService.Set(character, "Stunned", true, CombatConfig.Guard.BrokenGuardStun)
    end
end

local function resolveAttack(
    attackerCharacter: Model,
    attackerRoot: BasePart,
    actionName: string,
    attackData
)
    local targetCharacter, targetHumanoid, targetRoot = findTarget(attackerCharacter, attackerRoot, attackData)
    if not targetCharacter or not targetHumanoid or not targetRoot then
        return
    end

    local blocking = StatusService.IsActive(targetCharacter, "Blocking")
    local guarded = blocking and isGuardFacingAttacker(targetRoot, attackerRoot)

    if actionName == "Kick" then
        if guarded then
            damageGuard(targetCharacter, attackData.ShieldStaminaDamage)
            return
        end

        targetHumanoid:TakeDamage(attackData.Damage)
        StatusService.Set(targetCharacter, "Stunned", true, attackData.OpenTargetStun)
        return
    end

    if guarded then
        damageGuard(targetCharacter, CombatConfig.Guard.DamageStaminaCost)
        return
    end

    targetHumanoid:TakeDamage(attackData.Damage)
end

local function setBlocking(player: Player, enabled: boolean)
    local character = getCharacterParts(player)
    if not character then
        return
    end

    if enabled then
        if not StatusService.CanAct(character) or StatusService.IsActive(character, "Kicking") then
            return
        end

        local stamina = character:GetAttribute("ShieldStamina")
        if typeof(stamina) == "number" and stamina <= 0 then
            return
        end

        StatusService.Set(character, "Blocking", true)
    else
        StatusService.Clear(character, "Blocking")
    end
end

local function performAttack(player: Player, actionName: string)
    local attackData = CombatConfig.Attacks[actionName]
    if not attackData then
        return
    end

    local character, _, root = getCharacterParts(player)
    if not character or not root then
        return
    end

    if not StatusService.CanAttack(character) then
        return
    end

    if not canUseAction(player, actionName, attackData.Cooldown) then
        return
    end

    if actionName == "Kick" then
        -- Kicking intentionally drops guard, creating a punish window on a miss.
        StatusService.Clear(character, "Blocking")
        StatusService.Set(character, "Kicking", true, attackData.ActiveTime)
    else
        StatusService.Set(character, "Attacking", actionName, attackData.ActiveTime)
    end

    -- The server owns target selection. The client never tells us who was hit.
    task.delay(math.min(0.12, attackData.ActiveTime), function()
        if character.Parent and root.Parent then
            resolveAttack(character, root, actionName, attackData)
        end
    end)
end

combatAction.OnServerEvent:Connect(function(player: Player, actionName: any, payload: any)
    if typeof(actionName) ~= "string" then
        return
    end

    if actionName == "Block" then
        if typeof(payload) == "boolean" then
            setBlocking(player, payload)
        end
        return
    end

    performAttack(player, actionName)
end)

RunService.Heartbeat:Connect(function(dt: number)
    local now = os.clock()

    for _, player in Players:GetPlayers() do
        local character = player.Character
        if not character then
            continue
        end

        local stamina = character:GetAttribute("ShieldStamina")
        if typeof(stamina) ~= "number" or stamina >= CombatConfig.MaxShieldStamina then
            continue
        end

        if StatusService.IsActive(character, "Blocking") then
            continue
        end

        local lastDamage = lastShieldDamage[character] or 0
        if now - lastDamage < CombatConfig.ShieldRegenDelay then
            continue
        end

        setShieldStamina(character, stamina + CombatConfig.ShieldRegenPerSecond * dt)
    end
end)

Players.PlayerAdded:Connect(function(player: Player)
    player.CharacterAdded:Connect(initializeCharacter)

    if player.Character then
        initializeCharacter(player.Character)
    end
end)

Players.PlayerRemoving:Connect(function(player: Player)
    lastAction[player] = nil
end)

for _, player in Players:GetPlayers() do
    player.CharacterAdded:Connect(initializeCharacter)
    if player.Character then
        initializeCharacter(player.Character)
    end
end
