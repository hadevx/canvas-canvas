import { Node, Edge, MarkerType } from 'reactflow';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';

interface InspectorPanelProps {
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onUpdateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  onClose: () => void;
}

export default function InspectorPanel({
  selectedNodes, selectedEdges,
  onUpdateNodeData, onUpdateEdge, onClose,
}: InspectorPanelProps) {
  const node = selectedNodes[0];
  const edge = selectedEdges[0];

  if (!node && !edge) return null;

  return (
    <div className="w-60 border-l border-border bg-card p-4 overflow-y-auto shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-foreground">Properties</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>

      {node && (
        <div className="space-y-5">
          <Section title="Colors">
            <ColorInput label="Fill" value={node.data.fillColor || '#ffffff'} onChange={v => onUpdateNodeData(node.id, { fillColor: v })} />
            <ColorInput label="Border" value={node.data.borderColor || '#e2e8f0'} onChange={v => onUpdateNodeData(node.id, { borderColor: v })} />
            <ColorInput label="Text" value={node.data.textColor || '#1e293b'} onChange={v => onUpdateNodeData(node.id, { textColor: v })} />
          </Section>

          <Section title="Typography">
            <Row label="Size">
              <select
                value={node.data.fontSize || 14}
                onChange={e => onUpdateNodeData(node.id, { fontSize: Number(e.target.value) })}
                className="text-xs bg-accent border border-border rounded px-2 py-1 text-foreground"
              >
                {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(s => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
            </Row>
            <Row label="Weight">
              <select
                value={node.data.fontWeight || 'normal'}
                onChange={e => onUpdateNodeData(node.id, { fontWeight: e.target.value })}
                className="text-xs bg-accent border border-border rounded px-2 py-1 text-foreground"
              >
                <option value="normal">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </Row>
          </Section>
        </div>
      )}

      {edge && (
        <div className="space-y-5">
          <Section title="Edge Style">
            <Row label="Type">
              <select
                value={edge.type || 'smoothstep'}
                onChange={e => onUpdateEdge(edge.id, { type: e.target.value })}
                className="text-xs bg-accent border border-border rounded px-2 py-1 text-foreground"
              >
                <option value="default">Bezier</option>
                <option value="smoothstep">Smooth</option>
                <option value="step">Step</option>
                <option value="straight">Straight</option>
              </select>
            </Row>
            <ColorInput
              label="Color"
              value={(edge.style?.stroke as string) || '#94a3b8'}
              onChange={v => onUpdateEdge(edge.id, { style: { ...edge.style, stroke: v, strokeWidth: 2 } })}
            />
            <Row label="Arrow">
              <input
                type="checkbox"
                checked={!!edge.markerEnd}
                onChange={e => onUpdateEdge(edge.id, {
                  markerEnd: e.target.checked ? { type: MarkerType.ArrowClosed } : undefined,
                })}
                className="accent-primary w-4 h-4"
              />
            </Row>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border border-border p-0"
        />
        <span className="text-[10px] text-muted-foreground font-mono w-14">{value}</span>
      </div>
    </div>
  );
}
