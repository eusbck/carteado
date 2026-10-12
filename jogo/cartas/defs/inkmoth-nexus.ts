// Inkmoth Nexus
// {T}: Add {C}.
// {1}: This land becomes a 1/1 Phyrexian Blinkmoth artifact creature with flying and infect until end of turn. It's still
// a land. (It deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)
import { activated, defineCard, mana, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Inkmoth Nexus',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // continua terreno: só acrescenta os tipos (CR 613.1d, camada 4)
        untilEndOfTurn(c, [c.source], [
          { k: 'addTypes', types: ['Artifact', 'Creature'], subtypes: ['Phyrexian', 'Blinkmoth'] }, { k: 'setPT', p: 1, t: 1 },
          { k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'infect' },
        ]);
      }, { text: '{1}: Este terreno se torna uma criatura artefato Phyrexian Blinkmoth 1/1 com voar e infectar até o fim do turno. Ele ainda é um terreno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 302.6 — o terreno que entrou neste turno gera mana enquanto não for criatura; virando criatura, vale o enjoo de invocação (motor/priority.ts)',
    2: 'regra geral: CR 302.6 — controlado desde o início do seu turno, pode atacar e ser virado para mana mesmo como criatura (motor/priority.ts)',
  },
});