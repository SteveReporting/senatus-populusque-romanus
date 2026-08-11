--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local remotes = ReplicatedStorage:FindFirstChild("Remotes") or Instance.new("Folder")
remotes.Name = "Remotes"
remotes.Parent = ReplicatedStorage

local nameBridge = remotes:FindFirstChild("NameBridge") or Instance.new("RemoteFunction")
nameBridge.Name = "NameBridge"
nameBridge.Parent = remotes

-- Public group ID used by the original Roman project. Rank gates are examples of
-- server-side authorization; clients never send arbitrary text or colours.
local ROME_GROUP_ID = 35084035

local TAGS = {
    Citizen = {
        label = "CITIZEN",
        colour = Color3.fromRGB(210, 210, 210),
        minRank = 0,
    },
    Legionary = {
        label = "LEGIONARY",
        colour = Color3.fromRGB(182, 45, 45),
        minRank = 1,
    },
    Praetorian = {
        label = "PRAETORIAN GUARD",
        colour = Color3.fromRGB(126, 28, 28),
        minRank = 1,
    },
    Senate = {
        label = "SENATE",
        colour = Color3.fromRGB(205, 166, 61),
        minRank = 1,
    },
}

local function playerRank(player: Player): number
    local ok, rank = pcall(function()
        return player:GetRankInGroup(ROME_GROUP_ID)
    end)

    if not ok then
        return 0
    end

    return rank
end

local function serialiseAvailableTags(player: Player)
    local rank = playerRank(player)
    local result = {}

    for key, data in TAGS do
        if rank >= data.minRank then
            result[key] = {
                label = data.label,
                colour = {
                    r = math.round(data.colour.R * 255),
                    g = math.round(data.colour.G * 255),
                    b = math.round(data.colour.B * 255),
                },
            }
        end
    end

    return result
end

local function applyBillboard(player: Player, character: Model)
    local head = character:FindFirstChild("Head")
    if not head or not head:IsA("BasePart") then
        return
    end

    local old = head:FindFirstChild("SPQRNameTag")
    if old then
        old:Destroy()
    end

    local gui = Instance.new("BillboardGui")
    gui.Name = "SPQRNameTag"
    gui.Size = UDim2.fromOffset(240, 56)
    gui.StudsOffset = Vector3.new(0, 2.7, 0)
    gui.AlwaysOnTop = true
    gui.MaxDistance = 90
    gui.Parent = head

    local nameLabel = Instance.new("TextLabel")
    nameLabel.Name = "PlayerName"
    nameLabel.BackgroundTransparency = 1
    nameLabel.Size = UDim2.new(1, 0, 0.55, 0)
    nameLabel.Font = Enum.Font.GothamMedium
    nameLabel.Text = player.DisplayName
    nameLabel.TextColor3 = Color3.new(1, 1, 1)
    nameLabel.TextScaled = true
    nameLabel.TextStrokeTransparency = 0.65
    nameLabel.Parent = gui

    local roleLabel = Instance.new("TextLabel")
    roleLabel.Name = "Role"
    roleLabel.BackgroundTransparency = 1
    roleLabel.Position = UDim2.fromScale(0, 0.55)
    roleLabel.Size = UDim2.new(1, 0, 0.35, 0)
    roleLabel.Font = Enum.Font.GothamBold
    roleLabel.TextScaled = true
    roleLabel.TextStrokeTransparency = 0.7
    roleLabel.Parent = gui

    local function refresh()
        roleLabel.Text = player:GetAttribute("RoleTag") or "CITIZEN"

        local r = player:GetAttribute("RoleTagR") or 210
        local g = player:GetAttribute("RoleTagG") or 210
        local b = player:GetAttribute("RoleTagB") or 210
        roleLabel.TextColor3 = Color3.fromRGB(r, g, b)
    end

    player:GetAttributeChangedSignal("RoleTag"):Connect(refresh)
    player:GetAttributeChangedSignal("RoleTagR"):Connect(refresh)
    player:GetAttributeChangedSignal("RoleTagG"):Connect(refresh)
    player:GetAttributeChangedSignal("RoleTagB"):Connect(refresh)

    refresh()
end

local function setTag(player: Player, key: string): boolean
    local data = TAGS[key]
    if not data then
        return false
    end

    if playerRank(player) < data.minRank then
        return false
    end

    player:SetAttribute("RoleTagKey", key)
    player:SetAttribute("RoleTag", data.label)
    player:SetAttribute("RoleTagR", math.round(data.colour.R * 255))
    player:SetAttribute("RoleTagG", math.round(data.colour.G * 255))
    player:SetAttribute("RoleTagB", math.round(data.colour.B * 255))
    return true
end

nameBridge.OnServerInvoke = function(player: Player, operation: any, value: any)
    if operation == "get" then
        return serialiseAvailableTags(player)
    end

    if operation == "post" and typeof(value) == "string" then
        return setTag(player, value)
    end

    return nil
end

local function onPlayer(player: Player)
    setTag(player, "Citizen")

    player.CharacterAdded:Connect(function(character)
        character:WaitForChild("Head", 10)
        applyBillboard(player, character)
    end)

    if player.Character then
        applyBillboard(player, player.Character)
    end
end

Players.PlayerAdded:Connect(onPlayer)

for _, player in Players:GetPlayers() do
    onPlayer(player)
end
