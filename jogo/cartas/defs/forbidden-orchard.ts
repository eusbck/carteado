// Forbidden Orchard
// {T}: Add one mana of any color.
// Whenever you tap this land for mana, target opponent creates a 1/1 colorless Spirit creature token.
import { createTokens, defineCard, mana, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Forbidden Orchard',
  faces: [{
    abilities: [
      mana('any'),
      // tem alvo: não é habilidade de mana, vai para a pilha (CR 605.1b)
      triggered(on.custom((e, c) => e.type === 'mana' && e.source === c.source && e.player === c.you && !!e.tappedForMana), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* createTokens(c.g, p, 'Spirit incolor', 1);
      }, { targets: [t.opponent()], text: 'Sempre que você vira este terreno para obter mana, o oponente alvo cria uma ficha de criatura Spirit incolor 1/1.' }),
    ],
  }],
  rulings: {},
});
