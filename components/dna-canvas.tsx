"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { DNAElement, ElementType } from "@/types/dna-types"

interface DNACanvasProps {
  elements: DNAElement[]
  selectedTool: ElementType | null
  zoom: number
  onAddElement: (element: DNAElement) => void
  onUpdateElement: (id: string, updates: Partial<DNAElement>) => void
  onDeleteElement: (id: string) => void
  onDeselectTool: () => void
}

const chineseLabels: Record<ElementType, string> = {
  deoxyribose: "脱氧核糖",
  phosphate: "磷酸基团",
  adenine: "腺嘌呤",
  thymine: "胸腺嘧啶",
  guanine: "鸟嘌呤",
  cytosine: "胞嘧啶",
  "hydrogen-bond": "氢键",
  "phosphodiester-straight": "磷酸二酯键（直线）",
  "phosphodiester-bent": "磷酸二酯键（弯曲）",
  "chemical-bond": "化学键",
}

export function DNACanvas({
  elements,
  selectedTool,
  zoom,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onDeselectTool,
}: DNACanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    ctx.save()
    ctx.scale(zoom, zoom)

    elements.forEach((element) => {
      ctx.save()
      ctx.translate(element.x, element.y)
      ctx.rotate((element.rotation * Math.PI) / 180)
      if (element.scale) {
        ctx.scale(element.scale, element.scale)
      }

      const isHovered = hoveredElement === element.id

      switch (element.type) {
        case "deoxyribose":
          drawDeoxyribose(ctx, isHovered)
          break
        case "phosphate":
          drawPhosphate(ctx, isHovered)
          break
        case "adenine":
        case "thymine":
        case "guanine":
        case "cytosine":
          drawBase(ctx, element.type, isHovered)
          break
        case "hydrogen-bond":
          drawHydrogenBond(ctx, isHovered)
          break
        case "phosphodiester-straight":
          drawPhosphodiesterStraight(ctx, isHovered)
          break
        case "phosphodiester-bent":
          drawPhosphodiesterBent(ctx, isHovered)
          break
        case "chemical-bond":
          drawChemicalBond(ctx, isHovered)
          break
      }

      ctx.restore()
    })

    ctx.restore()
  }, [elements, dimensions, zoom, hoveredElement])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const newElement: DNAElement = {
      id: `${selectedTool}-${Date.now()}`,
      type: selectedTool,
      x,
      y,
      rotation: 0,
      scale: 1,
    }

    onAddElement(newElement)
    onDeselectTool()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      if (isPointInElement(x, y, element)) {
        setDraggedElement(element.id)
        setDragOffset({ x: x - element.x, y: y - element.y })
        break
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (draggedElement) {
      onUpdateElement(draggedElement, {
        x: x - dragOffset.x,
        y: y - dragOffset.y,
      })
    } else {
      let foundHover = false
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i]
        if (isPointInElement(x, y, element)) {
          setHoveredElement(element.id)
          foundHover = true
          break
        }
      }
      if (!foundHover) {
        setHoveredElement(null)
      }
    }
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      if (isPointInElement(x, y, element)) {
        onDeleteElement(element.id)
        break
      }
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      if (isPointInElement(x, y, element)) {
        onUpdateElement(element.id, {
          rotation: (element.rotation + 180) % 360,
        })
        break
      }
    }
  }

  return (
    <div ref={containerRef} className="flex-1 bg-background relative">
      {selectedTool && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          点击画布放置 {chineseLabels[selectedTool]}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        className="cursor-crosshair"
        style={{
          cursor: draggedElement ? "grabbing" : hoveredElement ? "grab" : selectedTool ? "crosshair" : "default",
        }}
      />
    </div>
  )
}

