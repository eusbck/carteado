// In the Darkness Bind Them
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)
// I, II, III — Create a 3/3 black Wraith creature token with menace. The Ring tempts you.
// IV — For each opponent, gain control of up to one target creature that player controls until end of turn. Untap those
// creatures. They gain haste until end of turn. The Ring tempts you.
import { chapter, createTokens, defineCard, gainControl, ringTempts, sagaEnters, untap, untilEndOfTurn } from '../../motor/api.ts';
import { ANEL } from '../mordor.ts';
import { umaPorOponente } from '../viloes.ts';

export default defineCard({
  name: 'In the Darkness Bind Them',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      // ruling 1: o Wraith recém-criado pode ser o Portador do Anel
      chapter([1, 2, 3], function* (c) {
        yield* createTokens(c.g, c.you, 'Wraith', 1);
        yield* ringTempts(c.g, c.you);
      }, { text: 'I, II, III — Crie uma ficha de criatura Wraith 3/3 preta com ameaçar. O Anel tenta você.' }),
      // ruling 3: pode não escolher alvo nenhum, só para o Anel tentar você
      chapter([4], function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id] : []));
        for (const id of ids) gainControl(c.g, id, c.you, { kind: 'endOfTurn' }, c.source);
        for (const id of ids) untap(c.g, id);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'haste' }]);
        yield* ringTempts(c.g, c.you);
      }, {
        targets: [umaPorOponente('para cada oponente, até uma criatura alvo que esse jogador controla')],
        text: 'IV — Para cada oponente, ganhe o controle de até uma criatura alvo que esse jogador controla até o fim do turno. Desvire essas criaturas. Elas ganham ímpeto até o fim do turno. O Anel tenta você.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: I: cria um Wraith 3/3 com ameaçar e o Anel tenta você, podendo escolher o próprio Wraith',
    2: 'regra geral: CR 608.2b — a criatura que mudou de controlador antes da resolução deixa de ser alvo legal',
    3: 'teste: IV: sem alvos, o Anel tenta você mesmo assim; com alvos, rouba uma criatura de cada oponente até o fim do turno',
    4: ANEL.emblema,
    5: ANEL.semCriatura,
    6: ANEL.mesmo,
    7: ANEL.ordem,
    8: ANEL.obrigatorio,
    9: ANEL.um,
    10: ANEL.alvos,
  },
});
