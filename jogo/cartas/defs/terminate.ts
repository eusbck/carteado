// Terminate — Destroy target creature. It can't be regenerated.
// (Nenhuma carta dos decks regenera; "não pode ser regenerada" não muda o resultado.)
import { defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Terminate',
  faces: [{ spell: { targets: [t.creature()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } } }],
});
