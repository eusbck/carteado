// Quando toca o som de decisão (o "paam" das trompas, o acorde final do som do seu turno): uma decisão sua acabou de
// aparecer na mesa e você talvez não esteja olhando, sobretudo com a mesa noutra aba. Função pura (sem áudio nem DOM),
// testada em testes/som-decisao.test.ts; quem chama é a loja (cliente/src/loja.ts), quando mostra cada vista.
//
// Não toca:
// - na mesma decisão de novo (a vista repetida, o chat que redesenha);
// - logo depois do som do seu turno (as trompas já avisaram; a primeira parada do turno vem colada nele);
// - com você mexendo na mesa: respondeu há menos de RESPOSTA_RECENTE e a aba está à vista (a pergunta seguinte de uma
//   mesma jogada, como alvos e depois o pagamento, chega enquanto você ainda está olhando);
// - em sequência: no máximo um a cada INTERVALO_MINIMO, para uma rajada de decisões não virar sirene.
// Com a aba escondida, só a mesma decisão e o intervalo mínimo seguram o som: é ali que ele mais importa.

/** depois do som do seu turno, o de decisão espera isso */
export const DEPOIS_DO_TURNO = 3000;
/** respondeu há menos disso, com a aba à vista: você está olhando, sem som */
export const RESPOSTA_RECENTE = 2500;
/** entre dois sons de decisão, no mínimo isso */
export const INTERVALO_MINIMO = 4000;

export interface MomentoDecisao {
  /** id da decisão sua que a vista mostra agora (null: nenhuma) */
  decisao: number | null;
  /** id da decisão que já tocou (ou que já estava na mesa) da última vez */
  anterior: number | null;
  /** ms (relógio da página) */
  agora: number;
  /** quando tocou o último som de decisão, o do seu turno e quando você respondeu pela última vez (-Infinity: nunca) */
  ultimoSom: number;
  ultimoTurnoMeu: number;
  ultimaResposta: number;
  /** a aba está escondida (outra aba, janela minimizada) */
  escondida: boolean;
  /** a chave do som nas Configurações */
  ligado: boolean;
}

export function deveTocarDecisao(m: MomentoDecisao): boolean {
  if (!m.ligado || m.decisao === null || m.decisao === m.anterior) return false;
  if (m.agora - m.ultimoSom < INTERVALO_MINIMO) return false;
  if (m.escondida) return true;
  if (m.agora - m.ultimoTurnoMeu < DEPOIS_DO_TURNO) return false;
  return m.agora - m.ultimaResposta >= RESPOSTA_RECENTE;
}
