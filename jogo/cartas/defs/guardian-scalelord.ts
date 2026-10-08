// Guardian Scalelord
// Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the
// following abilities until end of turn.)
// Flying
// Whenever this creature attacks, return target nonland permanent card with mana value X or less from your graveyard to
// the battlefield, where X is this creature's power.
import { and, backup, defineCard, is, keyword, lkiChars, manaValue, not, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import type { TriggeredDef } from '../../motor/defs.ts';

const ATAQUE: TriggeredDef = triggered(on.selfAttacks(), function* (c) {
  const id = tgt(c);
  if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
}, {
  targets: [t.card('graveyard', and(is.permanentCard, not(is.land), (c, id) => manaValue(c.g, id) <= (lkiChars(c.g, c.source)?.power ?? 0)), 'carta de permanente não terreno alvo com valor de mana até a força desta criatura')],
  text: 'Sempre que esta criatura ataca, devolva a carta de permanente não terreno alvo com valor de mana X ou menos do seu cemitério ao campo, onde X é a força desta criatura.',
});

export default defineCard({
  name: 'Guardian Scalelord',
  faces: [{
    abilities: [
      // rulings 1-5: só as habilidades impressas abaixo do apoio, fixadas ao disparar
      backup(1, () => [{ k: 'addKeyword', kw: 'flying' }, { k: 'addAbility', id: ATAQUE.id! }]),
      keyword('flying'),
      ATAQUE,
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.165 — a criatura com apoio continua com as habilidades',
    2: 'regra geral: CR 702.165a — habilidades fixadas ao disparar',
    3: 'teste: mirando a si mesma, só recebe o marcador',
    4: 'teste: a outra criatura ganha voar e o gatilho de ataque',
    5: 'regra geral: CR 707.2 — cópias mantêm a ordem impressa',
  },
});
