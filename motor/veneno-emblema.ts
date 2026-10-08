// Regras de jogador e de mana usadas pelas cartas do lote D: tóxico (CR 702.164), "corrompido" (palavra de
// habilidade: um oponente com três ou mais marcadores de veneno), emblemas (CR 114), "você não pode perder o jogo"
// (CR 104.3), proteção de jogador (CR 702.16) e mana não gasta que vira incolor em vez de ser perdida (CR 106.4, 500.5).
// As regras em si ficam nas ações do motor (dano, ações de estado, alvos, etapas); aqui só as consultas.

import { chars, hooks } from './chars.ts';
import { registry, type StaticDef } from './defs.ts';
import type { G } from './game-context.ts';
import { createObject } from './state.ts';
import type { ManaUnit, ObjId, PlayerId } from './types.ts';

// ---------------------------------------------------------------------------
// Tóxico e corrompido
// ---------------------------------------------------------------------------
/** Tóxico N (CR 702.164a): estática de palavra-chave, com N no parâmetro */
export function toxic(n: number): StaticDef {
  return {
    kind: 'static', kw: 'toxic', param: n,
    text: `Tóxico ${n} (jogadores que sofrerem dano de combate desta criatura também recebem ${n === 1 ? 'um marcador' : `${n} marcadores`} de veneno.)`,
  };
}

/** valor tóxico total (CR 702.164b): a soma dos N de todas as habilidades de tóxico; fora do campo, a última informação conhecida */
export function toxicValue(g: G, id: ObjId): number {
  const abil = g.state.objects[id] ? chars(g, id).abilities : (g.state.lki[id]?.chars.abilities ?? []);
  return abil.filter((a) => a.kw === 'toxic').reduce((n, a) => n + (typeof a.param === 'number' ? a.param : 0), 0);
}

/** Corrompido: algum oponente do jogador tem três ou mais marcadores de veneno */
export function corrupted(g: G, p: PlayerId): boolean {
  return g.opponents(p).some((q) => (g.state.players[q].counters.poison ?? 0) >= 3);
}

// ---------------------------------------------------------------------------
// Emblemas (CR 114)
// ---------------------------------------------------------------------------
/**
 * CR 114.2: "[jogador] recebe um emblema com [habilidade]" — o emblema vai para a zona de comando e é desse jogador
 * (dono e controlador). As habilidades estão na definição (defineEmblem) e funcionam na zona de comando (114.4).
 */
export function createEmblem(g: G, player: PlayerId, emblem: string): ObjId | null {
  if (!registry.emblems.has(emblem)) throw new Error(`Emblema não registrado: ${emblem}`);
  if (g.state.players[player].left) return null;
  const o = createObject(g, { def: emblem, owner: player, controller: player, zone: 'command' });
  g.log(`${g.state.players[player].name} recebe um emblema: ${chars(g, o.id).name}.`, { rule: '114.2' });
  return o.id;
}

/** CR 114.5: emblema não é carta nem permanente; nada o move nem o afeta */
export function isEmblem(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && registry.emblems.has(o.def);
}

// ---------------------------------------------------------------------------
// Jogadores
// ---------------------------------------------------------------------------
/** CR 104.3: algum efeito diz que o jogador não pode perder o jogo (Darksteel Angel) */
export function cantLoseGame(g: G, p: PlayerId): boolean {
  return hooks(g, 'cantLoseGame').some((h) => h.fn(h.ctx, p));
}

/** qualidades de proteção que o jogador tem (CR 702.16b, 702.16e), no formato de protectionMatches */
export function playerProtections(g: G, p: PlayerId): unknown[] {
  return hooks(g, 'playerProtection').flatMap((h) => h.fn(h.ctx, p));
}

// ---------------------------------------------------------------------------
// Mana não gasta (CR 106.4, 500.5)
// ---------------------------------------------------------------------------
/**
 * O jogador perde a mana não gasta que não `fica` (fim de etapa ou fase, CR 500.5). Com "se você fosse perder mana não
 * gasta, ela se torna incolor" (Omnath, Locus of the Void), a que seria perdida vira {C} e continua na reserva, com as
 * mesmas restrições (ruling 2 de Omnath); "não se perde até o fim do turno" é a parte que acabou, então sai.
 */
export function loseUnspentMana(g: G, player: PlayerId, fica: (u: ManaUnit) => boolean): void {
  const p = g.state.players[player];
  if (p.manaPool.every(fica)) return;
  if (hooks(g, 'unspentManaBecomesColorless').some((h) => h.fn(h.ctx, player))) {
    p.manaPool = p.manaPool.map((u) => {
      if (fica(u)) return u;
      const { untilEndOfTurn: _fim, ...resto } = u;
      return { ...resto, type: 'C' };
    });
  } else p.manaPool = p.manaPool.filter(fica);
  g.bump();
}
