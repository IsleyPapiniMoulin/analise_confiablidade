import { ArrowLeft, Save, Upload, Download, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRef } from "react";

interface DiagramToolbarProps {
  diagramName: string;
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export const DiagramToolbar = ({
  diagramName,
  onBack,
  onSave,
  onExport,
  onImport,
  onClear,
}: DiagramToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-14 border-b bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <h2 className="text-lg font-semibold">{diagramName}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={onImport}
        />
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" size="sm" onClick={onClear} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Limpar
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="default" size="sm" disabled className="gap-2">
          <Calculator className="h-4 w-4" />
          Calcular Confiabilidade
        </Button>
      </div>
    </div>
  );
};
