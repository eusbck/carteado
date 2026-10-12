// Aettir and Priwen
// Equipped creature has base power and toughness X/X, where X is your life total.
// Equip {5}
import { attachedGets, defineCard, equip } from '../../motor/api.ts';

export default defineCard({
  name: 'Aettir and Priwen',
  faces: [{
    abilities: [
      // ruling 1: X acompanha o seu total de pontos de vida
      attachedGets((c) => { const x = c.g.state.players[c.you].life; return [{ k: 'setPT', p: x, t: x }]; }, 'A criatura equipada tem força e resistência base X/X, sendo X o seu total de pontos de vida.'),
      equip('{5}'),
    ],
  }],
  rulings: { 1: 'teste: a equipada tem força e resistência base iguais à sua vida, e acompanha as mudanças' },
});