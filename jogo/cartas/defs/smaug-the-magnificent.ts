// Smaug the Magnificent
// Flying, haste
// Whenever Smaug attacks, he deals damage equal to the number of Treasures you control to any target.
// At the beginning of your upkeep, create a Treasure token.
import { chars, controlledBy, createTokens, dealDamage, defineCard, keywords, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Smaug the Magnificent',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      triggered(on.selfAttacks(), function* (c) {
        const alvo = tgtRef(c);
        if (!alvo) return;
        // contados na resolução
        const n = controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Treasure')).length;
        if (n > 0) dealDamage(c.g, [{ source: c.source, target: alvo, amount: n, combat: false }]);
      }, { targets: [t.any()], text: 'Sempre que Smaug ataca, ele causa dano igual ao número de Tesouros que você controla a qualquer alvo.' }),
      triggered(on.upkeep('you'), function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); },
        { text: 'No início da sua manutenção, crie uma ficha de Tesouro.' }),
    ],
  }],
  rulings: {},
});
