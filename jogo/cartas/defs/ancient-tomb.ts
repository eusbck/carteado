// Ancient Tomb
// {T}: Add {C}{C}. This land deals 2 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Ancient Tomb',
  faces: [{ abilities: [
    // CR 605.3b: o dano faz parte da habilidade de mana; não usa a pilha
    mana('CC', {
      text: '{T}: Adicione {C}{C}. Este terreno causa 2 de dano a você.',
      *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 2, combat: false }]); },
    }),
  ] }],
  rulings: {},
});
