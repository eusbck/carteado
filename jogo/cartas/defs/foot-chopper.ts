// Foot Chopper
// When this Equipment enters, create a 1/1 black Ninja creature token, then attach this Equipment to it.
// Equipped creature has flying.
// Whenever equipped creature deals combat damage to a player, you may sacrifice it. If you do, draw cards equal to its
// power.
// Equip {2}
import { attach, attachedGets, createTokens, defineCard, draw, equip, etb, on, power, sacrifice, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Foot Chopper',
  faces: [{
    abilities: [
      etb(function* (c) {
        const [ficha] = yield* createTokens(c.g, c.you, 'Ninja', 1);
        if (ficha !== undefined && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, ficha);
      }, { text: 'Quando este Equipamento entra, crie uma ficha de criatura Ninja 1/1 preta e depois anexe este Equipamento a ela.' }),
      attachedGets(() => [{ k: 'addKeyword', kw: 'flying' }], 'A criatura equipada tem voar.'),
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && e.source === (c.g.state.objects[c.source]?.attachedTo ?? -1) ? { criatura: e.source } : false)), function* (c) {
        const id = c.event.criatura as number;
        if (c.g.state.objects[id]?.zone !== 'battlefield') return;
        if (!(yield* yesNo(c.g, c.you, 'Foot Chopper: sacrificar a criatura equipada para comprar cartas iguais à força dela?'))) return;
        // ruling 1: a força de quando ela esteve no campo pela última vez
        const n = power(c.g, id);
        yield* sacrifice(c.g, [id]);
        if (c.g.state.objects[id]?.zone !== 'battlefield' && n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que a criatura equipada causa dano de combate a um jogador, você pode sacrificá-la. Se fizer isso, compre cartas iguais à força dela.' }),
      equip('{2}'),
    ],
  }],
  rulings: { 1: 'teste: a criatura equipada que causa dano de combate a um jogador pode ser sacrificada para comprar cartas iguais à força dela' },
});