--!strict

local Players = game:GetService("Players")
local TextChatService = game:GetService("TextChatService")

local chatWindow = TextChatService.ChatWindowConfiguration
local bubbleConfig = TextChatService.BubbleChatConfiguration

-- Presentation only. Message delivery, filtering, permissions and moderation stay
-- inside Roblox TextChatService.
chatWindow.BackgroundTransparency = 0.25
chatWindow.TextSize = 17

bubbleConfig.Enabled = true
bubbleConfig.MaxDistance = 70
bubbleConfig.MinimizeDistance = 30
bubbleConfig.BubbleDuration = 12
bubbleConfig.TailVisible = true
bubbleConfig.BackgroundTransparency = 0.12

local function byte(value: any, fallback: number): number
    if typeof(value) ~= "number" then
        return fallback
    end

    return math.clamp(math.round(value), 0, 255)
end

local function rolePrefix(player: Player): string?
    local label = player:GetAttribute("RoleTag")
    if typeof(label) ~= "string" or label == "" then
        return nil
    end

    local r = byte(player:GetAttribute("RoleTagR"), 210)
    local g = byte(player:GetAttribute("RoleTagG"), 210)
    local b = byte(player:GetAttribute("RoleTagB"), 210)

    return string.format(
        '<font color="#%02X%02X%02X">[%s]</font>',
        r,
        g,
        b,
        label
    )
end

TextChatService.OnIncomingMessage = function(message: TextChatMessage)
    local source = message.TextSource
    if not source then
        return nil
    end

    local speaker = Players:GetPlayerByUserId(source.UserId)
    if not speaker then
        return nil
    end

    local prefix = rolePrefix(speaker)
    if not prefix then
        return nil
    end

    local properties = Instance.new("TextChatMessageProperties")
    properties.PrefixText = string.format("%s %s", prefix, message.PrefixText)
    return properties
end
