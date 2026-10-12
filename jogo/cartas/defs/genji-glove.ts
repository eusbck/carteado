// Genji Glove
// Equipped creature has double strike.
// Whenever equipped creature attacks, if it's the first combat phase of the turn, untap it. After this phase, there is an
// additional combat phase.
// Equip {3}
import { addCombatPhaseAfterCurrent, attachedGets, defineCard, equip, isFirstCombat, on, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Genji Glove',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'double strike' }], 'A criatura equipada tem golpe duplo.'),
      triggered(on.attacks((c, id) => c.g.state.objects[c.source]?.attachedTo === id), function* (c) {
        const id = c.g.state.objects[c.source]?.attachedTo ?? null;
        if (id !== null && c.g.state.objects[id]?.zone === 'battlefield') untap(c.g, id);
        addCombatPhaseAfterCurrent(c.g);
      }, {
        // CR 603.4: "se for a primeira fase de combate do turno"
        condition: (c) => isFirstCombat(c.g),
        text: 'Sempre que a criatura equipada ataca, se for a primeira fase de combate do turno, desvire-a. Depois desta fase, há uma fase de combate adicional.',
      }),
      equip('{3}'),
    ],
  }],
  rulings: {},
});