function isPointInElement(x: number, y: number, element: DNAElement): boolean {
  const dx = x - element.x
  const dy = y - element.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  switch (element.type) {
    case "deoxyribose":
      return distance < 40
    case "phosphate":
      return distance < 30
    case "adenine":
    case "thymine":
    case "guanine":
    case "cytosine":
      return Math.abs(dx) < 35 && Math.abs(dy) < 25
    case "hydrogen-bond":
      return Math.abs(dx) < 40 && Math.abs(dy) < 5
    case "phosphodiester-straight": {
      // 计算点到线段的距离（考虑旋转/缩放），线段与 drawPhosphodiesterStraight 一致
      const length = 80
      const scale = element.scale || 1
      const rad = ((-element.rotation || 0) * Math.PI) / 180
      const cosR = Math.cos(rad)
      const sinR = Math.sin(rad)
      const localX = (dx * cosR - dy * sinR) / scale
      const localY = (dx * sinR + dy * cosR) / scale
      const x1 = length / 2
      const y1 = -length / 10
      const x2 = -length / 2
      const y2 = length / 10
      const d = pointToSegmentDistance(localX, localY, x1, y1, x2, y2)
      return d <= 6
    }
    case "phosphodiester-bent": {
      // 折线两段：(-L/2,0)->(0,L/2) 与 (0,L/2)->(L/2,L/2)
      const length = 80
      const scale = element.scale || 1
      const rad = ((-element.rotation || 0) * Math.PI) / 180
      const cosR = Math.cos(rad)
      const sinR = Math.sin(rad)
      const localX = (dx * cosR - dy * sinR) / scale
      const localY = (dx * sinR + dy * cosR) / scale
      const elbowX = 0
      const elbowY = length / 2
      const d1 = pointToSegmentDistance(localX, localY, -length / 2, 0, elbowX, elbowY)
      const d2 = pointToSegmentDistance(localX, localY, elbowX, elbowY, length / 2, elbowY)
      const d = Math.min(d1, d2)
      return d <= 6
    }
    case "chemical-bond":
      return Math.abs(dx) < 40 && Math.abs(dy) < 5
    default:
      return false
  }
}

function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const vx = x2 - x1
  const vy = y2 - y1
  const wx = px - x1
  const wy = py - y1
  const c1 = vx * wx + vy * wy
  if (c1 <= 0) return Math.hypot(px - x1, py - y1)
  const c2 = vx * vx + vy * vy
  if (c2 <= c1) return Math.hypot(px - x2, py - y2)
  const b = c1 / c2
  const bx = x1 + b * vx
  const by = y1 + b * vy
  return Math.hypot(px - bx, py - by)
}

function drawDeoxyribose(ctx: CanvasRenderingContext2D, isHovered: boolean) {
  const radius = 40

  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = isHovered ? "#3b82f640" : "#3b82f620"
  ctx.fill()
  ctx.strokeStyle = "#3b82f6"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = "#ededed"
  ctx.font = "bold 11px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // 顶部为氧（O），顺时针：C1'（最右）、C2'、C3'、C4'。
  // C5' 不在糖上标注，改为在弯曲的磷酸二酯键拐点处标注。
  const oxygenAngle = -90
  const oxygenX = Math.cos((oxygenAngle * Math.PI) / 180) * 28
  const oxygenY = Math.sin((oxygenAngle * Math.PI) / 180) * 28
  ctx.fillText("O", oxygenX, oxygenY)

  const labelPositions = [
    { angle: -18, label: "C1'" }, // 最右侧
    { angle: 54, label: "C2'" },
    { angle: 126, label: "C3'" },
    { angle: 198, label: "C4'" },
  ]

  labelPositions.forEach((pos) => {
    const angle = pos.angle * (Math.PI / 180)
    const x = Math.cos(angle) * 28
    const y = Math.sin(angle) * 28
    ctx.fillText(pos.label, x, y)
  })
}

function drawPhosphate(ctx: CanvasRenderingContext2D, isHovered: boolean) {
  const radius = 30

  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fillStyle = isHovered ? "#f59e0b40" : "#f59e0b20"
  ctx.fill()
  ctx.strokeStyle = "#f59e0b"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = "#f59e0b"
  ctx.font = "bold 20px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("P", 0, 0)

  ctx.fillStyle = "#ededed"
  ctx.font = "bold 10px sans-serif"
  const positions = [
    { x: 0, y: -20, label: "O" },
    { x: -17, y: 10, label: "O" },
    { x: 17, y: 10, label: "O" },
  ]
  positions.forEach((pos) => {
    ctx.fillText(pos.label, pos.x, pos.y)
  })
}

