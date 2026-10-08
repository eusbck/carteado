// Archon of Cruelty
// Flying
// Whenever this creature enters or attacks, target opponent sacrifices a creature or planeswalker of their choice,
// discards a card, and loses 3 life. You draw a card and gain 3 life.
import { defineCard, discard, draw, eachSacrifices, gainLife, isCreature, isType, keyword, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Archon of Cruelty',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        // CR 608.2b: com o oponente alvo ilegal, a habilidade não resolve (nem a compra nem o ganho)
        const op = tgtPlayer(c);
        if (op === null) return;
        // ruling 1: as ações acontecem na ordem; gatilhos esperam o fim da resolução (CR 603.3)
        yield* eachSacrifices(c, [op], (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'), 1, 'uma criatura ou planeswalker');
        yield* discard(c.g, op, 1);
        loseLife(c.g, op, 3, c.source);
        yield* draw(c.g, c.you, 1);
        gainLife(c.g, c.you, 3, c.source);
      }, {
        targets: [t.opponent()],
        text: 'Sempre que esta criatura entra ou ataca, o oponente alvo sacrifica uma criatura ou um planeswalker à escolha dele, descarta uma carta e perde 3 de vida. Você compra uma carta e ganha 3 de vida.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1 — o gatilho de morte do sacrificado espera; se o oponente perde o jogo pelos 3 de vida, o gatilho dele não vai para a pilha',
  },
});
