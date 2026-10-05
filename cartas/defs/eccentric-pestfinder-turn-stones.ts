// Eccentric Pestfinder // Turn Stones
// Eccentric Pestfinder — Trample. At the beginning of each end step, if you gained life this turn, this creature
// becomes prepared.
// Turn Stones (feitiço preparado) — For each opponent, you create a 1/1 black and green Pest creature token with "When
// this token dies, you gain 1 life."
import { createTokens, defineCard, keyword, on, prepare, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Eccentric Pestfinder // Turn Stones',
  faces: [
    {
      abilities: [
        keyword('trample'),
        triggered(on.endStep('each'), function* (c) { prepare(c.g, c.source); }, {
          // ruling 1: "se" interveniente, olhando a vida ganha no turno (CR 603.4)
          condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
          text: 'No início de cada etapa final, se você ganhou vida neste turno, esta criatura fica preparada.',
        }),
      ],
    },
    { spell: { *effect(c) { yield* createTokens(c.g, c.you, 'Pest', c.g.opponents(c.you).length); } } },
  ],
  rulings: {
    1: 'teste: só prepara se você ganhou vida no turno',
    2: 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)',
    3: 'regra geral: CR 722.3a — preparado é designação, não habilidade',
    4: 'teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação',
    5: 'regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal',
    6: 'regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado',
    7: 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)',
    8: 'regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)',
    9: 'regra geral: CR 722.4 — fora do campo, só as características normais',
    10: 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)',
    11: 'regra geral: CR 722.3a — prepare() exige feitiço preparado',
    12: 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável',
    13: 'regra geral: CR 722.3a — prepare() não age em quem já está preparado',
    14: 'não se aplica: nenhuma carta dos decks pede para nomear uma carta',
    15: 'regra geral: CR 722.3a — a designação continua',
    16: 'regra geral: CR 722.3 — a carta é conjurada só pela frente',
  },
});
