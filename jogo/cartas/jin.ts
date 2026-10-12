// Peças e notas de rulings repetidas nas cartas do deck Jin's Vengeance (equipamentos, infectar, históricas).
import { chars, controllerOf } from '../motor/api.ts';
import type { TriggerSpec } from '../motor/defs.ts';
import { on } from '../motor/api.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** notas dos rulings de infectar (CR 702.90), iguais nas cartas do deck */
export const INFECTAR = {
  veneno: 'regra geral: CR 704.5c — o jogador com dez ou mais marcadores de veneno perde o jogo (motor/sba.ts)',
  emVez: 'regra geral: CR 702.90b — o dano de fonte com infectar vira marcadores -1/-1 na criatura ou de veneno no jogador, em vez de dano marcado ou perda de vida (motor/actions.ts dealDamage)',
  ficam: 'regra geral: CR 122.1 — os marcadores -1/-1 ficam na criatura; não saem com regeneração nem no fim do turno (motor/turn.ts)',
  eDano: 'regra geral: CR 702.90b — continua sendo dano: vínculo com a vida, prevenção, redirecionamento e gatilhos de dano valem (motor/actions.ts dealDamage)',
  qualquer: 'regra geral: CR 702.90b — infectar vale para qualquer dano da fonte, não só o de combate (motor/actions.ts dealDamage)',
  prevenido: 'regra geral: CR 615.1 — dano prevenido não dá marcadores de veneno nem -1/-1 (motor/actions.ts dealDamage)',
  planeswalker: 'regra geral: CR 120.3c — o dano a planeswalkers tira lealdade normalmente (motor/actions.ts dealDamage)',
};

/** Equipamentos que o jogador controla */
export function equipamentosDe(g: G, p: PlayerId): ObjId[] {
  return g.state.zones.battlefield.filter((id) => controllerOf(g, id) === p && chars(g, id).subtypes.includes('Equipment'));
}

/** histórica: artefato, lendária ou Saga (CR 700.6) */
export function ehHistorica(g: G, id: ObjId): boolean {
  const ch = chars(g, id);
  return ch.types.includes('Artifact') || ch.supertypes.includes('Legendary') || ch.subtypes.includes('Saga');
}

/** "sempre que a criatura equipada (ou encantada) causa dano de combate a um jogador": c.event.jogador e c.event.dano */
export function anexadaCausaDanoDeCombateAJogador(): TriggerSpec {
  return on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && e.source === (c.g.state.objects[c.source]?.attachedTo ?? -1)
    ? { jogador: e.target.id, dano: e.amount, criatura: e.source } : false));
}
/** notas dos rulings de "proteção contra tudo" para um jogador (Teferi's Protection, The One Ring) */
export const PROTECAO_TUDO = {
  alvo: 'regra geral: CR 608.2b — a mágica ou habilidade que mirava você fica com alvo ilegal; com todos os alvos ilegais, não resolve (motor/stack.ts)',
  tres: 'regra geral: CR 702.16j — para um jogador: todo dano a ele é prevenido, Auras não se anexam a ele e ele não pode ser alvo (motor/actions.ts playerProtectedFrom)',
  soIsso: 'regra geral: CR 702.16j — só isso é impedido: efeitos sem alvo ainda afetam você, e criaturas ainda podem atacar você, com o dano de combate prevenido (motor/actions.ts dealDamage)',
};

/** notas dos rulings de sair de fase (CR 702.26) */
export const FASE = {
  naoExiste: 'regra geral: CR 702.26d — a permanente fora de fase é tratada como se não existisse: não é alvo, não ataca, não dispara (motor/mecanicas.ts phaseOut)',
  marcadores: 'regra geral: CR 702.26d — sair de fase não muda de zona: volta com os marcadores e as escolhas que tinha (motor/mecanicas.ts phaseOut)',
  anexos: 'regra geral: CR 702.26g — Auras e Equipamentos anexados saem de fase junto e voltam anexados, se ainda puderem (motor/mecanicas.ts phaseOut)',
  gatilhos: 'regra geral: CR 702.26d — sair e entrar em fase não dispara habilidades de sair do campo nem de entrar (motor/mecanicas.ts phaseOut)',
  duracoes: 'regra geral: CR 702.26f — efeitos com duração podem acabar enquanto a permanente está fora de fase (motor/layers)',
  volta: 'regra geral: CR 702.26a — as permanentes voltam de fase na sua próxima etapa de desvirar, antes de desvirar, e já podem atacar e usar {T} (motor/turn.ts)',
  pulada: 'regra geral: CR 702.26m — se a etapa de desvirar for pulada, a volta de fase não acontece naquele turno (motor/turn.ts)',
};