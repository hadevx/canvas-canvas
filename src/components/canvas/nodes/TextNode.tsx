import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const TextNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [id, setNodes]);

  return (
    <div
      className="w-full h-full"
      style={{
        color: data.textColor || 'inherit',
        fontSize: data.fontSize || 14,
        fontWeight: data.fontWeight || 'normal',
      }}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer isVisible={!!selected} minWidth={60} minHeight={24} />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Right} id="right-target" />
      {editing ? (
        <textarea
          autoFocus
          defaultValue={data.label || ''}
          className="bg-transparent outline-none resize-none w-full h-full p-1"
          style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
          onBlur={e => { updateData({ label: e.target.value }); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
        />
      ) : (
        <div className="p-1 whitespace-pre-wrap select-none">
          {data.label || 'Double-click to edit'}
        </div>
      )}
    </div>
  );
});

TextNode.displayName = 'TextNode';
export default TextNode;
