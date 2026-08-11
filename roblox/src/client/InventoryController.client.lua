--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local player = Players.LocalPlayer
local equipmentRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("Equipment") :: RemoteEvent

local playerData = Workspace:WaitForChild("PlayerData"):WaitForChild(player.Name)
local inventory = playerData:WaitForChild("Inventory")
local equipped = playerData:WaitForChild("Equipped")

local gui = player:WaitForChild("PlayerGui"):WaitForChild("InventoryGui")
local main = gui:WaitForChild("Main")
local itemsFrame = main:WaitForChild("Items") :: ScrollingFrame
local template = itemsFrame:WaitForChild("Template") :: Frame

local frameByModule: {[Instance]: Frame} = {}
local clickDebounce: {[Instance]: boolean} = setmetatable({}, { __mode = "k" })

local function ensureWorldModel(viewport: ViewportFrame): WorldModel
    local worldModel = viewport:FindFirstChildOfClass("WorldModel")
    if worldModel then
        return worldModel
    end

    worldModel = Instance.new("WorldModel")
    worldModel.Name = "PreviewWorld"
    worldModel.Parent = viewport
    return worldModel
end

local function anchorAll(root: Instance)
    for _, descendant in root:GetDescendants() do
        if descendant:IsA("BasePart") then
            descendant.Anchored = true
            descendant.AssemblyLinearVelocity = Vector3.zero
            descendant.AssemblyAngularVelocity = Vector3.zero
        end
    end

    if root:IsA("BasePart") then
        root.Anchored = true
    end
end

local function hardenForViewport(root: Instance)
    for _, descendant in root:GetDescendants() do
        if descendant:IsA("BasePart") then
            descendant.CanCollide = false
            descendant.CanQuery = false
            descendant.CanTouch = false
            descendant.CastShadow = false
        elseif descendant:IsA("BaseScript") then
            descendant.Disabled = true
        elseif descendant:IsA("ParticleEmitter") or descendant:IsA("Trail") then
            descendant.Enabled = false
        end
    end
end

local function getBounds(root: Instance): (CFrame, Vector3)
    if root:IsA("Model") then
        return root:GetBoundingBox()
    end

    if root:IsA("BasePart") then
        return root.CFrame, root.Size
    end

    return CFrame.new(), Vector3.one
end

local function centerOnBBoxKeepRotation(root: Instance)
    local boundsCFrame = getBounds(root)

    if root:IsA("Model") then
        local pivot = root:GetPivot()
        local offset = pivot.Position - boundsCFrame.Position
        root:PivotTo(CFrame.new(offset) * pivot.Rotation)
    elseif root:IsA("BasePart") then
        root.CFrame = root.CFrame.Rotation
    end
end

local function fitDistanceForBBox(size: Vector3, fieldOfView: number): number
    local halfHeight = math.max(size.Y, size.X * 0.7) * 0.5
    local halfFov = math.rad(fieldOfView * 0.5)
    local distance = halfHeight / math.tan(halfFov)

    return math.max(distance * 1.35, size.Z * 1.8, 2.5)
end

local function setupViewportCamera(viewport: ViewportFrame, root: Instance)
    local camera = viewport:FindFirstChildOfClass("Camera")
    if not camera then
        camera = Instance.new("Camera")
        camera.Name = "PreviewCamera"
        camera.FieldOfView = 32
        camera.Parent = viewport
    end

    viewport.CurrentCamera = camera

    local boundsCFrame, size = getBounds(root)
    local focus = boundsCFrame.Position
    local distance = fitDistanceForBBox(size, camera.FieldOfView)

    camera.CFrame = CFrame.lookAt(
        focus + Vector3.new(size.X * 0.25, size.Y * 0.08, distance),
        focus
    )
end

