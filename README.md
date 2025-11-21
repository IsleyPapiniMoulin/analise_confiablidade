# Análise de Confiabilidade – Editor de Diagramas

## Visão Geral
Aplicação web para criação e edição de diagramas de confiabilidade com nós do tipo básico, série, paralelo e k-de-n. O usuário monta o diagrama via drag-and-drop, edita propriedades dos nós e pode importar/exportar o diagrama em JSON. O cálculo de confiabilidade ainda não está implementado.

## Tecnologias
- Framework: React 18 + Vite
- Linguagem: TypeScript
- Roteamento: react-router-dom
- Diagrama: @xyflow/react (React Flow)
- UI: shadcn/ui (Radix UI), TailwindCSS, ícones Lucide
- Formulários/Validação: react-hook-form + zod (infra disponível)
- Persistência: localStorage via hook `useLocalStorage`

## Scripts
- `npm run dev` – Ambiente de desenvolvimento
- `npm run build` – Build de produção
- `npm run build:dev` – Build em modo desenvolvimento
- `npm run preview` – Servir o build gerado
- `npm run lint` – Lint do projeto

## Como Rodar
1. Instalar dependências: `npm install`
2. Rodar em desenvolvimento: `npm run dev`
3. Acessar o endereço informado no terminal (Vite)

## Estrutura Principal
- `src/pages/ProjectDiagrams.tsx`
  - Lista/cria/renomeia/exclui diagramas por projeto
  - Navega para o editor do diagrama
- `src/pages/DiagramEditor.tsx`
  - Editor com React Flow Provider
  - Barra de ferramentas, paleta de nós, canvas, painel de propriedades
  - Importa/Exporta JSON do diagrama
  - Previne ciclos ao conectar arestas
  - Converte entre modelo e React Flow
- `src/components/diagram/DiagramToolbar.tsx`
  - Ações: Voltar, Salvar, Importar, Exportar, Limpar
  - Botão “Calcular Confiabilidade” presente, porém desabilitado
- `src/components/diagram/NodePalette.tsx`
  - Itens arrastáveis: Básico, Série, Paralelo, K-de-N
- `src/components/diagram/CustomNode.tsx`
  - Nó customizado com ícone/cores por tipo
  - Edição inline do nome com duplo clique (permite apagar e salvar vazio)
- `src/components/diagram/PropertiesPanel.tsx`
  - Propriedades do nó selecionado:
    - ID (leitura)
    - Tipo (leitura)
    - Nome (editável – aceita apagar)
    - Confiabilidade (para "basic")
    - K (para "k-out-of-n")
    - Posição (leitura)
    - Excluir nó
- `src/types/diagram.ts`
  - Tipos: `Project`, `Diagram`, `DiagramNode`, `DiagramEdge`, `NodeType`

## Funcionamento do Editor
- **Criação de nós**: arrastar da paleta para o canvas cria um nó com dados padrão. O rótulo pode ser editado inline (duplo clique) ou no painel lateral.
- **Conexões**: criação de arestas com validação anti-ciclo.
- **Salvar**: persiste em `localStorage` (chave por projeto: `reliability-diagrams-{projectId}`).
- **Importar/Exportar**: JSON com `name`, `nodes`, `edges`.

### Modelo de Dados (resumo)
- `DiagramNode`:
  - `id: string`
  - `type: "basic" | "series" | "parallel" | "k-out-of-n"`
  - `label: string` (pode ser vazio)
  - `position: { x: number; y: number }`
  - `reliability?: number` (para `basic`)
  - `k?: number` (para `k-out-of-n`)
- `DiagramEdge`: `id`, `source`, `target`
- `Diagram`: `id`, `name`, `projectId`, `nodes[]`, `edges[]`, `createdAt`, `updatedAt`

## Status do Cálculo de Confiabilidade
- Ainda **não implementado**.
- Existe o botão na toolbar, mas está desabilitado e sem handler.

## Próximos Passos Sugeridos
- **Cálculo de Confiabilidade**
  - Implementar `onCalculate` no editor e habilitar o botão.
  - Motor de cálculo em grafo acíclico (DAG):
    - Série: `R_total = ∏ R_i`
    - Paralelo: `R_total = 1 − ∏ (1 − R_i)`
    - K-de-N: somatório binomial de `k..n`
    - `basic`: usa `reliability`
  - Validar entradas faltantes e exibir feedback (toast/modal).
  - Exibir resultado (ex.: modal com detalhamento por nível e total).

- **Melhorias de UX/Qualidade**
  - Abrir edição do nome automaticamente após o drop (opcional).
  - Atalhos (Del, Ctrl+S, Ctrl+Z/Y).
  - Sumário do diagrama (contagem, inconsistências).
  - Testes unitários do motor de cálculo.
  - Validação adicional de DAG no salvar/calcular.
  - Extrair utilitários para `src/lib/reliability.ts`.
  - Refinar tipagem do `data` dos nós no React Flow.

## Formato de Importação/Exportação
Exemplo de JSON exportado:
```json
{
  "name": "Meu Diagrama",
  "nodes": [
    {
      "id": "basic-1731950000000",
      "type": "basic",
      "label": "Componente 1",
      "position": { "x": 100, "y": 200 },
      "reliability": 0.95
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "id1", "target": "id2" }
  ]
}
```

