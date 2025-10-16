"use client"

import { useState } from "react"
import { DNACanvas } from "@/components/dna-canvas"
import { Toolbar } from "@/components/toolbar"
import { Controls } from "@/components/controls"
import type { DNAElement, ElementType } from "@/types/dna-types"

export default function Home() {
  const [elements, setElements] = useState<DNAElement[]>([])
  const [selectedTool, setSelectedTool] = useState<ElementType | null>(null)
  const [history, setHistory] = useState<DNAElement[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(1)

  const addElement = (element: DNAElement) => {
    const newElements = [...elements, element]
    setElements(newElements)

    // Update history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const updateElement = (id: string, updates: Partial<DNAElement>) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    setElements(newElements)
  }

  const deleteElement = (id: string) => {
    const newElements = elements.filter((el) => el.id !== id)
    setElements(newElements)

    // Update history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  const clearCanvas = () => {
    setElements([])
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const zoomIn = () => setZoom(Math.min(zoom + 0.1, 2))
  const zoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5))

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">DNA 结构可视化工具</h1>
            <p className="text-sm text-muted-foreground">交互式教学工具，用于探索 DNA 组件和二级结构</p>
          </div>
          <Controls
            onUndo={undo}
            onRedo={redo}
            onClear={clearCanvas}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            zoom={zoom}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />

        {/* Canvas */}
        <DNACanvas
          elements={elements}
          selectedTool={selectedTool}
          zoom={zoom}
          onAddElement={addElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDeselectTool={() => setSelectedTool(null)}
        />
      </div>
    </div>
  )
}
