--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local remotes = ReplicatedStorage:FindFirstChild("Remotes") or Instance.new("Folder")
remotes.Name = "Remotes"
remotes.Parent = ReplicatedStorage

local equipmentRemote = remotes:FindFirstChild("Equipment") or Instance.new("RemoteEvent")
equipmentRemote.Name = "Equipment"
equipmentRemote.Parent = remotes

local VALID_OPERATIONS = {
    Equip = true,
    Unequip = true,
}

local function playerFolders(player: Player): (Instance?, Instance?)
    local playerDataRoot = Workspace:FindFirstChild("PlayerData")
    local data = playerDataRoot and playerDataRoot:FindFirstChild(player.Name)
    if not data then
        return nil, nil
    end

    return data:FindFirstChild("Inventory"), data:FindFirstChild("Equipped")
end

local function sameSlotEquipped(equipped: Instance, item: Instance): Instance?
    local slot = item:GetAttribute("Slot")
    if typeof(slot) ~= "string" or slot == "" then
        return nil
    end

    for _, equippedItem in equipped:GetChildren() do
        if equippedItem ~= item and equippedItem:GetAttribute("Slot") == slot then
            return equippedItem
        end
    end

    return nil
end

local function equip(player: Player, item: Instance)
    local inventory, equipped = playerFolders(player)
    if not inventory or not equipped then
        return
    end

    -- Never trust an Instance supplied by a client unless it is still inside
    -- that player's own server-owned inventory hierarchy.
    if item.Parent ~= inventory then
        return
    end

    local existing = sameSlotEquipped(equipped, item)
    if existing then
        existing.Parent = inventory
    end

    item.Parent = equipped
end

local function unequip(player: Player, item: Instance)
    local inventory, equipped = playerFolders(player)
    if not inventory or not equipped then
        return
    end

    if item.Parent ~= equipped then
        return
    end

    item.Parent = inventory
end

equipmentRemote.OnServerEvent:Connect(function(player: Player, operation: any, item: any)
    if typeof(operation) ~= "string" or not VALID_OPERATIONS[operation] then
        return
    end

    if typeof(item) ~= "Instance" then
        return
    end

    if operation == "Equip" then
        equip(player, item)
    else
        unequip(player, item)
    end
end)
