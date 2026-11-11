// Old Gnawbone
// Flying
// Whenever a creature you control deals combat damage to a player, create that many Treasure tokens.
import { controllerOf, createTokens, defineCard, keyword, lkiChars, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Old Gnawbone',
  faces: [{
    abilities: [
      keyword('flying'),
      // um gatilho por criatura que causou dano de combate a um jogador
      triggered(on.custom((e, c) => {
        if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || e.amount <= 0) return false;
        // dano de combate só vem de criaturas (CR 510.1); quem controla: agora ou pela última informação
        const dono = c.g.state.objects[e.source] ? controllerOf(c.g, e.source) : lkiChars(c.g, e.source)?.controller;
        return dono === c.you ? { n: e.amount } : false;
      }), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', c.event.n as number);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, crie essa quantidade de fichas de Tesouro.' }),
    ],
  }],
  rulings: {},
});
