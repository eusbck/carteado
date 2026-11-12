// Gudul Lurker
// This creature can't be blocked.
// Megamorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph
// cost and put a +1/+1 counter on it.)
import { defineCard, megamorph } from '../../motor/api.ts';
import { naoPodeSerBloqueada } from '../ninjas.ts';

export default defineCard({
  name: 'Gudul Lurker',
  faces: [{
    abilities: [
      naoPodeSerBloqueada(),
      // CR 702.37b (motor/megamorfose.ts)
      megamorph('{U}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1, 702.37e — virar para cima depois do bloqueio não desfaz o bloqueio (motor/combat.ts)',
    2: 'teste: virar pela megamorfose é ação especial: vira e ganha o marcador sem usar a pilha',
    3: 'regra geral: CR 702.37b — só ganha o marcador se o custo de megamorfose foi pago (testes/regras-megamorfose.test.ts)',
    4: 'regra geral: CR 702.37b — megamorfose é uma variante do morph (motor/megamorfose.ts)',
  },
});
