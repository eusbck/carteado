// Delney, Streetwise Lookout
// Creatures you control with power 2 or less can't be blocked by creatures with power 3 or greater.
// If a triggered ability of a creature you control with power 2 or less triggers, that ability triggers an additional
// time.
import { chars, controllerOf, defineCard, power, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Delney, Streetwise Lookout',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          // ruling 1: só vale ao declarar os bloqueadores (CR 509.1b); mudar a força depois não desfaz o bloqueio
          canBeBlockedBy: (c, atacante, bloqueador) => controllerOf(c.g, atacante) !== c.you || power(c.g, atacante) > 2 || power(c.g, bloqueador) < 3,
        },
        text: 'Criaturas que você controla com força 2 ou menos não podem ser bloqueadas por criaturas com força 3 ou mais.',
      }),
      staticAbility({
        rules: {
          // CR 603.2d; rulings 5, 6: dispara mais uma vez (não copia); com duas Delney, mais duas
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you) return 0;
            const o = c.g.state.objects[tr.source];
            // a força é a do momento do disparo; para gatilhos de sair, a última informação conhecida (rulings 9, 10)
            const ch = o?.zone === 'battlefield' ? (controllerOf(c.g, tr.source) === c.you ? chars(c.g, tr.source) : null) : c.g.state.lki[tr.source]?.chars ?? null;
            return ch && ch.types.includes('Creature') && (ch.power ?? 0) <= 2 ? 1 : 0;
          },
        },
        text: 'Se uma habilidade desencadeada de uma criatura que você controla com força 2 ou menos disparar, ela dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1b — a restrição de bloqueio só é conferida ao declarar os bloqueadores (motor/combat.ts canBlock)',
    2: 'regra geral: CR 603.1 — habilidades desencadeadas usam "quando", "sempre que" ou "no"',
    3: 'regra geral: CR 614.1c — "entra com" é substituição e não passa por extraTriggers',
    4: 'regra geral: CR 614.1c — "conforme entra" e "conforme é virada para cima" não passam por extraTriggers',
    5: 'teste: o gatilho de uma criatura sua com força 2 ou menos dispara uma vez a mais',
    6: 'regra geral: CR 603.2d — cada Delney soma um disparo (motor/triggers.ts soma os extraTriggers)',
    7: 'regra geral: CR 607.2a — as instâncias a mais continuam ligadas à outra habilidade',
    8: 'não se aplica: nenhuma carta com habilidades ligadas desse tipo nos decks com a Delney',
    9: 'regra geral: CR 603.2d — a força é a do momento do disparo (extraTriggers olha as características atuais)',
    10: 'regra geral: CR 603.2d — a força é a do momento do disparo; mudar depois não tira nem põe disparos',
  },
});
