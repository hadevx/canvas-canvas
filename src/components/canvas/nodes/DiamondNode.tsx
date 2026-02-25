import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const DiamondNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [id, setNodes]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <NodeResizer isVisible={!!selected} minWidth={100} minHeight={100} keepAspectRatio />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      {/* Diamond shape via rotated square */}
      <div
        className="absolute inset-[12%] border-2 rotate-45"
        style={{
          backgroundColor: data.fillColor || '#ffffff',
          borderColor: data.borderColor || '#e2e8f0',
        }}
      />

      <div
        className="relative z-10 text-center px-4"
        style={{
          color: data.textColor || '#1e293b',
          fontSize: data.fontSize || 13,
          fontWeight: data.fontWeight || 'normal',
        }}
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <input
            autoFocus
            defaultValue={data.label || ''}
            className="bg-transparent outline-none text-center w-full"
            style={{ fontSize: 'inherit', color: 'inherit' }}
            onBlur={e => { updateData({ label: e.target.value }); setEditing(false); }}
            onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') setEditing(false); }}
          />
        ) : (
          <span className="select-none">{data.label || ''}</span>
        )}
      </div>
    </div>
  );
});

DiamondNode.displayName = 'DiamondNode';
export default DiamondNode;
