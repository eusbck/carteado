// Warp World
// Each player shuffles all permanents they own into their library, then reveals that many cards from the top of their
// library. Each player puts all artifact, creature, and land cards revealed this way onto the battlefield, then does the
// same for enchantment cards, then puts all cards revealed this way that weren't put onto the battlefield on the bottom
// of their library.
import { defineCard, isType, moveObjects, nameOf, putOntoBattlefield, shuffleLibrary } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Warp World',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const s = g.state;
        const jogadores = g.playersInGame();
        // rulings 3, 8: conta os permanentes de que cada jogador é dono, fichas inclusive
        const perms = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut);
        const conta = new Map(jogadores.map((p) => [p, perms.filter((id) => s.objects[id].owner === p).length]));
        // ruling 4: embaralha no grimório; ruling 1: o comandante que for para a zona de comando continua contado
        if (perms.length) yield* moveObjects(g, perms.map((id) => ({ id, to: 'library' as const })), 'effect');
        for (const p of jogadores) shuffleLibrary(g, p);
        // ruling 5: cada jogador revela esse número de cartas do topo
        const reveladas = new Map<number, ObjId[]>(jogadores.map((p) => [p, s.zones.library[p].slice(0, conta.get(p) ?? 0)]));
        for (const p of jogadores) {
          const cartas = reveladas.get(p) ?? [];
          if (cartas.length) g.log(`${s.players[p].name} revela ${cartas.map((id) => nameOf(g, id)).join(', ')}.`, { rule: '701.20a' });
        }
        const todas = jogadores.flatMap((p) => (reveladas.get(p) ?? []).map((id) => ({ id, dono: p })));
        const eh = (id: ObjId, tipos: string[]) => tipos.some((t) => isType(g, id, t));
        // ruling 9: artefatos, criaturas e terrenos entram todos ao mesmo tempo
        const primeiro = todas.filter((x) => eh(x.id, ['Artifact', 'Creature', 'Land']));
        if (primeiro.length) yield* putOntoBattlefield(g, primeiro.map((x) => ({ id: x.id, controller: x.dono })), 'effect');
        // ruling 6: depois os encantamentos; uma Aura pode encantar o que acabou de entrar
        const segundo = todas.filter((x) => s.objects[x.id]?.zone === 'library' && eh(x.id, ['Enchantment']));
        if (segundo.length) yield* putOntoBattlefield(g, segundo.map((x) => ({ id: x.id, controller: x.dono })), 'effect');
        // ruling 7: o resto vai para o fundo do grimório
        const resto = todas.filter((x) => s.objects[x.id]?.zone === 'library');
        if (resto.length) yield* moveObjects(g, resto.map((x) => ({ id: x.id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 903.9b — o comandante que vai para a zona de comando em vez do grimório continua contado (a conta é feita antes de mover)',
    2: 'teste: cada jogador embaralha os permanentes no grimório, revela o mesmo número de cartas e põe no campo artefatos, criaturas, terrenos e depois encantamentos',
    3: 'teste: cada jogador embaralha os permanentes no grimório, revela o mesmo número de cartas e põe no campo artefatos, criaturas, terrenos e depois encantamentos',
    4: 'teste: cada jogador embaralha os permanentes no grimório, revela o mesmo número de cartas e põe no campo artefatos, criaturas, terrenos e depois encantamentos',
    5: 'teste: cada jogador embaralha os permanentes no grimório, revela o mesmo número de cartas e põe no campo artefatos, criaturas, terrenos e depois encantamentos',
    6: 'regra geral: CR 303.4f — a Aura que entra sem ser conjurada escolhe o que encantar entre o que já está no campo (motor/actions.ts putOntoBattlefield)',
    7: 'teste: instantâneas e feitiços revelados vão para o fundo do grimório',
    8: 'teste: fichas contam para o número de cartas reveladas e deixam de existir',
    9: 'teste: cada jogador embaralha os permanentes no grimório, revela o mesmo número de cartas e põe no campo artefatos, criaturas, terrenos e depois encantamentos',
    10: 'regra geral: CR 603.3b — os gatilhos esperam o fim da resolução e vão para a pilha em ordem APNAP (motor/turn.ts)',
  },
});
