// Níveis de dificuldade dos bots (fase 9, seção 4). Do mais fraco ao mais forte; nenhum vê o que o assento dele não
// veria (bots/mundo.ts). A força vem de pensar melhor: mais simulações, combate simulado, ler a mesa, olhar mais longe.

export type NivelBot = 'iniciante' | 'facil' | 'intermediario' | 'dificil' | 'cartomante' | 'magicgod';

export const NIVEIS_BOT: { id: NivelBot; nome: string; descricao: string }[] = [
  { id: 'iniciante', nome: 'Iniciante', descricao: 'joga terreno e criatura na curva, ataca só quando é óbvio, quase não usa instantâneas' },
  { id: 'facil', nome: 'Fácil', descricao: 'pensa pouco, às vezes escolhe uma jogada pior e responde pouco' },
  { id: 'intermediario', nome: 'Intermediário', descricao: 'o bot das fases anteriores: simula cada jogada antes de fazer' },
  { id: 'dificil', nome: 'Difícil', descricao: 'simula o combate, usa truques depois dos bloqueios, conta com as respostas dos oponentes e mira em quem está ganhando' },
  { id: 'cartomante', nome: 'Cartomante', descricao: 'como o Difícil, e lembra do que foi revelado e lê o jeito de jogar de cada um' },
  { id: 'magicgod', nome: 'Magic God', descricao: 'como a Cartomante, e olha até o fim do turno seguinte antes de decidir' },
];

export const NIVEL_PADRAO: NivelBot = 'intermediario';

export function nivelValido(x: unknown): x is NivelBot {
  return typeof x === 'string' && NIVEIS_BOT.some((n) => n.id === x);
}

export function nomeNivel(n: NivelBot): string {
  return NIVEIS_BOT.find((x) => x.id === n)!.nome;
}

export interface Parametros {
  /** decide por regras, sem simular (Iniciante) */
  regras: boolean;
  /** teto de simulações rasas por decisão de prioridade (determinístico) */
  simulacoes: number;
  /** mundos sorteados por jogada candidata (as candidatas são comparadas nos mesmos mundos) */
  mundos: number;
  /** variações de alvo por jogada (a primeira usa as heurísticas) */
  variantes: number;
  /** teto de tempo por decisão, em ms (não é meta: decisão óbvia sai na hora) */
  tempo: number;
  /** vantagem mínima sobre passar para fazer uma jogada */
  margem: number;
  /** chance de ficar com a segunda ou a terceira melhor jogada (erro humano) */
  erro: number;
  /** chance de agir no turno dos outros (fim do turno, responder a uma mágica) */
  responde: number;
  /** chance de esquecer um ataque bom com uma criatura */
  esquece: number;
  /** combate por regras fixas ('heuristico'), só o óbvio ('obvio') ou comparando opções em simulação ('simulado') */
  combate: 'obvio' | 'heuristico' | 'simulado';
  /** age durante o combate (truque depois dos bloqueios, remoção no atacante) */
  agirNoCombate: boolean;
  /** nas simulações, os oponentes podem responder (remoção, anular) com o que têm na mão sorteada */
  oponenteResponde: boolean;
  /** em 4 jogadores, pesa mais quem está ganhando */
  lider: boolean;
  /** escolhas (sacrificar, alvos de efeitos) comparadas em simulação, no lugar das palavras do texto */
  escolhaSimulada: boolean;
  /** lembra do que foi revelado e lê a mesa (Cartomante) */
  memoria: boolean;
  /** na fase principal antes do combate, simula até o fim do combate seguinte (Cartomante em diante) */
  olharCombate: boolean;
  /** busca Monte Carlo até o fim do turno seguinte (Cartomante, numa versão leve, e Magic God) */
  busca: boolean;
  /** quantas candidatas da pré-seleção vão para as jogadas longas (além de "passar") */
  buscaCandidatas: number;
  /** fração do tempo para a pré-seleção rasa; o resto vai para as jogadas longas */
  buscaPreSelecao: number;
  /** quantos erros-padrão a vantagem nas jogadas longas precisa ter para trocar a escolha da pré-seleção */
  buscaConfianca: number;
}

const BASE: Parametros = {
  regras: false, simulacoes: 24, mundos: 1, variantes: 2, tempo: 2000, margem: 0.5, erro: 0, responde: 1, esquece: 0,
  combate: 'heuristico', agirNoCombate: false, oponenteResponde: false, lider: false, escolhaSimulada: false, memoria: false, olharCombate: false, busca: false, buscaCandidatas: 3, buscaPreSelecao: 0.4, buscaConfianca: 0.5,
};

export const PARAMETROS: Record<NivelBot, Parametros> = {
  iniciante: { ...BASE, regras: true, simulacoes: 0, tempo: 300, responde: 0, esquece: 0.3, combate: 'obvio', erro: 0.35 },
  facil: { ...BASE, simulacoes: 8, variantes: 1, tempo: 500, margem: 1.2, erro: 0.25, responde: 0.3, esquece: 0.15 },
  intermediario: { ...BASE },
  dificil: { ...BASE, simulacoes: 60, mundos: 3, tempo: 3000, combate: 'simulado', agirNoCombate: true, oponenteResponde: true, lider: true, escolhaSimulada: true },
  cartomante: { ...BASE, simulacoes: 180, mundos: 6, tempo: 3000, combate: 'simulado', agirNoCombate: true, oponenteResponde: true, lider: true, escolhaSimulada: true, memoria: true, olharCombate: true },
  magicgod: { ...BASE, simulacoes: 240, mundos: 8, tempo: 6000, combate: 'simulado', agirNoCombate: true, oponenteResponde: true, lider: true, escolhaSimulada: true, memoria: true, olharCombate: true, busca: true },
};
