// Needle Spires
// This land enters tapped.
// {T}: Add {R} or {W}.
// {2}{R}{W}: Until end of turn, this land becomes a 2/1 red and white Elemental creature with double strike. It's still
// a land.
import { activated, defineCard, land, mana, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Needle Spires',
  faces: [{
    abilities: [
      land.tapped(),
      mana(['R', 'W']),
      activated('{2}{R}{W}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // camadas 4 (tipos), 5 (cores), 6 (golpe duplo) e 7b (2/1): marcadores e modificadores continuam valendo (ruling 4)
        untilEndOfTurn(c, [c.source], [
          { k: 'addTypes', types: ['Creature'], subtypes: ['Elemental'] }, { k: 'setPT', p: 2, t: 1 }, { k: 'setColors', colors: ['R', 'W'] },
          { k: 'addKeyword', kw: 'double strike' },
        ]);
      }, { text: '{2}{R}{W}: Até o fim do turno, este terreno vira uma criatura Elemental vermelha e branca 2/1 com golpe duplo. Continua sendo terreno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 302.6 — enjoo de invocação conta desde quando o terreno ficou sob seu controle',
    2: 'teste: vira uma criatura Elemental 2/1 vermelha e branca com golpe duplo e continua terreno; sem a habilidade é incolor',
    3: 'regra geral: CR 603.6a — virar criatura não é entrar no campo',
    4: 'regra geral: CR 613.4b — o efeito define 2/1 na camada 7b; marcadores entram depois (7c)',
  },
});
