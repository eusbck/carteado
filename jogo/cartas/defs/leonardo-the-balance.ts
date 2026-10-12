// Leonardo, the Balance
// Whenever a token you control enters, you may put a +1/+1 counter on each creature you control. Do this only once each
// turn.
// {W}{U}{B}{R}{G}: Creatures you control gain menace, trample, and lifelink until end of turn.
// Partner—Character select (You can have two commanders if both have this ability.)
import { activated, addCounters, and, creaturesOf, defineCard, is, on, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';
import { SELECAO } from '../tartarugas.ts';

const CHAVE = 'leonardo';

export default defineCard({
  name: 'Leonardo, the Balance',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.token, is.yours)), function* (c) {
        const s = c.g.state;
        const o = s.objects[c.source];
        if (!o || o.zone !== 'battlefield' || o.usedThisTurn[CHAVE] === s.turn.number) return;
        if (!(yield* yesNo(c.g, c.you, 'Leonardo: colocar um marcador +1/+1 em cada criatura que você controla? (só uma vez por turno)'))) return;
        o.usedThisTurn[CHAVE] = s.turn.number;
        c.g.bump();
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        // "faça isso apenas uma vez por turno": enquanto você não tiver aceitado, cada ficha que entra dispara
        condition: (c) => c.g.state.objects[c.source]?.usedThisTurn[CHAVE] !== c.g.state.turn.number,
        text: 'Sempre que uma ficha que você controla entra, você pode colocar um marcador +1/+1 em cada criatura que você controla. Faça isso apenas uma vez por turno.',
      }),
      activated('{W}{U}{B}{R}{G}', function* (c) {
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'menace' }, { k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'lifelink' }]);
      }, { text: '{W}{U}{B}{R}{G}: As criaturas que você controla ganham ameaçar, atropelar e vínculo com a vida até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: SELECAO.controla,
    2: SELECAO.dois,
    3: SELECAO.comecam,
    4: SELECAO.identidade,
    5: SELECAO.separados,
    6: SELECAO.perder,
    7: SELECAO.refere,
  },
});