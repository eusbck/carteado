// Angel of Indemnity
// Flying, lifelink
// When this creature enters, return target permanent card with mana value 4 or less from your graveyard to the
// battlefield.
// Encore {6}{W}{W} ({6}{W}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks
// that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only
// as a sorcery.)
import {
  activated, and, controllerOf, createTokens, defineAbility, defineCard, delayed, etb, is, keywords, nextEndStepTrigger,
  putOntoBattlefield, ruleEffect, sacrifice, t, tgt, untilEndOfTurn,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const SACRIFICAR = defineAbility('Angel of Indemnity:sacrificar', nextEndStepTrigger(function* (c) {
  // ruling 9: só sacrifica as que você ainda controla
  const fichas = (c.data.fichas as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield' && controllerOf(c.g, id) === c.you);
  yield* sacrifice(c.g, fichas);
}, 'Sacrifique as fichas do bis no início da próxima etapa final.'));

export default defineCard({
  name: 'Angel of Indemnity',
  faces: [{
    abilities: [
      ...keywords('flying', 'lifelink'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', and(is.permanentCard, is.mvAtMost(4)), 'carta de permanente alvo com valor de mana 4 ou menos no seu cemitério')],
        text: 'Quando esta criatura entra, devolva a carta de permanente alvo com valor de mana 4 ou menos do seu cemitério para o campo.',
      }),
      // Bis (CR 702.141)
      activated('{6}{W}{W}, Exile this card', function* (c) {
        const fichas: ObjId[] = [];
        // ruling 8: só oponentes ainda na partida
        for (const op of c.g.opponents(c.you)) {
          const [f] = yield* createTokens(c.g, c.you, { copyOf: { def: 'Angel of Indemnity', face: 0 } }, 1);
          if (f === undefined) continue;
          fichas.push(f);
          // rulings 1, 5, 6: ataca esse oponente se puder
          ruleEffect(c, 'rule:attacksIfAble', { kind: 'endOfTurn' }, { objs: [f], params: { player: op } });
        }
        untilEndOfTurn(c, fichas, [{ k: 'addKeyword', kw: 'haste' }]);
        delayed(c, SACRIFICAR.id!, { data: { fichas } });
      }, { zones: ['graveyard'], timing: 'sorcery', kw: 'encore', text: 'Bis {6}{W}{W}: Exile esta carta do seu cemitério: para cada oponente, crie uma ficha cópia que ataca esse oponente neste turno se puder. Elas ganham ímpeto. Sacrifique-as no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada ficha é obrigada a atacar o seu oponente',
    2: 'regra geral: CR 303.4f — Aura devolvida assim escolhe o que encantar sem mirar (putOntoBattlefield)',
    3: 'regra geral: CR 107.3g — X vale 0 no cemitério',
    4: 'regra geral: CR 110.4a — isPermanentCard',
    5: 'teste: cada ficha é obrigada a atacar o seu oponente',
    6: 'regra geral: CR 508.1d — exigência não obriga a pagar custo de ataque (motor/combat.ts)',
    7: 'teste: a ficha copia só a carta original (5/5)',
    8: 'teste: uma ficha por oponente na partida',
    9: 'teste: sacrifica no início da próxima etapa final só as que ainda controla',
    10: 'regra geral: CR 602.2b — custos pagos ao ativar, sem respostas no meio',
  },
});
