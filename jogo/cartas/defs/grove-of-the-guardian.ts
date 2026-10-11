// Grove of the Guardian
// {T}: Add {C}.
// {3}{G}{W}, {T}, Tap two untapped creatures you control, Sacrifice this land: Create an 8/8 green and white
// Elemental creature token with vigilance.
import { activated, createTokens, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Grove of the Guardian',
  faces: [{
    abilities: [
      mana('C'),
      // ruling 1: virar criaturas como custo não é {T} delas (CR 302.6 não se aplica): servem as que acabaram de entrar
      // ruling 2: o {T} do terreno é custo das duas habilidades; não dá para usar as duas
      activated('{3}{G}{W}, {T}, Tap two untapped creatures you control, Sacrifice this land', function* (c) {
        yield* createTokens(c.g, c.you, 'Elemental 8/8', 1);
      }, { text: '{3}{G}{W}, {T}, Vire duas criaturas desviradas que você controla, Sacrifique este terreno: Crie uma ficha de criatura Elemental verde e branca 8/8 com vigilância.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode virar criaturas que acabaram de entrar',
    2: 'regra geral: CR 602.2 — o {T} do terreno é custo das duas habilidades (motor/costs.ts)',
  },
});
