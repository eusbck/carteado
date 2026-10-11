// The Spear of Bashenga
// When The Spear of Bashenga enters, if there is no monarch, you become the monarch.
// Equipped creature gets +2/+2 and has vigilance.
// Whenever equipped creature attacks the monarch, destroy target tapped nonland permanent that player controls.
// Equip {2}
import { attachedGets, becomeMonarch, controllerOf, defineCard, destroy, equip, etb, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'The Spear of Bashenga',
  faces: [{
    abilities: [
      etb(function* (c) { becomeMonarch(c.g, c.you); }, {
        // CR 603.4: cláusula "se" interveniente
        condition: (c) => c.g.state.monarch === null,
        text: 'Quando The Spear of Bashenga entra, se não houver monarca, você se torna o monarca.',
      }),
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'vigilance' }], 'A criatura equipada recebe +2/+2 e tem vigilância.'),
      triggered(on.custom((e, c) => {
        const equipada = c.g.state.objects[c.source]?.attachedTo;
        const monarca = c.g.state.monarch;
        if (e.type !== 'attackers' || equipada === null || equipada === undefined || monarca === null) return false;
        return e.attackers.some((a) => a.obj === equipada && a.target.kind === 'player' && a.target.id === monarca) ? { jogador: monarca } : false;
      }), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [t.nonlandPermanent((c, id) => c.g.state.objects[id].tapped && controllerOf(c.g, id) === (c.event?.jogador as number | undefined), 'permanente virada alvo, que não é terreno, que esse jogador controla')],
        text: 'Sempre que a criatura equipada ataca o monarca, destrua a permanente virada alvo, que não é terreno, que esse jogador controla.',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {},
});