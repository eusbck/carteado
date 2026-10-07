// Lógica pura da janela de escolha (sem DOM, testada em testes/fase9-janelas.test.ts): o formato
// de cada decisão, as cartas iguais agrupadas na busca, o filtro por nome, a ordem das filas e a
// posição da janela sobre a divisa da mesa.

import type { ChoiceItem, Decision } from '../../../motor/types.ts';

/**
 * Formatos da janela:
 * - simnao: até 3 opções curtas de texto (sim/não, uma cor…): botões grandes numa linha, um clique responde
 * - opcoes: opções de texto (modos de uma mágica, custos…): uma por linha, texto inteiro
 * - fila: ordenar todos os itens (gatilhos): fila que se arrasta ou move com as setas
 * - cartas: poucas cartas e/ou jogadores (alvos, descarte, regra da lenda): cartas grandes lado a lado
 * - grade: muitas cartas (busca no grimório): grade com filtro, cartas iguais juntas e rolagem por dentro
 * - numero: escolher um número (X)
 * - arranjo: vidência e vigiar: faixas (topo, fundo, cemitério) com as cartas grandes
 */
export type Formato = 'simnao' | 'opcoes' | 'fila' | 'cartas' | 'grade' | 'numero' | 'arranjo';

/** como um item aparece na janela */
export type Aparencia = 'carta' | 'jogador' | 'texto';

/** acima disso, as cartas vão para a grade (mais de 8 lado a lado ficariam pequenas demais) */
export const LIMITE_LINHA = 8;
/** opções de texto curtas o bastante para virar botões numa linha */
const CURTA = 28;

/** as decisões que abrem a janela de escolha (prioridade, pagamento e combate ficam na coluna da mesa) */
export type DecisaoEscolha = Extract<Decision, { kind: 'select' | 'number' | 'arrange' }>;

export function ehEscolha(d: Decision): d is DecisaoEscolha {
  return d.kind === 'select' || d.kind === 'number' || d.kind === 'arrange';
}

/** pôr todos os itens em ordem (o motor pede assim a ordem dos gatilhos) */
export function ehFila(d: Decision): boolean {
  return d.kind === 'select' && !!d.ordered && d.items.length > 1 && d.min === d.items.length && d.max === d.items.length;
}

/** a fila é a dos seus gatilhos indo para a pilha (motor/stack.ts) */
export function ordemDeGatilhos(d: Decision): boolean {
  return ehFila(d) && d.prompt.startsWith('Ordene seus gatilhos');
}

export function formatoEscolha(d: Decision, aparencia: (it: ChoiceItem) => Aparencia): Formato | null {
  if (d.kind === 'number') return 'numero';
  if (d.kind === 'arrange') return 'arranjo';
  if (d.kind !== 'select') return null;
  const n = d.items.length;
  if (ehFila(d)) return 'fila';
  const tipos = d.items.map(aparencia);
  const cartas = tipos.filter((t) => t === 'carta').length;
  const textos = tipos.filter((t) => t === 'texto').length;
  if (textos === 0) return cartas > LIMITE_LINHA ? 'grade' : 'cartas';
  if (textos === n && n <= 3 && d.min === 1 && d.max === 1 && d.items.every((i) => i.label.length <= CURTA)) return 'simnao';
  return 'opcoes';
}

/** "Escolha 1", "Escolha até 2", "Escolha de 1 a 3" */
export function faixaEscolha(min: number, max: number): string {
  if (min === max) return `Escolha ${min}`;
  return min === 0 ? `Escolha até ${max}` : `Escolha de ${min} a ${max}`;
}

// ---------------------------------------------------------------- seleção e grupos

/** cartas iguais (mesma carta, mesma situação) viram um item só na grade, com a quantidade */
export interface Grupo<T> { chave: string; itens: T[] }

export function agrupar<T>(itens: T[], chave: (it: T) => string | null): Grupo<T>[] {
  const grupos: Grupo<T>[] = [];
  const porChave = new Map<string, Grupo<T>>();
  itens.forEach((it, i) => {
    const k = chave(it);
    const existente = k === null ? undefined : porChave.get(k);
    if (existente) { existente.itens.push(it); return; }
    const g = { chave: k ?? `#${i}`, itens: [it] };
    grupos.push(g);
    if (k !== null) porChave.set(k, g);
  });
  return grupos;
}

