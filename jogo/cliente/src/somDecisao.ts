// Quando toca o som de decisão (a buzina de caminhão de sons.ts): SEMPRE que uma decisão sua aparece na mesa, esteja
// a mesa à vista ou noutra aba. Pedido do Caio em 13/11: quem precisa decidir tem que ser chamado, sem exceção. Função
// pura (sem áudio nem DOM), testada em testes/som-decisao.test.ts; quem chama é a loja (cliente/src/loja.ts), quando
// mostra cada vista.
//
// Só não toca:
// - na mesma decisão de novo (a vista repetida, o chat que redesenha);
// - com a chave desligada nas Configurações;
// - antes de INTERVALO_MINIMO depois da buzina anterior: duas decisões coladas (alvos e depois o pagamento) dariam duas
//   buzinas uma em cima da outra; a primeira já chamou.

/** entre duas buzinas, no mínimo isso (a buzina dura ~1,1 s) */
export const INTERVALO_MINIMO = 1500;

export interface MomentoDecisao {
  /** id da decisão sua que a vista mostra agora (null: nenhuma) */
  decisao: number | null;
  /** id da decisão que já tocou (ou que já estava na mesa) da última vez */
  anterior: number | null;
  /** ms (relógio da página) */
  agora: number;
  /** quando tocou o último som de decisão (-Infinity: nunca) */
  ultimoSom: number;
  /** a chave do som nas Configurações */
  ligado: boolean;
}

export function deveTocarDecisao(m: MomentoDecisao): boolean {
  if (!m.ligado || m.decisao === null || m.decisao === m.anterior) return false;
  return m.agora - m.ultimoSom >= INTERVALO_MINIMO;
}
