// Midnight Angel Armor
// When this Equipment enters, create a 1/1 white Soldier creature token, then attach this Equipment to it.
// Equipped creature gets +3/+3 and has flying and vigilance.
// Equip {3}
import { attach, attachedGets, createTokens, defineCard, equip, etb } from '../../motor/api.ts';

export default defineCard({
  name: 'Midnight Angel Armor',
  faces: [{
    abilities: [
      etb(function* (c) {
        const [ficha] = yield* createTokens(c.g, c.you, 'Soldier', 1);
        if (ficha !== undefined && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, ficha);
      }, { text: 'Quando este Equipamento entra, crie uma ficha de criatura Soldier 1/1 branca, depois anexe este Equipamento a ela.' }),
      attachedGets(() => [{ k: 'pt', p: 3, t: 3 }, { k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'vigilance' }], 'A criatura equipada recebe +3/+3 e tem voar e vigilância.'),
      equip('{3}'),
    ],
  }],
  rulings: {},
});