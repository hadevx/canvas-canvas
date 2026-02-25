import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Node, Edge,
  useNodesState, useEdgesState,
  addEdge, Connection,
  Background, BackgroundVariant,
  useReactFlow, ReactFlowProvider,
  MarkerType, SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TextNode from './nodes/TextNode';
import RectangleNode from './nodes/RectangleNode';
import StickyNode from './nodes/StickyNode';
import ImageNode from './nodes/ImageNode';
import CircleNode from './nodes/CircleNode';
import DiamondNode from './nodes/DiamondNode';
import Toolbar from './Toolbar';
import InspectorPanel from './InspectorPanel';
import { toPng } from 'html-to-image';

const nodeTypes = {
  text: TextNode,
  rectangle: RectangleNode,
  sticky: StickyNode,
  image: ImageNode,
  circle: CircleNode,
  diamond: DiamondNode,
};

const STORAGE_KEY = 'eraser-canvas-state';

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

function loadFromStorage(): Snapshot {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* empty */ }
  return { nodes: [], edges: [] };
}

function CanvasInner() {
  const initial = useRef(loadFromStorage());
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.current.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.current.edges);
  const [activeTool, setActiveTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [undoCount, setUndoCount] = useState(0); // force re-render for toolbar

  const reactFlow = useReactFlow();

  // Undo/redo via refs
  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const takeSnapshot = useCallback(() => {
    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    });
    futureRef.current = [];
    setUndoCount(c => c + 1);
  }, []);

  const undo = useCallback(() => {
    if (!pastRef.current.length) return;
    futureRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    });
    const prev = pastRef.current.pop()!;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setUndoCount(c => c + 1);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    });
    const next = futureRef.current.pop()!;
    setNodes(next.nodes);
    setEdges(next.edges);
    setUndoCount(c => c + 1);
  }, [setNodes, setEdges]);

  // Auto-save (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    }, 500);
    return () => clearTimeout(t);
  }, [nodes, edges]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Selection tracking
  const onSelectionChange = useCallback(({ nodes: n, edges: e }: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodes(n);
    setSelectedEdges(e);
  }, []);

  // Re-open inspector on new selection
  useEffect(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) setInspectorOpen(true);
  }, [selectedNodes, selectedEdges]);

  // Connect edges
  const onConnect = useCallback((connection: Connection) => {
    takeSnapshot();
    setEdges(eds => addEdge({
      ...connection,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }, eds));
  }, [takeSnapshot, setEdges]);

  // Add node on pane click
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (activeTool === 'select') return;

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX, y: event.clientY,
    });

    takeSnapshot();
    const id = `node-${Date.now()}`;

    const defaults: Record<string, { data: Record<string, unknown>; style: React.CSSProperties }> = {
      text: {
        data: { label: '' },
        style: { width: 150, height: 40 },
      },
      rectangle: {
        data: { title: '', body: '', fillColor: '#ffffff', borderColor: '#e2e8f0' },
        style: { width: 200, height: 120 },
      },
      sticky: {
        data: { label: '', fillColor: '#fef3c7', textColor: '#92400e' },
        style: { width: 180, height: 180 },
      },
      circle: {
        data: { label: '', fillColor: '#ffffff', borderColor: '#e2e8f0' },
        style: { width: 100, height: 100 },
      },
      diamond: {
        data: { label: '', fillColor: '#ffffff', borderColor: '#e2e8f0' },
        style: { width: 110, height: 110 },
      },
    };

    const config = defaults[activeTool];
    if (!config) return;

    setNodes(nds => [...nds, {
      id, position,
      type: activeTool,
      data: config.data,
      style: config.style,
    }]);
    setActiveTool('select');
  }, [activeTool, reactFlow, takeSnapshot, setNodes]);

  // Image upload handler
  const handleImageUpload = useCallback((dataUrl: string) => {
    const position = reactFlow.screenToFlowPosition({
      x: window.innerWidth / 2, y: window.innerHeight / 2,
    });
    takeSnapshot();
    setNodes(nds => [...nds, {
      id: `node-${Date.now()}`,
      position,
      type: 'image',
      data: { src: dataUrl },
      style: { width: 200, height: 200 },
    }]);
  }, [reactFlow, takeSnapshot, setNodes]);

  // Delete selected
  const deleteSelected = useCallback(() => {
    const nIds = nodesRef.current.filter(n => n.selected).map(n => n.id);
    const eIds = edgesRef.current.filter(e => e.selected).map(e => e.id);
    if (!nIds.length && !eIds.length) return;
    takeSnapshot();
    setNodes(nds => nds.filter(n => !nIds.includes(n.id)));
    setEdges(eds => eds.filter(e => !eIds.includes(e.id) && !nIds.includes(e.source) && !nIds.includes(e.target)));
  }, [takeSnapshot, setNodes, setEdges]);

  // Duplicate selected
  const duplicateSelected = useCallback(() => {
    const selected = nodesRef.current.filter(n => n.selected);
    if (!selected.length) return;
    takeSnapshot();
    const newNodes = selected.map(n => ({
      ...n,
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      position: { x: n.position.x + 20, y: n.position.y + 20 },
      selected: false,
      data: { ...n.data },
    }));
    setNodes(nds => [...nds, ...newNodes]);
  }, [takeSnapshot, setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault(); duplicateSelected();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        deleteSelected();
      }
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey && !isInput) {
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, duplicateSelected, deleteSelected]);

  // Export PNG
  const exportPng = useCallback(async () => {
    const el = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!el) return;
    try {
      const url = await toPng(el, {
        backgroundColor: darkMode ? '#0f1623' : '#f5f5f7',
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas.png';
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [darkMode]);

  // New canvas
  const newCanvas = useCallback(() => {
    if (nodesRef.current.length > 0 && !confirm('Clear canvas? This cannot be undone.')) return;
    takeSnapshot();
    setNodes([]);
    setEdges([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [takeSnapshot, setNodes, setEdges]);

  // Update node data (from inspector)
  const updateNodeData = useCallback((nodeId: string, data: Record<string, unknown>) => {
    takeSnapshot();
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
  }, [takeSnapshot, setNodes]);

  // Update edge (from inspector)
  const updateEdge = useCallback((edgeId: string, updates: Partial<Edge>) => {
    takeSnapshot();
    setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, ...updates } : e));
  }, [takeSnapshot, setEdges]);

  const fitView = useCallback(() => {
    reactFlow.fitView({ padding: 0.2 });
  }, [reactFlow]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onUndo={undo}
        onRedo={redo}
        canUndo={pastRef.current.length > 0}
        canRedo={futureRef.current.length > 0}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(g => !g)}
        onFitView={fitView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(d => !d)}
        onExport={exportPng}
        onNewCanvas={newCanvas}
        onImageUpload={handleImageUpload}
      />

      <div
        className="flex-1 relative"
        style={{ cursor: activeTool !== 'select' ? 'crosshair' : undefined }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          selectionMode={SelectionMode.Partial}
          selectionOnDrag={activeTool === 'select'}
          panOnDrag={[1, 2]}
          panOnScroll={false}
          zoomOnScroll
          deleteKeyCode={null}
          fitView={initial.current.nodes.length > 0}
          proOptions={{ hideAttribution: true }}
        >
          {showGrid && (
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={darkMode ? 'hsl(222, 14%, 22%)' : 'hsl(220, 13%, 78%)'}
            />
          )}
        </ReactFlow>
      </div>

      {(selectedNodes.length > 0 || selectedEdges.length > 0) && inspectorOpen && (
        <InspectorPanel
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          onUpdateNodeData={updateNodeData}
          onUpdateEdge={updateEdge}
          onClose={() => setInspectorOpen(false)}
        />
      )}
    </div>
  );
}

export default function CanvasEditor() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
