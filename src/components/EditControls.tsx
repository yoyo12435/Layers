import { FabButton } from './FabButton'
import { PencilIcon, PlusIcon } from './icons'

interface EditControlsProps {
  editMode: boolean
  onToggleEdit: () => void
  onOpenSearch: () => void
}

export function EditControls({ editMode, onToggleEdit, onOpenSearch }: EditControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
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
