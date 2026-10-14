// Volcanic Torrent
// Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs
// less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)
// Volcanic Torrent deals X damage to each creature and planeswalker your opponents control, where X is the number of
// spells you've cast this turn.
import { cascade, chars, controllerOf, dealDamage, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Volcanic Torrent',
  faces: [{
    abilities: [cascade()],
    spell: {
      *effect(c) {
        // ruling 10: X é visto na resolução e conta esta mágica e as conjuradas antes e em resposta; ruling 11: cópias
        // não contam, mas conjurar uma cópia de carta conta (motor/stack.ts castInner)
        const x = c.g.state.turnStats[c.you]?.spellsCast ?? 0;
        if (x <= 0) return;
        const s = c.g.state;
        const alvos = s.zones.battlefield.filter((id) => {
          if (s.objects[id].phasedOut || !c.g.isOpponent(c.you, controllerOf(c.g, id))) return false;
          const t = chars(c.g, id).types;
          return t.includes('Creature') || t.includes('Planeswalker');
        });
        dealDamage(c.g, alvos.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: x, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.85a — a cascata resolve mesmo com a mágica anulada (motor/conjurar-alternativo.ts cascade)',
    2: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/chars.ts)',
    3: 'regra geral: CR 702.85a — a mágica resultante também precisa ter valor de mana menor (motor/conjurar-alternativo.ts cascade)',
    4: 'teste: a cascata exila até achar uma carta mais barata, que pode ser conjurada de graça antes da Torrent',
    5: 'teste: a cascata exila até achar uma carta mais barata, que pode ser conjurada de graça antes da Torrent',
    6: 'regra geral: CR 702.85a — as cartas são exiladas viradas para cima',
    7: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo (motor/stack.ts)',
    8: 'regra geral: CR 709.3 — da carta dividida, conjura-se uma metade (motor/stack.ts castInner)',
    9: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    10: 'teste: X conta as mágicas conjuradas no turno, inclusive a conjurada pela cascata',
    11: 'teste: X conta as mágicas conjuradas no turno, inclusive a conjurada pela cascata',
  },
});
