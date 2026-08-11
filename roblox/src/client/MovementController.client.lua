--!strict

local ContextActionService = game:GetService("ContextActionService")
local Players = game:GetService("Players")

local player = Players.LocalPlayer

local WALK_SPEED = 16
local SPRINT_SPEED = 24
local wantsToSprint = false
local attributeConnections: {RBXScriptConnection} = {}

local function disconnectCharacterSignals()
    for _, connection in attributeConnections do
        connection:Disconnect()
    end
    table.clear(attributeConnections)
end

local function sprintAllowed(character: Model): boolean
    return not character:GetAttribute("State_Stunned")
        and not character:GetAttribute("State_Blocking")
        and not character:GetAttribute("State_Attacking")
        and not character:GetAttribute("State_Kicking")
        and not character:GetAttribute("State_EquipmentLocked")
end

local function refreshSpeed()
    local character = player.Character
    if not character then
        return
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return
    end

    humanoid.WalkSpeed = if wantsToSprint and sprintAllowed(character)
        then SPRINT_SPEED
        else WALK_SPEED
end

local function bindCharacter(character: Model)
    disconnectCharacterSignals()
    wantsToSprint = false

    local humanoid = character:WaitForChild("Humanoid") :: Humanoid
    humanoid.WalkSpeed = WALK_SPEED

    for _, attribute in {
        "State_Stunned",
        "State_Blocking",
        "State_Attacking",
        "State_Kicking",
        "State_EquipmentLocked",
    } do
        table.insert(
            attributeConnections,
            character:GetAttributeChangedSignal(attribute):Connect(refreshSpeed)
        )
    end
end

local function onSprint(_: string, state: Enum.UserInputState)
    if state == Enum.UserInputState.Begin then
        wantsToSprint = true
        refreshSpeed()
    elseif state == Enum.UserInputState.End or state == Enum.UserInputState.Cancel then
        wantsToSprint = false
        refreshSpeed()
    end

    return Enum.ContextActionResult.Pass
end

ContextActionService:BindAction(
    "SPQR_Sprint",
    onSprint,
    false,
    Enum.KeyCode.LeftShift
)

player.CharacterAdded:Connect(bindCharacter)

if player.Character then
    bindCharacter(player.Character)
end
