import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';

const RectangleNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [editingField, setEditingField] = useState<'title' | 'body' | null>(null);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [id, setNodes]);

  return (
    <div
      className="w-full h-full rounded-lg border-2 overflow-hidden"
      style={{
        backgroundColor: data.fillColor || '#ffffff',
        borderColor: data.borderColor || '#e2e8f0',
        color: data.textColor || '#1e293b',
        fontSize: data.fontSize || 14,
        fontWeight: data.fontWeight || 'normal',
      }}
    >
      <NodeResizer isVisible={!!selected} minWidth={120} minHeight={60} />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Right} id="right-target" />

      <div className="p-3 h-full flex flex-col">
        {editingField === 'title' ? (
          <input
            autoFocus
            defaultValue={data.title || ''}
            className="bg-transparent outline-none w-full font-semibold text-base"
            onBlur={e => { updateData({ title: e.target.value }); setEditingField(null); }}
            onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') setEditingField(null); }}
          />
        ) : (
          <div
            className="font-semibold text-base cursor-text select-none"
            onDoubleClick={() => setEditingField('title')}
          >
            {data.title || 'Title'}
          </div>
        )}

        {editingField === 'body' ? (
          <textarea
            autoFocus
            defaultValue={data.body || ''}
            className="bg-transparent outline-none resize-none w-full flex-1 mt-1 text-sm opacity-70"
            onBlur={e => { updateData({ body: e.target.value }); setEditingField(null); }}
            onKeyDown={e => { if (e.key === 'Escape') setEditingField(null); }}
          />
        ) : (
          <div
            className="mt-1 text-sm opacity-60 cursor-text flex-1 select-none"
            onDoubleClick={() => setEditingField('body')}
          >
            {data.body || 'Description...'}
          </div>
        )}
      </div>
    </div>
  );
});

RectangleNode.displayName = 'RectangleNode';
export default RectangleNode;
