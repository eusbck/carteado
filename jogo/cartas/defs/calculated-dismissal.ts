// Calculated Dismissal
// Counter target spell unless its controller pays {3}.
// Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, scry 2.
import { defineCard, is, lookAndArrange, t, tgt } from '../../motor/api.ts';
import { anulaAMenosQuePague } from '../naoanula.ts';

export default defineCard({
  name: 'Calculated Dismissal',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* anulaAMenosQuePague(c, id, '{3}', 'Calculated Dismissal');
        // maestria em mágicas: conferida na resolução, depois de anular (rulings 2-3); esta mágica ainda está na pilha
        const ctx = { g: c.g, you: c.you, source: c.source };
        const n = c.g.state.zones.graveyard[c.you].filter((x) => is.instantOrSorcery(ctx, x)).length;
        if (n >= 2) yield* lookAndArrange(c.g, c.you, 2, 'scry');
      },
    },
  }],
  rulings: {
    1: 'teste: com maestria em mágicas, faz vidência 2 mesmo que o controlador pague {3}',
    2: 'teste: anulando a própria mágica, ela já conta para a maestria em mágicas',
    3: 'teste: anulando a própria mágica, ela já conta para a maestria em mágicas',
  },
});