local function pickRenderableRoot(itemModule: Instance): Instance?
    if itemModule:IsA("ModuleScript") then
        local ok, itemData = pcall(require, itemModule)
        if ok and typeof(itemData) == "table" and typeof(itemData.Model) == "Instance" then
            return itemData.Model
        end
    end

    local modelLibrary = ReplicatedStorage:FindFirstChild("ItemModels")
    if modelLibrary then
        return modelLibrary:FindFirstChild(itemModule.Name)
    end

    return itemModule:FindFirstChildWhichIsA("Model")
        or itemModule:FindFirstChildWhichIsA("BasePart")
end

local function cloneForViewport(itemModule: Instance): Instance?
    local renderable = pickRenderableRoot(itemModule)
    if not renderable then
        return nil
    end

    local clone = renderable:Clone()
    anchorAll(clone)
    hardenForViewport(clone)
    centerOnBBoxKeepRotation(clone)
    return clone
end

local function itemDisplayName(itemModule: Instance): string
    if itemModule:IsA("ModuleScript") then
        local ok, itemData = pcall(require, itemModule)
        if ok and typeof(itemData) == "table" and typeof(itemData.DisplayName) == "string" then
            return itemData.DisplayName
        end
    end

    return itemModule:GetAttribute("DisplayName") or itemModule.Name
end

local function clickItemButton(itemModule: Instance)
    if clickDebounce[itemModule] then
        return
    end

    clickDebounce[itemModule] = true

    local operation = if itemModule.Parent == equipped then "Unequip" else "Equip"
    equipmentRemote:FireServer(operation, itemModule)

    task.delay(0.25, function()
        clickDebounce[itemModule] = nil
    end)
end

local function createOrUpdateFrameForModule(itemModule: Instance)
    local frame = frameByModule[itemModule]
    if not frame then
        frame = template:Clone()
        frame.Name = itemModule.Name
        frame.Visible = true
        frame.Parent = itemsFrame
        frameByModule[itemModule] = frame
    end

    local isEquipped = itemModule.Parent == equipped
    frame.LayoutOrder = if isEquipped then 0 else 100

    local nameLabel = frame:FindFirstChild("ItemName", true)
    if nameLabel and nameLabel:IsA("TextLabel") then
        nameLabel.Text = itemDisplayName(itemModule)
    end

    local stateLabel = frame:FindFirstChild("State", true)
    if stateLabel and stateLabel:IsA("TextLabel") then
        stateLabel.Text = if isEquipped then "EQUIPPED" else "INVENTORY"
    end

    local button = frame:FindFirstChild("EquipButton", true)
    if button and button:IsA("GuiButton") then
        if button:IsA("TextButton") then
            button.Text = if isEquipped then "Unequip" else "Equip"
        end

        if not button:GetAttribute("Bound") then
            button:SetAttribute("Bound", true)
            button.Activated:Connect(function()
                clickItemButton(itemModule)
            end)
        end
    end

    local viewport = frame:FindFirstChildWhichIsA("ViewportFrame", true)
    if viewport then
        local worldModel = ensureWorldModel(viewport)
        worldModel:ClearAllChildren()

        local clone = cloneForViewport(itemModule)
        if clone then
            clone.Parent = worldModel
            setupViewportCamera(viewport, clone)
        end
    end
end

local function removeFrame(itemModule: Instance)
    -- When Roblox reparents an item between Inventory and Equipped, defer one
    -- frame so the new parent can be observed before deciding it was deleted.
    task.defer(function()
        if itemModule.Parent == inventory or itemModule.Parent == equipped then
            createOrUpdateFrameForModule(itemModule)
            return
        end

        local frame = frameByModule[itemModule]
        if frame then
            frame:Destroy()
            frameByModule[itemModule] = nil
        end
    end)
end

local function bindFolder(folder: Instance)
    folder.ChildAdded:Connect(createOrUpdateFrameForModule)
    folder.ChildRemoved:Connect(removeFrame)

    for _, child in folder:GetChildren() do
        createOrUpdateFrameForModule(child)
    end
end

template.Visible = false
bindFolder(equipped) -- equipped first so the initial layout is stable
bindFolder(inventory)
