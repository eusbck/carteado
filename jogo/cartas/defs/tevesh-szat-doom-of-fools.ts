// Tevesh Szat, Doom of Fools
// +2: Create two 0/1 black Thrull creature tokens.
// +1: You may sacrifice another creature or planeswalker. If you do, draw two cards, then draw another card if the
// sacrificed permanent was a commander.
// −10: Gain control of all commanders. Put all commanders from the command zone onto the battlefield under your control.
// Tevesh Szat, Doom of Fools can be your commander.
// Partner
import { activated, chooseItems, controlledBy, createTokens, defineCard, draw, gainControl, isCreature, isType, keyword, nameOf, objItem, putOntoBattlefield, sacrifice, yesNo } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Tevesh Szat, Doom of Fools',
  faces: [{
    abilities: [
      activated('+2', function* (c) {
        yield* createTokens(c.g, c.you, 'Thrull 0/1', 2);
      }, { text: '+2: Crie duas fichas de criatura Thrull pretas 0/1.' }),
      activated('+1', function* (c) {
        // ruling 1: a escolha (se e o quê sacrificar) é na resolução
        const cands = controlledBy(c.g, c.you, (id) => id !== c.source && (isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')));
        if (!cands.length || !(yield* yesNo(c.g, c.you, 'Tevesh Szat: sacrificar outra criatura ou planeswalker?'))) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Tevesh Szat: sacrifique outra criatura ou planeswalker', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const id = Number(esc);
        const eraComandante = ehComandante(c.g, id);
        const res = yield* sacrifice(c.g, [id]);
        if (!res.some((x) => x !== null && x !== undefined)) return;
        yield* draw(c.g, c.you, eraComandante ? 3 : 2);
      }, { text: '+1: Você pode sacrificar outra criatura ou planeswalker. Se fizer isso, compre duas cartas e depois compre mais uma se o permanente sacrificado era um comandante.' }),
      activated('−10', function* (c) {
        const s = c.g.state;
        // ruling 2: primeiro os comandantes que já estão no campo, depois os da zona de comando
        for (const id of s.zones.battlefield.filter((x) => ehComandante(c.g, x))) gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
        const daZona = s.zones.command.filter((x) => ehComandante(c.g, x));
        if (daZona.length) yield* putOntoBattlefield(c.g, daZona.map((id) => ({ id, controller: c.you })), 'effect');
      }, { text: '−10: Ganhe o controle de todos os comandantes. Coloque todos os comandantes da zona de comando no campo de batalha sob o seu controle.' }),
      { ...keyword('partner'), text: 'Parceiro' },
    ],
  }],
  rulings: {
    1: 'teste: +1 sacrificando um comandante compra três cartas',
    2: 'teste: −10 ganha os comandantes do campo e põe os da zona de comando sob o seu controle',
    3: 'regra geral: CR 800.4a — quem sai da partida leva junto os efeitos de controle dele (motor)',
    4: 'regra geral: CR 903.4 — identidade de cor dos dois comandantes somada (motor/deck.ts)',
    5: 'regra geral: CR 903.6 — os dois comandantes começam na zona de comando (motor/deck.ts)',
    6: 'regra geral: CR 702.124 — parceiros conferidos no começo da partida (motor/deck.ts)',
    7: 'regra geral: CR 903.8 — imposto contado por comandante (motor)',
    8: 'regra geral: CR 903.3 — "o seu comandante" com dois comandantes (motor)',
    9: 'regra geral: CR 903.3 — controlar um dos dois basta (cartas/wakanda.ts controlaComandante)',
    10: 'regra geral: CR 702.124 — dois parceiros das mesmas cores são permitidos (motor/deck.ts)',
  },
});
