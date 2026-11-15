// Wolverine, Fierce Fighter
// Haste
// When Wolverine enters, he fights up to one other target creature.
// If damage would be dealt to Wolverine, instead that damage is dealt, but all other damage already dealt to him is healed.
import { defineCard, etb, is, isCreature, keywords, staticAbility, t, tgt, upTo } from '../../motor/api.ts';
import { luta } from '../wakanda.ts';

export default defineCard({
  name: 'Wolverine, Fierce Fighter',
  faces: [{ abilities: [
    ...keywords('haste'),
    etb(function* (c) {
      const outro = tgt(c);
      // CR 701.14b: as duas precisam continuar no campo e ser criaturas.
      if (outro !== null && c.g.state.objects[c.source]?.zone === 'battlefield' && isCreature(c.g, c.source)) luta(c.g, c.source, outro);
    }, { targets: [upTo(1, t.creature(is.other, 'até uma outra criatura alvo'))], text: 'Quando Wolverine entra, ele luta com até uma outra criatura alvo.' }),
    // CR 614.1a, 701.69a: é substituição, sem usar a pilha; cura só o dano anterior ao evento atual.
    staticAbility({
      rules: { healsPreviousDamage: (c, target) => target.kind === 'obj' && target.id === c.source },
      text: 'Se Wolverine fosse sofrer dano, em vez disso esse dano é causado, mas todo o outro dano já marcado nele é curado.',
    }),
  ] }],
  rulings: {},
});
