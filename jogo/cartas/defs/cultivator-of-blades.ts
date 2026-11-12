// Cultivator of Blades
// Fabricate 2 (When this creature enters, put two +1/+1 counters on it or create two 1/1 colorless Servo artifact
// creature tokens.)
// Whenever this creature attacks, you may have other attacking creatures get +X/+X until end of turn, where X is this
// creature's power.
import { defineCard, lkiChars, on, power, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';
import { fabricar } from '../forragear.ts';

export default defineCard({
  name: 'Cultivator of Blades',
  faces: [{
    abilities: [
      fabricar(2),
      triggered(on.selfAttacks(), function* (c) {
        const g = c.g;
        // ruling 3: escolhe na resolução; ruling 2: X na resolução, pela última informação se saiu; ruling 1: negativo vale 0
        if (!(yield* yesNo(g, c.you, 'Cultivator of Blades: as outras criaturas atacantes recebem +X/+X até o fim do turno?'))) return;
        const noCampo = g.state.objects[c.source]?.zone === 'battlefield';
        const x = Math.max(0, noCampo ? power(g, c.source) : (lkiChars(g, c.source)?.power ?? 0));
        const outras = (g.state.combat?.attackers ?? []).filter((a) => !a.removed && a.id !== c.source && g.state.objects[a.id]?.zone === 'battlefield').map((a) => a.id);
        if (x > 0) untilEndOfTurn(c, outras, [{ k: 'pt', p: x, t: x }]);
      }, { text: 'Sempre que esta criatura ataca, você pode fazer com que as outras criaturas atacantes recebam +X/+X até o fim do turno, onde X é a força desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.1b — força negativa vale 0 para X (Math.max na resolução)',
    2: 'teste: X é a força na resolução; as outras atacantes recebem +X/+X',
    3: 'teste: X é a força na resolução; as outras atacantes recebem +X/+X',
    4: 'regra geral: CR 608.2 — a escolha do fabricar é feita na resolução (cartas/forragear.ts fabricar)',
    5: 'regra geral: CR 702.123a — fabricar é um gatilho de entrar, não "entra com" (cartas/forragear.ts fabricar)',
    6: 'regra geral: CR 702.123a — se não der para pôr os marcadores, cria os Servos (cartas/forragear.ts fabricar)',
  },
});
