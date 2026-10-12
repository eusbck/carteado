// Everything Pizza
// When this artifact enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.
// {2}{W}{U}{B}{R}{G}, {T}, Sacrifice this artifact: Target player gains 3 life and draws a card. Each of your opponents
// discards a card. This artifact deals 3 damage to any target. Put three +1/+1 counters on up to one target creature.
import { activated, addCounters, dealDamage, defineCard, discard, draw, etb, gainLife, isBasicLand, searchTo, t, tgtPlayer, upTo } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Everything Pizza',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => isBasicLand(c.g, id), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de terreno básico' });
      }, { text: 'Quando este artefato entra, procure no seu grimório uma carta de terreno básico, revele-a, coloque-a na sua mão e depois embaralhe.' }),
      activated('{2}{W}{U}{B}{R}{G}, {T}, Sacrifice this artifact', function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) { gainLife(c.g, p, 3, c.source); yield* draw(c.g, p, 1); }
        for (const op of c.g.apnap()) if (c.g.isOpponent(c.you, op)) yield* discard(c.g, op, 1);
        const alvo = c.targets[1]?.[0];
        if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 3, combat: false }]);
        const r = c.targets[2]?.[0];
        if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: r.id }, '+1/+1', 3, c.you);
      }, {
        targets: [t.player(undefined, 'jogador alvo que ganha 3 de vida e compra'), t.any('qualquer alvo para os 3 de dano'), upTo(1, t.creature(undefined, 'criatura alvo que recebe os marcadores'))],
        text: '{2}{W}{U}{B}{R}{G}, {T}, Sacrifique este artefato: O jogador alvo ganha 3 pontos de vida e compra uma carta. Cada um dos seus oponentes descarta uma carta. Este artefato causa 3 de dano a qualquer alvo. Coloque três marcadores +1/+1 em até uma criatura alvo.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.naoComa,
    2: COMIDA.qualquer,
    3: COMIDA.tipo,
    4: COMIDA.alvos,
  },
});