function drawBase(ctx: CanvasRenderingContext2D, type: string, isHovered: boolean) {
  const colors: Record<string, string> = {
    adenine: "#10b981",
    thymine: "#ef4444",
    guanine: "#8b5cf6",
    cytosine: "#f59e0b",
  }

  const labels: Record<string, string> = {
    adenine: "A",
    thymine: "T",
    guanine: "G",
    cytosine: "C",
  }

  const chineseNames: Record<string, string> = {
    adenine: "腺嘌呤",
    thymine: "胸腺嘧啶",
    guanine: "鸟嘌呤",
    cytosine: "胞嘧啶",
  }

  const color = colors[type] || "#888"
  const label = labels[type] || "?"
  const chineseName = chineseNames[type] || ""

  const width = 70
  const height = 50
  const cornerRadius = 8

  ctx.beginPath()
  ctx.moveTo(-width / 2 + cornerRadius, -height / 2)
  ctx.lineTo(width / 2 - cornerRadius, -height / 2)
  ctx.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius)
  ctx.lineTo(width / 2, height / 2 - cornerRadius)
  ctx.quadraticCurveTo(width / 2, height / 2, width / 2 - cornerRadius, height / 2)
  ctx.lineTo(-width / 2 + cornerRadius, height / 2)
  ctx.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - cornerRadius)
  ctx.lineTo(-width / 2, -height / 2 + cornerRadius)
  ctx.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2)
  ctx.closePath()

  ctx.fillStyle = isHovered ? color + "40" : color + "20"
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = color
  ctx.font = "bold 24px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(label, 0, -5)

  ctx.fillStyle = "#ededed"
  ctx.font = "10px sans-serif"
  ctx.fillText(chineseName, 0, 15)
}

function drawHydrogenBond(ctx: CanvasRenderingContext2D, isHovered: boolean) {
  const length = 80

  ctx.strokeStyle = isHovered ? "#06b6d4" : "#06b6d480"
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(-length / 2, 0)
  ctx.lineTo(length / 2, 0)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = "#06b6d4"
  ctx.font = "bold 12px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("H", -length / 4, -10)
  ctx.fillText("H", length / 4, -10)
}

function drawPhosphodiesterStraight(ctx: CanvasRenderingContext2D, isHovered: boolean) {
  // 水平长度与普通化学键一致（80），并保持轻微斜率（向左下）
  const length = 80

  ctx.strokeStyle = isHovered ? "#ec4899" : "#ec489980"
  ctx.lineWidth = 3
  ctx.beginPath()
  // 与普通化学键相同的水平跨度：[-length/2, length/2]
  // 为了形成小角度斜率，添加轻微的上下偏移
  const startX = length / 2
  const endX = -length / 2
  const startY = -length / 10
  const endY = length / 10
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  ctx.fillStyle = "#ec4899"
  ctx.font = "bold 9px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("磷酸二酯键", 0, -20)
}

function drawPhosphodiesterBent(ctx: CanvasRenderingContext2D, isHovered: boolean) {
  const length = 80

  ctx.strokeStyle = isHovered ? "#ec4899" : "#ec489980"
  ctx.lineWidth = 3
  ctx.beginPath()
  // 先斜45°向下（到拐点），再水平向右
  const elbowX = 0
  const elbowY = length / 2
  ctx.moveTo(-length / 2, 0)
  ctx.lineTo(elbowX, elbowY)
  ctx.lineTo(length / 2, elbowY)
  ctx.stroke()

  ctx.fillStyle = "#ec4899"
  ctx.font = "bold 9px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("磷酸二酯键", 0, elbowY + 15)

  // 在拐点处标注 C5'
  ctx.fillStyle = "#ededed"
  ctx.font = "bold 10px sans-serif"
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.fillText("C5'", elbowX + 6, elbowY)
}

function drawChemicalBond(ctx: CanvasRenderingContext2D, isHovered: boolean) {
  const length = 80

  ctx.strokeStyle = isHovered ? "#a3a3a3" : "#a3a3a380"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-length / 2, 0)
  ctx.lineTo(length / 2, 0)
  ctx.stroke()
}
