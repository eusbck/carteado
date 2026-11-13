// Modos de jogo (formatos de torneio e casuais): o que muda entre eles fica aqui. Cada deck e cada sala têm um modo;
// o saguão só mostra os decks do modo da sala, e a partida começa com as regras dele (vida inicial, zona de comando).
//
// - Commander (CR 903): 100 cartas com o comandante (ou os dois parceiros), singleton, identidade de cor, 40 de vida.
// - Standard (MTR 3.3, 6.1; CR 100.2a, 103.4): deck principal de 60 cartas ou mais, até 4 cópias de cada carta
//   (fora os terrenos básicos e as cartas que dizem que não têm limite), só cartas legais no Standard, 20 de vida.
//
// Um modo novo entra aqui (MODOS), na validação (motor/deck.ts) e, se mudar alguma regra da partida, em GameConfig.

export type ModoJogo = 'commander' | 'standard';

export interface InfoModo {
  id: ModoJogo;
  nome: string;
  /** uma frase para o botão de escolha */
  descricao: string;
  /** vida inicial (CR 103.4: 20; Commander, 903.7: 40) */
  vida: number;
  /** o deck tem comandante na zona de comando (CR 903.6) */
  comandante: boolean;
  /** tamanho de mesa sugerido ao criar a sala */
  lugaresPadrao: number;
  /** nome do formato nas legalidades do Scryfall (legalities) */
  legalidade: string;
}

export const MODOS: Record<ModoJogo, InfoModo> = {
  commander: {
    id: 'commander', nome: 'Commander', descricao: '100 cartas com um comandante, 40 de vida',
    vida: 40, comandante: true, lugaresPadrao: 4, legalidade: 'commander',
  },
  standard: {
    id: 'standard', nome: 'Standard', descricao: '60 cartas das coleções recentes, 20 de vida',
    vida: 20, comandante: false, lugaresPadrao: 2, legalidade: 'standard',
  },
};

export const LISTA_MODOS: readonly InfoModo[] = Object.values(MODOS);

export const ehModo = (x: unknown): x is ModoJogo => typeof x === 'string' && Object.hasOwn(MODOS, x);

/** o modo de um deck ou de uma sala; sem a chave (decks e salas de antes dos modos) é Commander */
export const modoDe = (x: { formato?: ModoJogo | null } | null | undefined): ModoJogo => x?.formato ?? 'commander';
