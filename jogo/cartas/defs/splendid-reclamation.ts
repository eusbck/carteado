// Splendid Reclamation
// Return all land cards from your graveyard to the battlefield tapped.
import { defineCard } from '../../motor/api.ts';
import { terrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Splendid Reclamation',
  faces: [{ spell: { *effect(c) { yield* terrenosDoCemiterio(c); } } }],
  rulings: { 1: 'regra geral: CR 305.2 — pôr terrenos no campo não conta como jogar terreno' },
});
