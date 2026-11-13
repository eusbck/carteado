// Splendid Reclamation
// Return all land cards from your graveyard to the battlefield tapped.
import { defineCard } from '../../motor/api.ts';
import { devolveTerrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Splendid Reclamation',
  faces: [{ spell: { *effect(c) { yield* devolveTerrenosDoCemiterio(c); } } }],
  rulings: { 1: 'teste: os terrenos voltam virados, mesmo os que entrariam desvirados por uma condição' },
});
