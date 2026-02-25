import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const CircleNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [id, setNodes]);

  return (
    <div
      className="w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: data.fillColor || '#ffffff',
        borderColor: data.borderColor || '#e2e8f0',
        color: data.textColor || '#1e293b',
        fontSize: data.fontSize || 14,
        fontWeight: data.fontWeight || 'normal',
      }}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer isVisible={!!selected} minWidth={80} minHeight={80} keepAspectRatio />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Right} id="right-target" />

      {editing ? (
        <input
          autoFocus
          defaultValue={data.label || ''}
          className="bg-transparent outline-none text-center w-3/4"
          style={{ fontSize: 'inherit', color: 'inherit' }}
          onBlur={e => { updateData({ label: e.target.value }); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') setEditing(false); }}
        />
      ) : (
        <span className="select-none text-center px-2">{data.label || ''}</span>
      )}
    </div>
  );
});

CircleNode.displayName = 'CircleNode';
export default CircleNode;
