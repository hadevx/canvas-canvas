import {
  MousePointer2, Type, Square, StickyNote, ImageIcon,
  Undo2, Redo2, Grid3X3, Maximize, Moon, Sun,
  Download, FilePlus, Circle, Diamond,
} from 'lucide-react';
import { useRef } from 'react';

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
  onFitView: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExport: () => void;
  onNewCanvas: () => void;
  onImageUpload: (dataUrl: string) => void;
}

export default function Toolbar({
  activeTool, setActiveTool,
  onUndo, onRedo, canUndo, canRedo,
  showGrid, onToggleGrid,
  onFitView, darkMode, onToggleDarkMode,
  onExport, onNewCanvas, onImageUpload,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImageUpload(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const ToolBtn = ({ tool, icon: Icon, label, onClick, disabled, active }: {
    tool?: string; icon: React.ElementType; label: string;
    onClick?: () => void; disabled?: boolean; active?: boolean;
  }) => {
    const isActive = active ?? (tool ? activeTool === tool : false);
    return (
      <button
        title={label}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all duration-150 ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : disabled
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-foreground hover:bg-accent'
        }`}
        onClick={() => { if (onClick) onClick(); else if (tool) setActiveTool(tool); }}
      >
        <Icon size={18} />
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-0.5 py-3 px-1.5 border-r border-border bg-card w-[52px] shrink-0">
      <ToolBtn tool="select" icon={MousePointer2} label="Select (V)" />
      <ToolBtn tool="text" icon={Type} label="Text" />
      <ToolBtn tool="rectangle" icon={Square} label="Rectangle" />
      <ToolBtn tool="sticky" icon={StickyNote} label="Sticky Note" />
      <ToolBtn tool="circle" icon={Circle} label="Circle" />
      <ToolBtn tool="diamond" icon={Diamond} label="Diamond" />
      <ToolBtn icon={ImageIcon} label="Image" onClick={() => fileInputRef.current?.click()} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

      <div className="w-6 border-t border-border my-2" />

      <ToolBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} />
      <ToolBtn icon={Redo2} label="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={!canRedo} />

      <div className="w-6 border-t border-border my-2" />

      <ToolBtn icon={Grid3X3} label="Toggle Grid" onClick={onToggleGrid} active={showGrid} />
      <ToolBtn icon={Maximize} label="Fit View" onClick={onFitView} />
      <ToolBtn icon={darkMode ? Sun : Moon} label="Toggle Theme" onClick={onToggleDarkMode} />

      <div className="flex-1" />

      <ToolBtn icon={Download} label="Export PNG" onClick={onExport} />
      <ToolBtn icon={FilePlus} label="New Canvas" onClick={onNewCanvas} />
    </div>
  );
}
