import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const StickyNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [id, setNodes]);

  return (
    <div
      className="w-full h-full rounded shadow-md p-3"
      style={{
        backgroundColor: data.fillColor || '#fef3c7',
        color: data.textColor || '#92400e',
        fontSize: data.fontSize || 14,
        fontWeight: data.fontWeight || 'normal',
      }}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer isVisible={!!selected} minWidth={120} minHeight={120} />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      {editing ? (
        <textarea
          autoFocus
          defaultValue={data.label || ''}
          className="bg-transparent outline-none resize-none w-full h-full"
          style={{ fontSize: 'inherit', color: 'inherit' }}
          onBlur={e => { updateData({ label: e.target.value }); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
        />
      ) : (
        <div className="whitespace-pre-wrap select-none h-full">
          {data.label || 'Double-click to edit...'}
        </div>
      )}
    </div>
  );
});

StickyNode.displayName = 'StickyNode';
export default StickyNode;
