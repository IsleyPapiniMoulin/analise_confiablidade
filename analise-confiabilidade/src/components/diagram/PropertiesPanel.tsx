import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Node } from "@xyflow/react";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<any>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export const PropertiesPanel = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose,
}: PropertiesPanelProps) => {
  if (!selectedNode) return null;

  const nodeData = selectedNode.data as any;

  const nodeTypeLabels: Record<string, string> = {
    basic: "Componente Básico",
    series: "Grupo em Série",
    parallel: "Grupo em Paralelo",
    "k-out-of-n": "Grupo K-de-N",
  };

  return (
    <div className="w-80 border-l bg-card p-4 overflow-y-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Propriedades</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">ID</Label>
            <Input value={selectedNode.id} disabled className="text-sm" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Input
              value={nodeTypeLabels[nodeData.nodeType] || nodeData.nodeType}
              disabled
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-label">Nome</Label>
            <Input
              id="node-label"
              value={nodeData.label}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, { label: e.target.value })
              }
              className="text-sm"
            />
          </div>

          {nodeData.nodeType === "basic" && (
            <div className="space-y-2">
              <Label htmlFor="reliability">Confiabilidade</Label>
              <Input
                id="reliability"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={nodeData.reliability || 0}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    reliability: parseFloat(e.target.value),
                  })
                }
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Valor entre 0 e 1 (ex: 0.95 = 95%)
              </p>
            </div>
          )}

          {nodeData.nodeType === "k-out-of-n" && (
            <div className="space-y-2">
              <Label htmlFor="k-value">Valor K</Label>
              <Input
                id="k-value"
                type="number"
                min="1"
                value={nodeData.k || 1}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    k: parseInt(e.target.value),
                  })
                }
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Quantidade mínima de componentes funcionais necessários
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Posição</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pos-x" className="text-xs">X</Label>
                <Input
                  id="pos-x"
                  type="number"
                  value={Math.round(selectedNode.position.x)}
                  disabled
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="pos-y" className="text-xs">Y</Label>
                <Input
                  id="pos-y"
                  type="number"
                  value={Math.round(selectedNode.position.y)}
                  disabled
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <Separator />

          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir Nó
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
