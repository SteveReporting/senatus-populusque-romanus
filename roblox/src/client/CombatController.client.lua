--!strict

local ContextActionService = game:GetService("ContextActionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local combatAction = remotes:WaitForChild("CombatAction") :: RemoteEvent

local toggleGuard = false
local holdGuard = false
local localActionLock = false

local ACTION_LOCKS = {
    Slash = 0.35,
    Stab = 0.42,
    Kick = 0.55,
}

local function getCharacter(): Model?
    return player.Character
end

local function getAnimator(): Animator?
    local character = getCharacter()
    if not character then
        return nil
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return nil
    end

    return humanoid:FindFirstChildOfClass("Animator")
end

local function playAnimation(animationName: string)
    local animations = ReplicatedStorage:FindFirstChild("Animations")
    local combatFolder = animations and animations:FindFirstChild("Combat")
    local animation = combatFolder and combatFolder:FindFirstChild(animationName)

    if not animation or not animation:IsA("Animation") then
        return
    end

    local animator = getAnimator()
    if not animator then
        return
    end

    local track = animator:LoadAnimation(animation)
    track:Play(0.08)
end

local function desiredGuardState(): boolean
    return toggleGuard or holdGuard
end

local function syncGuard()
    combatAction:FireServer("Block", desiredGuardState())
end

local function canRequestAttack(): boolean
    if localActionLock then
        return false
    end

    local character = getCharacter()
    if not character then
        return false
    end

    return not character:GetAttribute("State_Stunned")
end

local function requestAttack(actionName: "Slash" | "Stab" | "Kick")
    if not canRequestAttack() then
        return
    end

    localActionLock = true

    if actionName == "Kick" then
        -- The server also drops guard. Doing it locally makes the presentation
        -- react immediately rather than waiting for replication.
        holdGuard = false
        toggleGuard = false
        syncGuard()
    end

    playAnimation(actionName)
    combatAction:FireServer(actionName)

    task.delay(ACTION_LOCKS[actionName], function()
        localActionLock = false
    end)
end

local function onSlash(_: string, inputState: Enum.UserInputState)
    if inputState == Enum.UserInputState.Begin then
        requestAttack("Slash")
    end
    return Enum.ContextActionResult.Sink
end

local function onStab(_: string, inputState: Enum.UserInputState)
    if inputState == Enum.UserInputState.Begin then
        requestAttack("Stab")
    end
    return Enum.ContextActionResult.Sink
end

local function onKick(_: string, inputState: Enum.UserInputState)
    if inputState == Enum.UserInputState.Begin then
        requestAttack("Kick")
    end
    return Enum.ContextActionResult.Sink
end

local function onToggleGuard(_: string, inputState: Enum.UserInputState)
    if inputState == Enum.UserInputState.Begin then
        toggleGuard = not toggleGuard
        syncGuard()
    end
    return Enum.ContextActionResult.Sink
end

ContextActionService:BindAction("SPQR_Slash", onSlash, false, Enum.UserInputType.MouseButton1)
ContextActionService:BindAction("SPQR_Stab", onStab, false, Enum.KeyCode.R)
ContextActionService:BindAction("SPQR_Kick", onKick, false, Enum.KeyCode.K)
ContextActionService:BindAction("SPQR_ToggleGuard", onToggleGuard, false, Enum.KeyCode.E)

UserInputService.InputBegan:Connect(function(input: InputObject, processed: boolean)
    if processed then
        return
    end

    if input.UserInputType == Enum.UserInputType.MouseButton2 then
        holdGuard = true
        syncGuard()
    end
end)

UserInputService.InputEnded:Connect(function(input: InputObject)
    if input.UserInputType == Enum.UserInputType.MouseButton2 then
        holdGuard = false
        syncGuard()
    end
end)

player.CharacterAdded:Connect(function()
    toggleGuard = false
    holdGuard = false
    localActionLock = false
end)
