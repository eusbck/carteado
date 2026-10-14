// Nashi, Moon Sage's Scion
// Ninjutsu {3}{B} ({3}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your
// hand tapped and attacking.)
// Whenever Nashi deals combat damage to a player, exile the top card of each player's library. Until end of turn, you
// may play one of those cards. If you cast a spell this way, pay life equal to its mana value rather than paying its
// mana cost.
import { defineAbility, defineCard, exile, isLand, manaValue, ninjutsu, on, removeEffect, ruleEffect, triggered } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

// "Até o fim do turno, você pode jogar uma dessas cartas"; mágica, pagando vida igual ao valor de mana em vez do custo
// de mana. Usada a permissão para uma, o efeito acaba para todas.
const PERMISSAO = defineAbility<StaticDef>("Nashi, Moon Sage's Scion:permissao", {
  kind: 'static',
  rules: {
    mayPlayFrom: (c, p, carta) => {
      const ctx = c as SCtx & { params?: { objs: ObjId[]; player: PlayerId }; effect?: { id: number } };
      const prm = ctx.params;
      if (!prm || prm.player !== p || !prm.objs.includes(carta) || c.g.state.objects[carta]?.zone !== 'exile') return null;
      const efeito = ctx.effect?.id;
      const onUse = (u: SCtx) => { if (efeito !== undefined) removeEffect(u.g, efeito); };
      if (isLand(c.g, carta)) return { key: `nashi:${carta}`, label: 'Nashi (jogar o terreno)', land: true, onUse };
      // ruling 1 (CR 118.9): só pagando a vida, no lugar do custo de mana; ruling 3: X vale 0
      const valor = manaValue(c.g, carta);
      return { key: `nashi:${carta}`, label: `Nashi (pagar ${valor} de vida)`, free: true, parts: valor > 0 ? [{ k: 'life', n: valor }] : [], onUse };
    },
  },
});

export default defineCard({
  name: "Nashi, Moon Sage's Scion",
  faces: [{
    abilities: [
      ninjutsu('{3}{B}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const g = c.g;
        const topos = g.apnap().filter((p) => !g.state.players[p].left).map((p) => g.state.zones.library[p][0]).filter((id): id is ObjId => id !== undefined);
        if (!topos.length) return;
        const exiladas = (yield* exile(g, topos)).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        if (exiladas.length) ruleEffect(c, PERMISSAO.id!, { kind: 'endOfTurn' }, { params: { objs: exiladas, player: c.you } });
      }, { text: 'Sempre que Nashi causa dano de combate a um jogador, exile a carta do topo do grimório de cada jogador. Até o fim do turno, você pode jogar uma dessas cartas. Se conjurar uma mágica assim, pague vida igual ao valor de mana dela em vez de pagar o custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjura uma das cartas pagando vida igual ao valor de mana; depois, as outras não podem mais ser jogadas',
    2: 'teste: um terreno exilado assim se joga como a jogada de terreno do turno',
    3: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    4: 'regra geral: CR 702.49a — o ninjutsu só existe depois de declarados os bloqueadores (cartas/defs/yuriko-the-tigers-shadow.test.ts)',
    5: 'regra geral: CR 702.49a-b — revela a carta e devolve o atacante ao ativar (motor/conjurar-alternativo.ts ninjutsu)',
    6: 'regra geral: CR 702.49c — entra atacando o mesmo jogador que o devolvido (cartas/defs/fallen-shinobi.test.ts)',
    7: 'regra geral: CR 702.49c, 508.4 — não foi declarada atacante (cartas/defs/yuriko-the-tigers-shadow.test.ts)',
    8: 'regra geral: CR 702.49a — ativável nas etapas de declarar bloqueadores, dano e fim de combate (motor/conjurar-alternativo.ts)',
    9: 'regra geral: CR 510.4 — com primeiro golpe, o ninja que entra depois do primeiro dano causa dano na etapa normal (motor/combat.ts)',
    10: 'não se aplica: nota de humor, sem efeito no jogo',
  },
});