/**
 * Clique num item (ou num grupo de cartas iguais) com a seleção atual: com escolha de um só, troca
 * a escolha ou desmarca; com várias, cada clique soma mais uma cópia do grupo até o limite e o
 * clique seguinte desmarca o grupo inteiro.
 */
export function alternarGrupo(sel: string[], ids: string[], max: number): string[] {
  const marcados = ids.filter((id) => sel.includes(id));
  if (max === 1) return marcados.length ? sel.filter((id) => !ids.includes(id)) : [ids[0]];
  const livre = ids.find((id) => !sel.includes(id));
  if (livre !== undefined && sel.length < max) return [...sel, livre];
  return sel.filter((id) => !ids.includes(id));
}

/** a resposta é aceitável pelo número de itens escolhidos */
export function quantidadeOk(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

// ---------------------------------------------------------------- filtro

/** minúsculas e sem acento, para comparar "Floresta" com "floresta" e "Pântano" com "pantano" */
export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/** os itens cujo algum texto (nome em português, nome em inglês, texto da carta) contém o termo */
export function filtrar<T>(itens: T[], termo: string, textos: (it: T) => string[]): T[] {
  const t = normalizar(termo);
  if (!t) return itens;
  return itens.filter((it) => textos(it).some((x) => normalizar(x).includes(t)));
}

// ---------------------------------------------------------------- filas e faixas

/** move o item da posição `de` para a posição `para` (as outras andam uma casa) */
export function mover<T>(lista: T[], de: number, para: number): T[] {
  if (de === para || de < 0 || de >= lista.length) return lista;
  const nova = [...lista];
  const [x] = nova.splice(de, 1);
  nova.splice(Math.max(0, Math.min(nova.length, para)), 0, x);
  return nova;
}

/**
 * Gatilhos: a janela mostra a fila como a pilha (o de cima resolve primeiro); o motor quer a ordem
 * em que entram na pilha (o primeiro entra primeiro e resolve por último), que é a fila de baixo para cima.
 */
export function ordemParaPilha(filaDeCimaParaBaixo: string[]): string[] {
  return [...filaDeCimaParaBaixo].reverse();
}

export type Destino = 'top' | 'bottom' | 'graveyard';

/** faixas da vidência/vigiar (cada uma da esquerda para a direita) → resposta do motor */
export function respostaArranjo(destinos: Destino[], faixas: Partial<Record<Destino, string[]>>): { placement: Record<string, Destino>; order: string[] } {
  const placement: Record<string, Destino> = {};
  const order: string[] = [];
  for (const dest of destinos) for (const id of faixas[dest] ?? []) { placement[id] = dest; order.push(id); }
  return { placement, order };
}

// ---------------------------------------------------------------- gatilhos

/**
 * O motor descreve o gatilho como "<nome da fonte>: <texto>". Devolve o nome da fonte (o prefixo
 * conhecido mais longo, porque há cartas com ":" no nome) e o texto; null se não reconhecer.
 */
export function fonteDoGatilho(label: string, conhecida: (nome: string) => boolean): { fonte: string; texto: string } | null {
  let achada: { fonte: string; texto: string } | null = null;
  for (let i = label.indexOf(': '); i > 0; i = label.indexOf(': ', i + 1)) {
    const fonte = label.slice(0, i);
    if (conhecida(fonte)) achada = { fonte, texto: label.slice(i + 2) };
  }
  return achada;
}

// ---------------------------------------------------------------- posição

/**
 * Topo da janela dentro da mesa: centrada na divisa entre os oponentes e você quando cabe; perto
 * da borda quando não cabe; e, se for mais alta que a mesa, presa na margem de cima (rola por dentro).
 */
export function topoJanela(alturaMesa: number, divisa: number, alturaJanela: number, margem: number): number {
  const ideal = divisa - alturaJanela / 2;
  const maximo = alturaMesa - margem - alturaJanela;
  return Math.round(Math.max(margem, Math.min(ideal, maximo)));
}
