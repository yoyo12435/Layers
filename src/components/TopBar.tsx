import { LayersIcon } from './icons'

interface TopBarProps {
  layerCount: number
  onOpenLayers: () => void
}

export function TopBar({ layerCount, onOpenLayers }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
            <LayersIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-neutral-900 tracking-tight">Layers</span>
        </div>

        <button
          onClick={onOpenLayers}
          className="flex items-center gap-2 border border-neutral-300 rounded-full pl-3 pr-2.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <LayersIcon className="w-4 h-4" />
          Layers
          <span className="bg-neutral-900 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {layerCount}
          </span>
        </button>
      </div>
    </header>
  )
}
