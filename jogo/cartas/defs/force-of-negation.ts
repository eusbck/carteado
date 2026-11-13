// Force of Negation
// If it's not your turn, you may exile a blue card from your hand rather than pay this spell's mana cost.
// Counter target noncreature spell. If that spell is countered this way, exile it instead of putting it into its
// owner's graveyard.
import { chars, defineCard, t, tgt } from '../../motor/api.ts';
import { anulaEExila } from '../twitch.ts';

export default defineCard({
  name: 'Force of Negation',
  faces: [{
    // custo alternativo (CR 118.9) só fora do seu turno
    altCosts: [{
      key: 'forca', label: 'exilando uma carta azul da mão (fora do seu turno)', zone: 'hand', mana: '',
      condition: (c) => c.g.state.turn.active !== c.you,
      parts: [{ k: 'exileFromHand', n: 1, label: 'carta azul', filter: (c, id) => chars(c.g, id).colors.includes('U') }],
    }],
    spell: {
      targets: [t.spell((c, id) => !chars(c.g, id).types.includes('Creature'), 'mágica alvo que não é de criatura')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* anulaEExila(c, id); },
    },
  }],
  rulings: {},
});
