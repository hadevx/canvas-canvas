import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const RectangleNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [id, setNodes]);

  return (
    <div
      className="w-full h-full rounded-lg border-2 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: data.fillColor || '#ffffff',
        borderColor: data.borderColor || '#e2e8f0',
        color: data.textColor || '#1e293b',
        fontSize: data.fontSize || 14,
        fontWeight: data.fontWeight || 'normal',
      }}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer isVisible={!!selected} minWidth={80} minHeight={40} />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      {editing ? (
        <textarea
          autoFocus
          defaultValue={data.label || ''}
          className="bg-transparent outline-none resize-none w-full h-full p-3 text-center"
          style={{ fontSize: 'inherit', color: 'inherit' }}
          onBlur={e => { updateData({ label: e.target.value }); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
        />
      ) : (
        <span className="select-none text-center px-3 whitespace-pre-wrap">
          {data.label || ''}
        </span>
      )}
    </div>
  );
});

RectangleNode.displayName = 'RectangleNode';
export default RectangleNode;
