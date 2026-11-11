// Funeral Room // Awakening Hall
// Funeral Room {2}{B} — Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.
// Awakening Hall {6}{B}{B} — When you unlock this door, return all creature cards from your graveyard to the
// battlefield.
import { defineCard, gainLife, isCreature, loseLife, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { aoDestrancar } from '../milagres.ts';

export default defineCard({
  name: 'Funeral Room // Awakening Hall',
  faces: [
    {
      abilities: [triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' })],
    },
    {
      abilities: [triggered(aoDestrancar(1), function* (c) {
        const ids = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
      }, { text: 'Quando você destrancar esta porta, devolva todas as cartas de criatura do seu cemitério ao campo de batalha.' })],
    },
  ],
  rulings: {},
});
