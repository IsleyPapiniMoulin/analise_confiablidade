import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DiagramToolbar } from "@/components/diagram/DiagramToolbar";
import { NodePalette } from "@/components/diagram/NodePalette";
import { PropertiesPanel } from "@/components/diagram/PropertiesPanel";
import { CustomNode } from "@/components/diagram/CustomNode";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Diagram, DiagramNode, NodeType } from "@/types/diagram";
import { useToast } from "@/hooks/use-toast";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const DiagramEditor = () => {
  const { projectId, diagramId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagrams, setDiagrams] = useLocalStorage<Diagram[]>(`reliability-diagrams-${projectId}`, []);
  const [currentDiagram, setCurrentDiagram] = useState<Diagram | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  useEffect(() => {
    const diagram = diagrams.find(d => d.id === diagramId);
    if (diagram) {
      setCurrentDiagram(diagram);
      // Convert diagram nodes to ReactFlow nodes
      const flowNodes = diagram.nodes.map(node => ({
        id: node.id,
        type: "custom",
        position: node.position,
        data: {
          label: node.label,
          nodeType: node.type,
          reliability: node.reliability,
          k: node.k,
        },
      }));
      setNodes(flowNodes);
      // Convert diagram edges to ReactFlow edges
      const flowEdges = diagram.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }));
      setEdges(flowEdges);
    } else {
      navigate(`/project/${projectId}`);
    }
  }, [diagramId, diagrams, navigate, projectId]);

  const saveDiagram = useCallback(() => {
    if (!currentDiagram) return;

    const diagramNodes: DiagramNode[] = nodes.map(node => ({
      id: node.id,
      type: node.data.nodeType,
      label: node.data.label,
      position: node.position,
      reliability: node.data.reliability,
      k: node.data.k,
    }));

    const diagramEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    const updatedDiagram = {
      ...currentDiagram,
      nodes: diagramNodes,
      edges: diagramEdges,
      updatedAt: new Date().toISOString(),
    };

    setDiagrams(diagrams.map(d => d.id === diagramId ? updatedDiagram : d));
    setCurrentDiagram(updatedDiagram);
    toast({ title: "Diagrama salvo", description: "Suas alterações foram salvas." });
  }, [currentDiagram, nodes, edges, diagrams, diagramId, setDiagrams, toast]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validação básica de ciclos
      const hascycle = (sourceId: string, targetId: string): boolean => {
        const visited = new Set<string>();
        const stack = [targetId];

        while (stack.length > 0) {
          const current = stack.pop()!;
          if (current === sourceId) return true;
          if (visited.has(current)) continue;
          visited.add(current);

          const outgoingEdges = edges.filter(e => e.source === current);
          outgoingEdges.forEach(e => stack.push(e.target));
        }
        return false;
      };

      if (hascycle(params.source!, params.target!)) {
        toast({
          title: "Conexão inválida",
          description: "Esta conexão criaria um ciclo no diagrama.",
          variant: "destructive",
        });
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      );
    },
    [edges, setEdges, toast]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "custom",
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length + 1}`,
          nodeType: type as NodeType,
          reliability: type === "basic" ? 0.95 : undefined,
          k: type === "k-out-of-n" ? 2 : undefined,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleUpdateNode = (nodeId: string, updates: Partial<Node["data"]>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
      )
    );
    setSelectedNode((prev) =>
      prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, ...updates } } : prev
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    toast({ title: "Nó excluído", description: "O nó e suas conexões foram removidos." });
  };

  const handleClearCanvas = () => {
    if (confirm("Tem certeza que deseja limpar todo o canvas?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      toast({ title: "Canvas limpo", description: "Todos os elementos foram removidos." });
    }
  };

  const handleExport = () => {
    if (!currentDiagram) return;
    
    const exportData = {
      name: currentDiagram.name,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.nodeType,
        label: n.data.label,
        position: n.position,
        reliability: n.data.reliability,
        k: n.data.k,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentDiagram.name.replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado", description: "Diagrama exportado com sucesso." });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const flowNodes = data.nodes.map((node: any) => ({
          id: node.id,
          type: "custom",
          position: node.position,
          data: {
            label: node.label,
            nodeType: node.type,
            reliability: node.reliability,
            k: node.k,
          },
        }));
        const flowEdges = data.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "smoothstep",
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }));
        setNodes(flowNodes);
        setEdges(flowEdges);
        toast({ title: "Importado", description: "Diagrama importado com sucesso." });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "O arquivo não pôde ser lido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!currentDiagram) return null;

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-background">
        <DiagramToolbar
          diagramName={currentDiagram.name}
          onBack={() => navigate(`/project/${projectId}`)}
          onSave={saveDiagram}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClearCanvas}
        />
        <div className="flex flex-1 overflow-hidden">
          <NodePalette />
          <div ref={reactFlowWrapper} className="flex-1 bg-muted/20" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background />
              <Controls />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
          </div>
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default DiagramEditor;
