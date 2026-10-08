// Pitiless Plunderer
// Whenever another creature you control dies, create a Treasure token.
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Pitiless Plunderer',
  faces: [{
    abilities: [triggered(on.dies((c, l, o) => l.controller === c.you && o.id !== c.source), function* (c) {
      yield* createTokens(c.g, c.you, 'Treasure', 1);
    }, { text: 'Sempre que outra criatura que você controla morre, crie uma ficha de Tesouro.' })],
  }],
  rulings: { 1: 'teste: CR 603.10a: morrendo junto, dispara para as outras' },
});
