// Avatar's Wrath
// Choose up to one target creature, then airbend all other creatures. (Exile them. While each one is exiled, its owner
// may cast it for {2} rather than its mana cost.)
// Until your next turn, your opponents can't cast spells from anywhere other than their hands.
// Exile Avatar's Wrath.
import { airbend, allCreatures, defineCard, moveObjects, ruleEffect, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: "Avatar's Wrath",
  faces: [{
    spell: {
      targets: [upTo(1, t.creature(undefined, 'até uma criatura alvo (fica no campo)'))],
      *effect(c) {
        const poupada = tgt(c);
        // CR 701.65a; ruling 1: fichas deixam de existir no exílio; ruling 4: terrenos não se jogam do exílio assim
        yield* airbend(c.g, c.you, c.source, allCreatures(c.g).filter((id) => id !== poupada));
        const oponentes = c.g.opponents(c.you).filter((p) => !c.g.state.players[p].left);
        if (oponentes.length) ruleEffect(c, 'rule:castOnlyFromHand', { kind: 'untilYourNextTurn', player: c.you, sinceTurn: c.g.state.turn.number }, { players: oponentes });
        // "Exile Avatar's Wrath": sai da pilha para o exílio em vez do cemitério
        if (c.g.state.objects[c.source]?.zone === 'stack') yield* moveObjects(c.g, [{ id: c.source, to: 'exile' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: fichas exiladas deixam de existir e não podem ser conjuradas',
    2: 'regra geral: CR 118.9a — pagar {2} é custo alternativo; os custos adicionais continuam (motor/stack.ts totalSpellCost)',
    3: 'teste: as outras criaturas vão para o exílio e o dono pode conjurá-las por {2}',
    4: 'regra geral: CR 701.65a — a permissão é de conjurar: terrenos não se jogam assim (motor/mecanicas-ur.ts airbend)',
    5: 'regra geral: CR 107.3 — com custo alternativo, X vale 0 (motor/stack.ts)',
  },
});
