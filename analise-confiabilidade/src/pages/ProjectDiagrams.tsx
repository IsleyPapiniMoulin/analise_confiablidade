import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Project, Diagram } from "@/types/diagram";
import { useToast } from "@/hooks/use-toast";

const ProjectDiagrams = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects] = useLocalStorage<Project[]>("reliability-projects", []);
  const [diagrams, setDiagrams] = useLocalStorage<Diagram[]>(`reliability-diagrams-${projectId}`, []);
  const [project, setProject] = useState<Project | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDiagram, setEditingDiagram] = useState<Diagram | null>(null);
  const [diagramName, setDiagramName] = useState("");

  useEffect(() => {
    const currentProject = projects.find(p => p.id === projectId);
    if (currentProject) {
      setProject(currentProject);
    } else {
      navigate("/");
    }
  }, [projectId, projects, navigate]);

  const handleCreateDiagram = () => {
    if (!diagramName.trim()) {
      toast({ title: "Nome obrigatório", description: "Por favor, insira um nome para o diagrama.", variant: "destructive" });
      return;
    }

    const diagram: Diagram = {
      id: Date.now().toString(),
      name: diagramName,
      projectId: projectId!,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDiagrams([...diagrams, diagram]);
    setDiagramName("");
    setIsCreateOpen(false);
    toast({ title: "Diagrama criado", description: `O diagrama "${diagram.name}" foi criado.` });
    navigate(`/editor/${projectId}/${diagram.id}`);
  };

  const handleUpdateDiagram = () => {
    if (!editingDiagram || !editingDiagram.name.trim()) return;

    setDiagrams(diagrams.map(d =>
      d.id === editingDiagram.id
        ? { ...editingDiagram, updatedAt: new Date().toISOString() }
        : d
    ));
    setEditingDiagram(null);
    toast({ title: "Diagrama atualizado", description: "O nome foi alterado." });
  };

  const handleDeleteDiagram = (diagramId: string) => {
    setDiagrams(diagrams.filter(d => d.id !== diagramId));
    toast({ title: "Diagrama excluído", description: "O diagrama foi removido." });
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Projetos
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{project.name}</h1>
              <p className="mt-2 text-muted-foreground">{project.description || "Gerencie os diagramas deste projeto"}</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Novo Diagrama
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Diagrama</DialogTitle>
                  <DialogDescription>Defina um nome para o diagrama de confiabilidade.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagram-name">Nome do Diagrama</Label>
                    <Input
                      id="diagram-name"
                      value={diagramName}
                      onChange={(e) => setDiagramName(e.target.value)}
                      placeholder="Ex: Sistema Principal"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateDiagram()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateDiagram}>Criar Diagrama</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {diagrams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum diagrama encontrado</h3>
              <p className="text-muted-foreground mb-4">Crie seu primeiro diagrama para começar a construir</p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Diagrama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => (
              <Card key={diagram.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="flex-1">{diagram.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDiagram(diagram);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Tem certeza que deseja excluir este diagrama?")) {
                            handleDeleteDiagram(diagram.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {diagram.nodes.length} nós • {diagram.edges.length} conexões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/editor/${projectId}/${diagram.id}`)}
                  >
                    Abrir Editor
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Atualizado em {new Date(diagram.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editingDiagram && (
          <Dialog open={!!editingDiagram} onOpenChange={() => setEditingDiagram(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Renomear Diagrama</DialogTitle>
                <DialogDescription>Altere o nome do diagrama.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-diagram-name">Nome do Diagrama</Label>
                  <Input
                    id="edit-diagram-name"
                    value={editingDiagram.name}
                    onChange={(e) => setEditingDiagram({ ...editingDiagram, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateDiagram()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingDiagram(null)}>Cancelar</Button>
                <Button onClick={handleUpdateDiagram}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ProjectDiagrams;
