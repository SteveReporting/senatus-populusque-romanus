--!strict

--[[
    StatusService
    -------------
    Small replicated-state helper used by the gameplay samples.

    The server remains authoritative: state is stored as character attributes so
    clients can react immediately for UI/animation without owning the decision.
]]

local StatusService = {}

local activeTokens: {[Instance]: {[string]: {}}} = setmetatable({}, { __mode = "k" })

local PREFIX = "State_"

local function attributeName(statusName: string): string
    return PREFIX .. statusName
end

local function tokenBucket(character: Model): {[string]: {}}
    local bucket = activeTokens[character]
    if bucket then
        return bucket
    end

    bucket = {}
    activeTokens[character] = bucket
    return bucket
end

function StatusService.Set(character: Model, statusName: string, value: any, duration: number?)
    assert(character and character:IsA("Model"), "StatusService.Set expects a character Model")
    assert(statusName ~= "", "statusName cannot be empty")

    local key = attributeName(statusName)
    character:SetAttribute(key, value)

    local bucket = tokenBucket(character)
    local token = {}
    bucket[statusName] = token

    if duration and duration > 0 then
        task.delay(duration, function()
            if not character.Parent then
                return
            end

            -- A newer Set call replaces the token. This prevents an older timer
            -- from clearing a refreshed stun/cooldown early.
            if bucket[statusName] ~= token then
                return
            end

            bucket[statusName] = nil
            character:SetAttribute(key, nil)
        end)
    end
end

function StatusService.Clear(character: Model, statusName: string)
    local bucket = activeTokens[character]
    if bucket then
        bucket[statusName] = nil
    end

    character:SetAttribute(attributeName(statusName), nil)
end

function StatusService.Get(character: Model, statusName: string): any
    return character:GetAttribute(attributeName(statusName))
end

function StatusService.IsActive(character: Model, statusName: string): boolean
    local value = StatusService.Get(character, statusName)
    return value ~= nil and value ~= false
end

function StatusService.CanAct(character: Model): boolean
    return not StatusService.IsActive(character, "Stunned")
        and not StatusService.IsActive(character, "EquipmentLocked")
end

function StatusService.CanAttack(character: Model): boolean
    return StatusService.CanAct(character)
        and not StatusService.IsActive(character, "Attacking")
        and not StatusService.IsActive(character, "Kicking")
end

function StatusService.Destroy(character: Model)
    activeTokens[character] = nil
end

return StatusService
