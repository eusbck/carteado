// Mindbreak Trap
// If an opponent cast three or more spells this turn, you may pay {0} rather than pay this spell's mana cost.
// Exile any number of target spells.
import { anyNumber, defineCard, exile, t, tgtsAll } from '../../motor/api.ts';

export default defineCard({
  name: 'Mindbreak Trap',
  faces: [{
    // rulings 1 e 2: um mesmo oponente conjurou três ou mais mágicas neste turno, tenham resolvido ou não
    altCosts: [{
      key: 'armadilha', label: 'pagando {0} (um oponente conjurou três ou mais mágicas neste turno)', zone: 'hand', mana: '',
      condition: (c) => c.g.opponents(c.you).some((p) => (c.g.state.turnStats[p]?.spellsCast ?? 0) >= 3),
    }],
    spell: {
      targets: [anyNumber(t.spell(undefined, 'mágicas alvo'))],
      // ruling 3: exilar não é anular; vale contra o que não pode ser anulado
      *effect(c) {
        const ids = tgtsAll(c, 0).filter((id) => c.g.state.objects[id]?.zone === 'stack');
        if (ids.length) yield* exile(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'teste: o custo {0} vale com três mágicas conjuradas pelo mesmo oponente, mesmo que tenham resolvido',
    2: 'teste: três oponentes com uma mágica cada não liberam o custo {0}',
    3: 'teste: exila a mágica que não pode ser anulada',
  },
});
