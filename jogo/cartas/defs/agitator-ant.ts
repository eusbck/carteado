// Agitator Ant
// At the beginning of your end step, each player may put two +1/+1 counters on a creature they control. Goad each
// creature that had counters put on it this way. (Until your next turn, those creatures attack each combat if able and
// attack a player other than you if able.)
import { addCounters, chooseItems, controlledBy, defineCard, goad, isCreature, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { GOAD } from '../culpa.ts';

export default defineCard({
  name: 'Agitator Ant',
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* (c) {
        // ruling 7: em ordem de turno, cada um escolhe (ou não) sabendo as escolhas anteriores; depois tudo junto
        const escolhas: { p: PlayerId; id: ObjId }[] = [];
        for (const p of c.g.apnap()) {
          const minhas = controlledBy(c.g, p, (id) => isCreature(c.g, id));
          if (!minhas.length) continue;
          const [esc] = yield* chooseItems(c.g, p, 'Agitator Ant: colocar dois marcadores +1/+1 numa criatura sua? (ela fica goadada)',
            [{ id: 'nao', label: 'Não colocar marcadores' }, ...minhas.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
          if (esc !== 'nao') escolhas.push({ p, id: Number(esc) });
          // ruling: quem escolhe depois sabe o que os anteriores escolheram
          c.g.log(`Agitator Ant: ${c.g.state.players[p].name} ${esc === 'nao' ? 'não coloca marcadores' : `escolhe ${nameOf(c.g, Number(esc))}`}.`);
        }
        // ruling 6: só fica goadada a que recebeu marcadores de fato
        for (const { p, id } of escolhas) if (addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, p) > 0) goad(c.g, id, c.you);
      }, { text: 'No início da sua etapa final, cada jogador pode colocar dois marcadores +1/+1 numa criatura que controla. Goade cada criatura que recebeu marcadores assim.' }),
    ],
  }],
  rulings: {
    1: GOAD.outroJogador,
    2: GOAD.continua,
    3: GOAD.varios,
    4: GOAD.excecoes,
    5: GOAD.naoEHabilidade,
    6: 'regra geral: CR 122.1 — goada só a criatura que recebeu marcadores (addCounters devolve quantos entraram)',
    7: 'teste: na sua etapa final, Bruno aceita: a criatura dele recebe dois marcadores e fica goadada por você',
  },
});
