// Ancestral Communion
// When you cast this spell while you control your commander, copy this spell. You may choose a new target for the copy.
// Return target permanent card from your graveyard to your hand.
import { copySpell, defineCard, isPermanentCard, moveObjects, onCastThis, t, tgt } from '../../motor/api.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: 'Ancestral Communion',
  faces: [{
    abilities: [
      onCastThis(function* (c) {
        if (controlaComandante(c.g, c.you)) yield* copySpell(c.g, c.source, c.you, { newTargets: true });
      }, 'Quando você conjura esta mágica enquanto controla o seu comandante, copie esta mágica. Você pode escolher um novo alvo para a cópia.'),
    ],
    spell: {
      targets: [t.card('graveyard', (c, id) => isPermanentCard(c.g, id), 'carta de permanente alvo do seu cemitério', 'you')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[id]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      },
    },
  }],
  rulings: {},
});