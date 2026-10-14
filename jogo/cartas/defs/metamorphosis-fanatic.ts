// Metamorphosis Fanatic
// Lifelink
// When this creature enters, return up to one target creature card from your graveyard to the battlefield with a
// lifelink counter on it.
// Miracle {1}{B} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this
// turn.)
import { defineCard, etb, is, keyword, miracle, putOntoBattlefield, t, tgt, upTo } from '../../motor/api.ts';
import { MILAGRE } from '../milagres.ts';

export default defineCard({
  name: 'Metamorphosis Fanatic',
  faces: [{
    abilities: [
      keyword('lifelink'),
      etb(function* (c) {
        const id = tgt(c);
        // o marcador de vínculo com a vida dá a palavra-chave (CR 122.1b)
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters: { lifelink: 1 } }], 'effect');
      }, {
        targets: [upTo(1, t.card('graveyard', is.creature, 'até uma carta de criatura alvo do seu cemitério', 'you'))],
        text: 'Quando esta criatura entra, devolva até uma carta de criatura alvo do seu cemitério para o campo com um marcador de vínculo com a vida.',
      }),
      miracle('{1}{B}'),
    ],
  }],
  rulings: {
    1: 'teste: comprada no turno do oponente e conjurada pelo milagre {1}{B}: devolve uma criatura com um marcador de vínculo com a vida',
    2: MILAGRE.revelarAntes,
    3: MILAGRE.qualquerTurno,
    4: MILAGRE.primeiraDaSequencia,
    5: MILAGRE.semComprar,
    6: MILAGRE.naoPrecisaRevelar,
    7: MILAGRE.soNaResolucao,
    8: MILAGRE.custoAlternativo,
    9: MILAGRE.custoTotal,
    10: MILAGRE.saiuDaMao,
    11: MILAGRE.continuaComprada,
  },
});
