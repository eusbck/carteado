// Peças repetidas nas cartas do deck Necron Dynasties (criaturas artefato, fichas Necron Warrior, terrenos iguais).
import { chars, controllerOf, createTokens, isLand, nameOf } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** carta ou permanente que é criatura artefato */
export function ehCriaturaArtefato(g: G, id: ObjId): boolean {
  const t = chars(g, id).types;
  return t.includes('Artifact') && t.includes('Creature');
}

/** carta ou permanente que é criatura artefato ou Veículo (Szarekh, Canoptek Spyder) */
export function ehCriaturaArtefatoOuVeiculo(g: G, id: ObjId): boolean {
  return ehCriaturaArtefato(g, id) || chars(g, id).subtypes.includes('Vehicle');
}

/** cria fichas Necron Warrior 2/2 pretas, criaturas artefato */
export function* criaNecronWarriors(c: Ctx, n: number, viradas = false): Gen<ObjId[]> {
  if (n <= 0) return [];
  return yield* createTokens(c.g, c.you, 'Necron Warrior', n, viradas ? { tapped: true } : {});
}

/** "você controla três ou mais terrenos com o mesmo nome" (Endless Atlas, Sceptre of Eternal Glory) */
export function tresTerrenosIguais(g: G, p: PlayerId): boolean {
  const contagem = new Map<string, number>();
  for (const id of g.state.zones.battlefield) {
    if (!isLand(g, id) || controllerOf(g, id) !== p) continue;
    const nome = nameOf(g, id);
    contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
  }
  return [...contagem.values()].some((n) => n >= 3);
}
/** notas dos rulings de desenterrar (CR 702.84), iguais em todas as cartas do deck */
export const DESENTERRAR = {
  sumiu: 'regra geral: CR 702.84a — se a carta saiu do cemitério antes de a habilidade resolver, ela resolve e não faz nada (motor/mecanicas.ts unearth)',
  naoMagica: 'regra geral: CR 702.84a — desenterrar é habilidade ativada, não mágica: a carta não vai para a pilha (motor/mecanicas.ts unearth)',
  sairia: 'regra geral: CR 702.84a — se a permanente desenterrada fosse sair do campo, é exilada em vez disso (motor/mecanicas.ts unearth, rule:exileIfLeaves)',
  etapaFinal: 'regra geral: CR 702.84a — é exilada no início da próxima etapa final por um gatilho atrasado (motor/mecanicas.ts unearth)',
  impeto: 'regra geral: CR 702.84a — ganha ímpeto; os dois exílios não são habilidades dela e valem mesmo que ela perca as habilidades (motor/mecanicas.ts unearth)',
};