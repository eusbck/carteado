// Quando toca o som de decisão (a buzina de caminhão de sons.ts): quando a vez de decidir PASSA DE OUTRO JOGADOR PARA
// VOCÊ. Exemplo: é o turno de outro, ele joga coisas, e agora a mesa espera uma decisão sua. Enquanto você mesmo está
// jogando (baixar terreno, virar terreno, lançar, a pergunta seguinte da sua própria jogada), nenhum outro jogador fez
// nada no meio, e a buzina fica quieta (13/11: a primeira versão buzinava a cada jogada sua).
//
// Como sabe que outro jogou: pelo registro estruturado (F3). Desde a sua última decisão, chegou alguma linha de outro
// jogador de um tipo que é jogada dele (começou o turno dele, conjurou, ativou, baixou terreno, atacou, bloqueou, ajuste
// manual)? Então a sua próxima decisão buzina. Os passes de prioridade não viram linha, e as consequências (dano,
// vida, gatilho, resolução, compra) também não contam: o que conta é outro jogador ter tido a vez.
//
// Toca na chegada da vista (loja.ts), sem esperar a cena. Função pura sobre um estado que a loja guarda; testada em
// testes/som-decisao.test.ts.

/** os tipos de linha do registro que são uma jogada do autor */
export const JOGADAS: ReadonlySet<string> = new Set(['turno', 'conjura', 'ativa', 'terreno', 'ataque', 'bloqueio', 'manual']);
/** entre duas buzinas, no mínimo isso (a buzina dura ~1,1 s) */
export const INTERVALO_MINIMO = 1500;

export interface EstadoBuzina {
  /** a última decisão sua já vista (buzinando ou não) */
  decisaoVista: number | null;
  /** a maior `seq` do registro já lida (null: nenhuma vista ainda; a primeira só marca onde está) */
  ultimaSeq: number | null;
  /** outro jogador fez uma jogada desde a sua última decisão */
  outroJogou: boolean;
  /** quando a buzina tocou pela última vez */
  ultimoSom: number;
}

export const estadoBuzinaNovo = (): EstadoBuzina => ({ decisaoVista: null, ultimaSeq: null, outroJogou: false, ultimoSom: -Infinity });

export interface LinhaChegando { seq: number; kind?: string; actor?: number | null }

export interface VistaChegando {
  agora: number;
  /** o seu assento (null: espectador) */
  eu: number | null;
  /** id da decisão sua na vista (null: nenhuma) */
  decisao: number | null;
  /** o registro da vista (as últimas linhas) */
  log: readonly LinhaChegando[];
  /** a chave do som nas Configurações */
  ligado: boolean;
}

/** registra a vista que chegou em `e` e diz se a buzina toca agora */
export function buzinaNaChegada(e: EstadoBuzina, v: VistaChegando): boolean {
  let maior = -Infinity;
  for (const l of v.log) {
    if (l.seq > maior) maior = l.seq;
    if (e.ultimaSeq !== null && l.seq > e.ultimaSeq && v.eu !== null && l.actor != null && l.actor !== v.eu && l.kind && JOGADAS.has(l.kind)) e.outroJogou = true;
  }
  // a primeira vista (entrar, reconectar) só marca; um desfazer que volta o registro também
  if (Number.isFinite(maior) && (e.ultimaSeq === null || maior !== e.ultimaSeq)) e.ultimaSeq = maior;
  else if (e.ultimaSeq === null) e.ultimaSeq = -1;
  if (v.decisao === null || v.decisao === e.decisaoVista) return false;
  e.decisaoVista = v.decisao;
  const passou = e.outroJogou;
  e.outroJogou = false;
  if (!v.ligado || !passou || v.agora - e.ultimoSom < INTERVALO_MINIMO) return false;
  e.ultimoSom = v.agora;
  return true;
}
