// Doran, Besieged by Time
// Each creature spell you cast with toughness greater than its power costs {1} less to cast.
// Whenever a creature you control attacks or blocks, it gets +X/+X until end of turn, where X is the difference between
// its power and toughness.
import { controllerOf, defineCard, on, power, staticAbility, toughness, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Doran, Besieged by Time',
  faces: [{
    abilities: [
      // ruling 2: só o genérico
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Creature') && (spell.chars.toughness ?? 0) > (spell.chars.power ?? 0) ? { reduce: 1 } : null) },
        text: 'Cada mágica de criatura que você conjura com resistência maior que a força custa {1} a menos.',
      }),
      triggered(on.custom((e, c) => {
        const ids: ObjId[] = e.type === 'attackers' ? e.attackers.map((a) => a.obj) : e.type === 'blockers' ? e.blocks.map(([b]) => b) : [];
        const minhas = ids.filter((id) => c.g.state.objects[id] && controllerOf(c.g, id) === c.you);
        return minhas.map((id) => ({ criatura: id }));
      }), function* (c) {
        const id = c.event.criatura as ObjId;
        if (!c.g.state.objects[id]) return;
        // rulings 1, 4: X na resolução, a maior menos a menor
        const x = Math.abs(power(c.g, id) - toughness(c.g, id));
        untilEndOfTurn(c, [id], [{ k: 'pt', p: x, t: x }]);
      }, { text: 'Sempre que uma criatura que você controla ataca ou bloqueia, ela recebe +X/+X até o fim do turno, onde X é a diferença entre a força e a resistência dela.' }),
    ],
  }],
  rulings: {
    1: 'teste: X calculado na resolução',
    2: 'teste: reduz só o genérico',
    3: 'regra geral: CR 601.2f — custo total',
    4: 'teste: a diferença é a maior menos a menor',
  },
});
