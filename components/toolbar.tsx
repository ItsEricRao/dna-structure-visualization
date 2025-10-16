"use client"

import type { ElementType } from "@/types/dna-types"
import { Hexagon, Circle, Square, Minus, Link, Link2 } from "lucide-react"

interface ToolbarProps {
  selectedTool: ElementType | null
  onSelectTool: (tool: ElementType) => void
}

const tools = [
  {
    type: "deoxyribose" as ElementType,
    icon: Hexagon,
    label: "脱氧核糖",
    description: "五碳糖（戊糖），形成DNA骨架。C5'连接磷酸基团",
    color: "#3b82f6",
  },
  {
    type: "phosphate" as ElementType,
    icon: Circle,
    label: "磷酸基团",
    description: "磷酸基团（PO₄³⁻），连接糖分子形成骨架",
    color: "#f59e0b",
  },
  {
    type: "adenine" as ElementType,
    icon: Square,
    label: "腺嘌呤 (A)",
    description: "嘌呤碱基，与胸腺嘧啶配对（2个氢键）",
    color: "#10b981",
  },
  {
    type: "thymine" as ElementType,
    icon: Square,
    label: "胸腺嘧啶 (T)",
    description: "嘧啶碱基，与腺嘌呤配对（2个氢键）",
    color: "#ef4444",
  },
  {
    type: "guanine" as ElementType,
    icon: Square,
    label: "鸟嘌呤 (G)",
    description: "嘌呤碱基，与胞嘧啶配对（3个氢键）",
    color: "#8b5cf6",
  },
  {
    type: "cytosine" as ElementType,
    icon: Square,
    label: "胞嘧啶 (C)",
    description: "嘧啶碱基，与鸟嘌呤配对（3个氢键）",
    color: "#ec4899",
  },
  {
    type: "hydrogen-bond" as ElementType,
    icon: Minus,
    label: "氢键",
    description: "碱基对之间的弱键（虚线）",
    color: "#06b6d4",
  },
  {
    type: "phosphodiester-straight" as ElementType,
    icon: Link,
    label: "磷酸二酯键（直线）",
    description: "连接核苷酸的共价键",
    color: "#ec4899",
  },
  {
    type: "phosphodiester-bent" as ElementType,
    icon: Link2,
    label: "磷酸二酯键（弯曲）",
    description: "连接核苷酸的共价键",
    color: "#ec4899",
  },
  {
    type: "chemical-bond" as ElementType,
    icon: Minus,
    label: "化学键",
    description: "普通共价键（实线）",
    color: "#a3a3a3",
  },
]

export function Toolbar({ selectedTool, onSelectTool }: ToolbarProps) {
  return (
    <aside className="w-80 border-r border-border bg-card p-4 overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">DNA 组件</h2>

        {tools.map((tool) => {
          const Icon = tool.icon
          const isSelected = selectedTool === tool.type

          return (
            <button
              key={tool.type}
              onClick={() => onSelectTool(tool.type)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isSelected ? "border-primary bg-primary/10" : "border-border bg-secondary hover:bg-secondary/80"
              }`}
              title={tool.description}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md flex-shrink-0" style={{ backgroundColor: `${tool.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: tool.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{tool.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-2">使用说明：</h3>
        <ol className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          <li>1. 从上方选择一个组件</li>
          <li>2. 点击画布放置组件</li>
          <li>3. 拖动元素重新定位</li>
          <li>4. 右键点击删除元素</li>
          <li>5. 双击元素旋转180度</li>
          <li>6. 使用控制栏撤销/重做/清空</li>
        </ol>
      </div>
    </aside>
  )
}
