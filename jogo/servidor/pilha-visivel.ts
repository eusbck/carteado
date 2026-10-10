// A pilha que acabou de mudar segura a mesa um pouco, para todos lerem a mágica ou o gatilho antes de ele resolver.
// Sem isso, um bot passando (90 ms) e o passe automático de uma pessoa (60 ms) resolviam a pilha em 100 a 200 ms:
// o objeto aparecia e sumia na hora. A sala (salas.ts, avancar) chama a cada decisão automática de prioridade e
// espera o maior entre isto e o atraso de sempre; quando uma pessoa para de verdade, chama com base 0 (só marca a
// pilha como vista: ela olha o quanto quiser).
import type { GameState, ObjId, PlayerId } from '../motor/types.ts';

/** objetos da pilha que já seguraram a mesa (cada um uma vez) e quanto a rajada atual já segurou */
export interface RajadaPilha { vistos: Set<ObjId>; gasto: number }

export const novaRajada = (): RajadaPilha => ({ vistos: new Set(), gasto: 0 });

/**
 * Quantos ms segurar agora. 1º objeto novo de uma rajada: `base`; os seguintes: metade; a mágica de uma pessoa: metade
 * (ela sabe o que conjurou); teto de 4× base por rajada (uma onda de gatilhos não para a mesa); a pilha vazia começa
 * outra rajada. `humano`: o assento é de uma pessoa.
 */
export function segurarPilha(r: RajadaPilha, s: Pick<GameState, 'zones' | 'objects'>, humano: (p: PlayerId) => boolean, base: number): number {
  const pilha = s.zones.stack;
  if (!pilha.length) { r.vistos.clear(); r.gasto = 0; return 0; }
  const novos = pilha.filter((id) => !r.vistos.has(id));
  for (const id of novos) r.vistos.add(id);
  if (!novos.length || base <= 0) return 0;
  const topo = s.objects[pilha[pilha.length - 1]]?.stack;
  const propria = topo?.kind === 'spell' && humano(topo.controller);
  const ms = Math.max(0, Math.min(Math.round((r.gasto ? base / 2 : base) * (propria ? 0.5 : 1)), base * 4 - r.gasto));
  r.gasto += ms;
  return ms;
}
