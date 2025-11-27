export type NodeType = "basic" | "series" | "parallel" | "k-out-of-n";

export interface DiagramNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  reliability?: number; // Para componentes básicos
  k?: number; // Para k-out-of-n
  metadata?: Record<string, any>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
}

export interface Diagram {
  id: string;
  name: string;
  projectId: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
