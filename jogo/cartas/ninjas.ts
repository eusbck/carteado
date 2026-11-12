// Ajudantes do deck Yuriko (lote 4, frente D): Ninjas, ninjutsu e evasão.
import { chars, lkiChars, on, staticAbility } from '../motor/api.ts';
import type { StaticDef, TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** notas dos rulings repetidos do ninjutsu (CR 702.49) */
export const NINJUTSU = {
  depoisDosBloqueios: 'regra geral: CR 702.49a — o ninjutsu só existe depois de declarados os bloqueadores (motor/conjurar-alternativo.ts; cartas/defs/yuriko-the-tigers-shadow.test.ts)',
  revela: 'regra geral: CR 702.49a-b — revela a carta e devolve o atacante ao ativar; se a carta sair da mão, não entra (motor/conjurar-alternativo.ts ninjutsu)',
  mesmoJogador: 'regra geral: CR 702.49c — entra atacando o mesmo jogador ou planeswalker do devolvido (cartas/defs/fallen-shinobi.test.ts)',
  naoDeclarada: 'regra geral: CR 702.49c, 508.4 — não foi declarada atacante (cartas/defs/yuriko-the-tigers-shadow.test.ts)',
  etapas: 'regra geral: CR 702.49a — ativável nas etapas de declarar bloqueadores, dano e fim de combate (motor/conjurar-alternativo.ts)',
  primeiroGolpe: 'regra geral: CR 510.4 — com primeiro golpe, o ninja que entra depois do primeiro dano causa dano na etapa normal (motor/combat.ts)',
};

/** "esta criatura não pode ser bloqueada" (CR 509.1b) */
export function naoPodeSerBloqueada(texto = 'Esta criatura não pode ser bloqueada.'): StaticDef {
  return staticAbility({ rules: { canBeBlockedBy: (c, atacante) => atacante !== c.source }, text: texto });
}

/** é Ninja (CR 205.3m; polimorfo conta)? Usa a última informação conhecida se saiu do campo */
export function ehNinja(g: G, id: ObjId): boolean {
  const ch = g.state.objects[id]?.zone === 'battlefield' ? chars(g, id) : lkiChars(g, id);
  return !!ch?.subtypes.includes('Ninja');
}

/**
 * "Sempre que um/uma [criatura que satisfaz `filtro`] que você controla causa dano de combate a um jogador": um gatilho
 * por criatura e por jogador (CR 510.3a). `c.event` traz `player` (quem tomou o dano), `criatura` e `dano`.
 */
export function suaCausaDanoDeCombate(filtro: (g: G, id: ObjId) => boolean): TriggerSpec {
  return on.custom((e, c) => {
    if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || e.amount <= 0) return false;
    if (e.controller !== c.you || !filtro(c.g, e.source)) return false;
    return { player: e.target.id as PlayerId, criatura: e.source, dano: e.amount };
  });
}

