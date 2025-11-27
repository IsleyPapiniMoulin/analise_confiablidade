import { Box, GitMerge, GitBranch, Grid3x3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const nodeItems = [
  { type: "basic", label: "Componente Básico", icon: Box, color: "bg-blue-500" },
  { type: "series", label: "Grupo em Série", icon: GitMerge, color: "bg-green-500" },
  { type: "parallel", label: "Grupo em Paralelo", icon: GitBranch, color: "bg-purple-500" },
  { type: "k-out-of-n", label: "Grupo K-de-N", icon: Grid3x3, color: "bg-orange-500" },
];

export const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 border-r bg-card p-4 overflow-y-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Elementos</CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-2">
          {nodeItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className="flex items-center gap-3 p-3 rounded-lg border bg-background cursor-move hover:bg-accent hover:border-primary transition-colors"
            >
              <div className={`${item.color} p-2 rounded-md`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-4 px-1">
            Arraste os elementos para o canvas para construir seu diagrama
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
