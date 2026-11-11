// Sephiroth, Fallen Hero
// Jenova Cells — Whenever Sephiroth attacks, you may put a cell counter on target creature. Until end of turn, each
// modified creature you control has base power and toughness 7/5. (Equipment, Auras you control, and counters are
// modifications.)
// The Reunion — {3}, Sacrifice a modified creature: Return this card from your graveyard to the battlefield tapped.
import { activated, addCounters, controlledBy, defineCard, isCreature, on, putOntoBattlefield, t, tgt, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';
import { modificada } from '../vingadores.ts';

export default defineCard({
  name: 'Sephiroth, Fallen Hero',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const alvo = tgt(c);
        if (alvo !== null && (yield* yesNo(c.g, c.you, 'Colocar um marcador de célula na criatura alvo?'))) addCounters(c.g, { kind: 'obj', id: alvo }, 'cell', 1, c.you);
        // CR 611.2c: o conjunto das modificadas é fixado agora; ruling 2: define a base (camada 7b)
        const ids = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && modificada(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'setPT', p: 7, t: 5 }]);
      }, {
        targets: [t.creature(undefined, 'criatura alvo')],
        text: 'Células de Jenova — Sempre que Sephiroth ataca, você pode colocar um marcador de célula na criatura alvo. Até o fim do turno, cada criatura modificada que você controla tem força e resistência base 7/5.',
      }),
      activated([{ k: 'mana', cost: '{3}' }, { k: 'sacrifice', n: 1, filter: (c, id) => isCreature(c.g, id) && modificada(c.g, id), label: 'Sacrifique uma criatura modificada' }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, tapped: true }], 'effect');
      }, { zones: ['graveyard'], text: 'A Reunião — {3}, Sacrifique uma criatura modificada: Devolva este card do seu cemitério ao campo de batalha virado.'.replace('este card', 'esta carta') }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 700.9 — qualquer marcador modifica (cartas/vingadores.ts modificada)',
    2: 'teste: as criaturas modificadas viram 7/5 base; +1/+1 continua por cima',
    3: 'regra geral: CR 700.9 — equipada por qualquer jogador é modificada (cartas/vingadores.ts modificada)',
    4: 'regra geral: CR 700.9 — Aura de outro jogador não modifica (cartas/vingadores.ts modificada)',
  },
});
