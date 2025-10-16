"use client"

import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Download } from "lucide-react"

interface ControlsProps {
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  canUndo: boolean
  canRedo: boolean
  zoom: number
}

export function Controls({ onUndo, onRedo, onClear, onZoomIn, onZoomOut, canUndo, canRedo, zoom }: ControlsProps) {
  const handleExport = () => {
    const stage = document.querySelector("canvas")
    if (stage) {
      const dataURL = stage.toDataURL()
      const link = document.createElement("a")
      link.download = "dna-structure.png"
      link.href = dataURL
      link.click()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 border border-border rounded-lg p-1">
        <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} title="撤销 (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} title="重做 (Ctrl+Y)">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border border-border rounded-lg p-1">
        <Button variant="ghost" size="sm" onClick={onZoomOut} title="缩小">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="sm" onClick={onZoomIn} title="放大">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={handleExport} title="导出为PNG">
        <Download className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={onClear} title="清空画布">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
