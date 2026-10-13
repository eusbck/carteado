// Bolsa Família (carta própria da mesa)
// Enchant creature
// When Bolsa Família enters, create a 1/1 white Human Citizen creature token named Eleitor.
// Enchanted creature gets +1/+1 and can't attack you or planeswalkers you control.
import { attachedGets, controllerOf, createTokens, defineCard, etb, isType, staticAbility, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Bolsa Família',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Eleitor', 1);
      }, { text: 'Quando Bolsa Família entra, crie uma ficha Eleitor 1/1 branca.' }),
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }], 'A criatura encantada recebe +1/+1 e não pode atacar você nem planeswalkers que você controla.'),
      staticAbility({
        rules: {
          canAttack: (c, atacante, alvo) => !(c.g.state.objects[c.source]?.attachedTo === atacante && (
            (alvo.kind === 'player' && alvo.id === c.you) || (alvo.kind === 'obj' && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you))),
        },
      }),
    ],
  }],
  rulings: {},
});
