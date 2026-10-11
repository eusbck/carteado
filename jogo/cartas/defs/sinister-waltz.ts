// Sinister Waltz
// Choose three target creature cards in your graveyard. Return two of them at random to the battlefield and put the other
// on the bottom of your library.
import { defineCard, is, moveObjects, putOntoBattlefield, t } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Sinister Waltz',
  faces: [{
    spell: {
      targets: [{ ...t.card('graveyard', is.creature, 'três cartas de criatura alvo no seu cemitério'), min: 3, max: 3 }],
      *effect(c) {
        // ruling 1: com só um ou dois alvos ainda legais, todos voltam e nada vai para o fundo
        const legais = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id] : []));
        if (!legais.length) return;
        const sorteadas = shuffle(c.g.state.rng, [...legais]);
        const voltam = sorteadas.slice(0, 2);
        const fundo = sorteadas.slice(2);
        yield* putOntoBattlefield(c.g, voltam.map((id) => ({ id, controller: c.you })), 'effect');
        if (fundo.length) yield* moveObjects(c.g, fundo.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: com só dois alvos ainda legais na resolução, os dois voltam e nada vai para o fundo',
  },
});
