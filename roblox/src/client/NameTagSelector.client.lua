--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local nameBridge = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("NameBridge") :: RemoteFunction

local playerGui = player:WaitForChild("PlayerGui")
local tagsGui = playerGui:WaitForChild("TagsGui")
local tagsFrame = tagsGui:WaitForChild("TagsFrame") :: Frame
local scrollingFrame = tagsFrame:WaitForChild("ScrollingFrame") :: ScrollingFrame
local template = scrollingFrame:WaitForChild("Template") :: TextButton
local toggleButton = tagsGui:WaitForChild("ToggleButton") :: TextButton

local function colourFromPayload(payload): Color3
    local colour = payload.colour
    if typeof(colour) ~= "table" then
        return Color3.new(1, 1, 1)
    end

    return Color3.fromRGB(
        tonumber(colour.r) or 255,
        tonumber(colour.g) or 255,
        tonumber(colour.b) or 255
    )
end

local function clearEntries()
    for _, child in scrollingFrame:GetChildren() do
        if child:IsA("TextButton") and child ~= template then
            child:Destroy()
        end
    end
end

local function addEntry(key: string, data)
    local button = template:Clone()
    button.Name = key
    button.Visible = true
    button.Text = data.label or key
    button.TextColor3 = colourFromPayload(data)
    button.Parent = scrollingFrame

    button.Activated:Connect(function()
        local ok, accepted = pcall(function()
            return nameBridge:InvokeServer("post", key)
        end)

        if ok and accepted == true then
            tagsFrame.Visible = false
        end
    end)
end

local function refresh()
    clearEntries()

    local ok, tagData = pcall(function()
        return nameBridge:InvokeServer("get")
    end)

    if not ok or typeof(tagData) ~= "table" then
        return
    end

    local orderedKeys = {}
    for key in tagData do
        table.insert(orderedKeys, key)
    end
    table.sort(orderedKeys)

    for _, key in orderedKeys do
        addEntry(key, tagData[key])
    end
end

toggleButton.Activated:Connect(function()
    tagsFrame.Visible = not tagsFrame.Visible
    if tagsFrame.Visible then
        refresh()
    end
end)

template.Visible = false
tagsFrame.Visible = false
