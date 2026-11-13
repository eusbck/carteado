// lote3-a (deck Cloud): regras de equipar e de "segundo dividido" que o motor não tinha.
// - "Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que você ativar em cada turno"
//   (Bruenor Battlehammer, Forge Anew, Kíli the Resourceful): gancho equipForZero; o motor conta as ativações de equipar
//   do jogador no turno (turnStats.equipActivated) e só oferece o {0} na primeira. É um custo alternativo da ativação
//   (CR 118.9), escolhido ao determinar o custo total (CR 602.2b, 601.2f).
// - "Você pode ativar habilidades de equipar a qualquer momento em que poderia conjurar uma mágica instantânea"
//   (Forge Anew): gancho equipAsInstant, que tira a restrição de feitiço do equipar (CR 702.6a).
// - Segundo dividido (CR 702.61): enquanto uma mágica com segundo dividido estiver na pilha, ninguém conjura mágicas nem
//   ativa habilidades que não sejam de mana; habilidades desencadeadas e ações especiais continuam.
// - Habilidades ativadas com uma criatura do próprio jogador como alvo, contadas no turno (Professor Hojo).
// - Anexar um Equipamento "a uma criatura" respeitando o CR 301.5c (Equipamento que é criatura não equipa; não se
//   anexa a si mesmo nem a quem não é criatura).
import { chars, controllerOf, hasKw, hooks, isCreature } from './chars.ts';
import type { ActivatedDef } from './defs.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId, TargetRef } from './types.ts';
import { splitSecondActive } from './controle-base.ts';

/** a habilidade é de equipar (inclusive as variantes "Equipar criatura lendária", CR 702.6c)? */
export function ehEquipar(def: ActivatedDef): boolean {
  return def.kw === 'equip';
}

/** esta ativação de equipar pode ter o custo trocado por {0}? (primeira do jogador no turno e alguma permanente oferece) */
export function equiparPorZero(g: G, player: PlayerId, source: ObjId, def: ActivatedDef): boolean {
  if (!ehEquipar(def)) return false;
  if ((g.state.turnStats[player]?.equipActivated ?? 0) > 0) return false;
  return hooks(g, 'equipForZero').some((h) => h.fn(h.ctx, player, source, def));
}

/** equipar pode ser ativado agora no tempo de instantânea? (Forge Anew) */
export function equiparComoInstantanea(g: G, player: PlayerId, source: ObjId, def: ActivatedDef): boolean {
  return ehEquipar(def) && hooks(g, 'equipAsInstant').some((h) => h.fn(h.ctx, player, source));
}

/** CR 702.61a: há uma mágica com segundo dividido na pilha? */
export function segundoDivididoNaPilha(g: G): boolean {
  // a mesma regra do lote3-d (motor/controle-base.ts): uma implementação só do segundo dividido
  return splitSecondActive(g);
}

/** guarda as contagens do turno depois de uma ativação que deu certo */
export function registraAtivacao(g: G, player: PlayerId, def: ActivatedDef, targets: TargetRef[][]): void {
  const ts = g.state.turnStats[player];
  if (!ts) return;
  if (ehEquipar(def)) ts.equipActivated = (ts.equipActivated ?? 0) + 1;
  if (miraCriaturaPropria(g, player, targets)) ts.activatedTargetingOwnCreature = (ts.activatedTargetingOwnCreature ?? 0) + 1;
}

/** algum dos alvos é uma criatura que o jogador controla? */
export function miraCriaturaPropria(g: G, player: PlayerId, targets: TargetRef[][]): boolean {
  return targets.flat().some((t) => t.kind === 'obj' && g.state.objects[t.id]?.zone === 'battlefield' && isCreature(g, t.id) && controllerOf(g, t.id) === player);
}

/** CR 301.5c: este Equipamento pode ser anexado a esta criatura? */
export function podeEquipar(g: G, equipamento: ObjId, criatura: ObjId): boolean {
  if (equipamento === criatura) return false;
  const e = g.state.objects[equipamento];
  const c = g.state.objects[criatura];
  if (!e || !c || e.zone !== 'battlefield' || c.zone !== 'battlefield' || e.phasedOut || c.phasedOut) return false;
  if (isCreature(g, equipamento) || !chars(g, equipamento).subtypes.includes('Equipment')) return false;
  return isCreature(g, criatura);
}
