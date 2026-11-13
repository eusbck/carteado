// Valakut Exploration
// Landfall — Whenever a land you control enters, exile the top card of your library. You may play that card for as long as
// it remains exiled.
// At the beginning of your end step, if there are cards exiled with this enchantment, put them into their owner's
// graveyard, then this enchantment deals that much damage to each opponent.
import { allowPlay, defineCard, exile, linkedExiled, moveObjects, on, triggered } from '../../motor/api.ts';
import { danoACadaOponente } from '../terras.ts';

const CHAVE = 'valakut';

export default defineCard({
  name: 'Valakut Exploration',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo], { linkTo: { obj: c.source, key: CHAVE } });
        // rulings 5, 8 e 9: paga os custos e segue o tempo normal; jogada, a carta vira outro objeto e a permissão acaba
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' });
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, exile a carta do topo do seu grimório. Você pode jogar essa carta enquanto ela permanecer exilada.' }),
      triggered(on.endStep('you'), function* (c) {
        const cartas = linkedExiled(c.g, c.source, CHAVE);
        if (!cartas.length) return;
        const res = yield* moveObjects(c.g, cartas.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
        const n = res.filter((x) => x !== null).length;
        if (n > 0) danoACadaOponente(c, n);
      }, {
        // CR 603.4: "se houver cartas exiladas com este encantamento"
        condition: (c) => linkedExiled(c.g, c.source, CHAVE).length > 0,
        text: 'No início da sua etapa final, se houver cartas exiladas com este encantamento, coloque-as no cemitério do dono; depois este encantamento causa essa quantidade de dano a cada oponente.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: jogar um terreno exila a carta do topo, que pode ser jogada',
    2: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    3: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    4: 'teste: a carta jogada antes da etapa final não conta para o dano',
    5: 'regra geral: CR 305.2 — terreno exilado só com jogada de terreno disponível (motor/priority.ts landPlayOptions)',
    6: 'não se aplica: não há Dois Gigantes',
    7: 'teste: se o encantamento sai do campo, as cartas continuam exiladas e jogáveis',
    8: 'regra geral: CR 601.2f-h — paga todos os custos, inclusive os adicionais (motor/stack.ts)',
    9: 'regra geral: CR 400.7 — jogada, a carta vira um objeto novo e a permissão não vale mais para ela',
  },
});
