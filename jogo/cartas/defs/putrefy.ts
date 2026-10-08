// Putrefy
// Destroy target artifact or creature. It can't be regenerated.
// (Nenhuma carta dos decks regenera; "não pode ser regenerada" não muda o resultado.)
import { defineCard, destroy, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Putrefy',
  faces: [{
    spell: {
      targets: [t.permanent(or(is.artifact, is.creature), 'artefato ou criatura alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
    },
  }],
  rulings: { 1: 'regra geral: CR 608.2b — basta ser artefato ou criatura na resolução (um só alvo, sem modos)' },
});
