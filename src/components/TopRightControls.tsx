import { FabButton } from './FabButton'
import { LayersIcon, PencilIcon, PlusIcon } from './icons'

interface TopRightControlsProps {
  layerCount: number
  onOpenLayers: () => void
  editMode: boolean
  onToggleEdit: () => void
  onOpenSearch: () => void
}

export function TopRightControls({ layerCount, onOpenLayers, editMode, onToggleEdit, onOpenSearch }: TopRightControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
      <FabButton onClick={onOpenLayers} badge={layerCount} label="Your layers">
        <LayersIcon className="w-5 h-5" />
      </FabButton>

      <FabButton active={editMode} onClick={onToggleEdit} label={editMode ? 'Exit edit mode' : 'Edit locations'}>
        <PencilIcon className="w-5 h-5" />
      </FabButton>

      {editMode && (
        <FabButton onClick={onOpenSearch} label="Add location by address or name">
          <PlusIcon className="w-5 h-5" />
        </FabButton>
      )}
    </div>
  )
}
