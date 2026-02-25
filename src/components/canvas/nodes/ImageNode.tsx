import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';

const ImageNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className="w-full h-full rounded overflow-hidden border border-border/50 bg-white">
      <NodeResizer isVisible={!!selected} minWidth={80} minHeight={80} />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      {data.src ? (
        <img
          src={data.src}
          alt={data.alt || 'Image'}
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
          No image
        </div>
      )}
    </div>
  );
});

ImageNode.displayName = 'ImageNode';
export default ImageNode;
