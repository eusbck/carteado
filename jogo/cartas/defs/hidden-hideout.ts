// Hidden Hideout
// This land enters tapped.
// {T}: Add one mana of any color in your commander's color identity.
// {2}, {T}: Target creature you control with a counter on it gains lifelink until end of turn.
import { activated, controllerOf, defineCard, land, manaCommanderIdentity, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Hidden Hideout',
  faces: [{
    abilities: [
      land.tapped(),
      // CR 903.4f: sem comandante, ou com identidade incolor, não produz mana (nem {C})
      manaCommanderIdentity(),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'lifelink' }]);
      }, {
        targets: [t.creature((ctx, id) => controllerOf(ctx.g, id) === ctx.you && Object.values(ctx.g.state.objects[id].counters).some((n) => n > 0), 'criatura alvo que você controla com um marcador')],
        text: '{2}, {T}: A criatura alvo que você controla com um marcador ganha vínculo com a vida até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 903.4 — dois comandantes somam as identidades (commanderIdentity)',
    2: 'regra geral: CR 903.4f — identidade incolor não produz mana nem {C} (commanderIdentity)',
    3: 'teste: sem comandante, não produz mana',
  },
});
