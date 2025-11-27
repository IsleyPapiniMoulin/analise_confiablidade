import { memo, useState, useCallback, useEffect, useRef } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Box, GitMerge, GitBranch, Grid3x3 } from "lucide-react";

const nodeConfig = {
  basic: { icon: Box, color: "bg-blue-500", borderColor: "border-blue-600" },
  series: { icon: GitMerge, color: "bg-green-500", borderColor: "border-green-600" },
  parallel: { icon: GitBranch, color: "bg-purple-500", borderColor: "border-purple-600" },
  "k-out-of-n": { icon: Grid3x3, color: "bg-orange-500", borderColor: "border-orange-600" },
};

interface CustomNodeData {
  label: string;
  nodeType: string;
  reliability?: number;
  k?: number;
}

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeConfig[nodeData.nodeType as keyof typeof nodeConfig];
  const Icon = config.icon;
  const { setNodes } = useReactFlow();

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(nodeData.label ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTempLabel(nodeData.label ?? "");
  }, [nodeData.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitLabel = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: tempLabel } } : n
      )
    );
    setIsEditing(false);
  }, [id, tempLabel, setNodes]);

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-lg min-w-[180px] ${
        selected ? "border-primary ring-2 ring-primary/20" : config.borderColor
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="flex items-center gap-3">
        <div className={`${config.color} p-2 rounded-md flex-shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              className="font-medium text-sm w-full bg-transparent outline-none border-b border-muted focus:border-primary"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
                if (e.key === "Escape") {
                  setTempLabel(nodeData.label ?? "");
                  setIsEditing(false);
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="font-medium text-sm truncate cursor-text"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {nodeData.label}
            </div>
          )}
          {nodeData.nodeType === "basic" && nodeData.reliability !== undefined && (
            <div className="text-xs text-muted-foreground">
              R: {(nodeData.reliability * 100).toFixed(1)}%
            </div>
          )}
          {nodeData.nodeType === "k-out-of-n" && nodeData.k !== undefined && (
            <div className="text-xs text-muted-foreground">K = {nodeData.k}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3" />
    </div>
  );
});

CustomNode.displayName = "CustomNode";
