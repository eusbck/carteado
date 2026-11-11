// Tevesh Szat, Doom of Fools
// +2: Create two 0/1 black Thrull creature tokens.
// +1: You may sacrifice another creature or planeswalker. If you do, draw two cards, then draw another card if the
// sacrificed permanent was a commander.
// −10: Gain control of all commanders. Put all commanders from the command zone onto the battlefield under your control.
// Tevesh Szat, Doom of Fools can be your commander.
// Partner
import {
  activated, addEffect, chooseItems, controlledBy, createTokens, defineCard, draw, isCreature, isEmblem, isType, nameOf, objItem, putOntoBattlefield, sacrifice, yesNo,
} from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Tevesh Szat, Doom of Fools',
  faces: [{
    abilities: [
      activated('+2', function* (c) { yield* createTokens(c.g, c.you, 'Thrull 0/1', 2); }, { text: '+2: Crie duas fichas de criatura Thrull pretas 0/1.' }),
      activated('+1', function* (c) {
        const cands = controlledBy(c.g, c.you, (id) => id !== c.source && (isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')));
        if (!cands.length || !(yield* yesNo(c.g, c.you, 'Tevesh Szat: sacrificar outra criatura ou planeswalker para comprar?'))) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Sacrifique outra criatura ou planeswalker', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        const id = Number(esc);
        const comandante = ehComandante(c.g, id);
        const [foi] = yield* sacrifice(c.g, [id]);
        if (foi === null || foi === undefined) return;
        yield* draw(c.g, c.you, comandante ? 3 : 2);
      }, { text: '+1: Você pode sacrificar outra criatura ou planeswalker. Se fizer isso, compre duas cartas e depois mais uma se o permanente sacrificado era um comandante.' }),
      activated('−10', function* (c) {
        const s = c.g.state;
        const noCampo = s.zones.battlefield.filter((id) => ehComandante(c.g, id) && s.objects[id].controller !== c.you);
        if (noCampo.length) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, affected: noCampo, duration: { kind: 'permanent' }, mods: [{ k: 'control', player: c.you }] });
        const naZona = s.zones.command.filter((id) => ehComandante(c.g, id) && !isEmblem(c.g, id));
        if (naZona.length) yield* putOntoBattlefield(c.g, naZona.map((id) => ({ id, controller: c.you })), 'effect');
      }, { text: '−10: Ganhe o controle de todos os comandantes. Coloque todos os comandantes da zona de comando no campo de batalha sob o seu controle.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 903.3a — pode ser o seu comandante (motor/deck.ts podeSerComandante)',
    2: 'regra geral: CR 702.124h — parceiro com outro comandante com parceiro (motor/deck.ts duplaValida)',
    3: 'regra geral: CR 903.9 — os comandantes continuam sendo comandantes dos donos',
  },
});
