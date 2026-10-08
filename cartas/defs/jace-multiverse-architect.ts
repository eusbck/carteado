// Jace, Multiverse Architect
// At the beginning of combat on each opponent's turn, they may pay {2}. If they don't, creatures they control can't
// attack Jaces you control this turn.
// +1: Draw two cards, then put a card from your hand on the bottom of your library.
// −3: Exile another target planeswalker or creature you control. Reveal cards from the top of your library until you
// reveal a creature or planeswalker card. Put that card onto the battlefield and the rest on the bottom of your library
// in a random order.
// Jace, Multiverse Architect can be your commander. (CR 903.3a: regra de montagem de deck)
import {
  activated, and, chars, chooseItems, controllerOf, defineAbility, defineCard, draw, exile, is, mayPay, moveObjects, nameOf, objItem,
  on, or, putOntoBattlefield, ruleEffect, staticAbility, t, tgt, triggered,
} from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { PlayerId } from '../../motor/types.ts';

// "as criaturas que eles controlam não podem atacar Jaces que você controla neste turno": restrição de ataque
// (CR 508.1c) que olha o controlador da criatura e do Jace na hora de declarar
const NAO_ATACA_JACES = defineAbility('Jace, Multiverse Architect:naoAtacaJaces', staticAbility({
  rules: {
    canAttack: (c, atacante, alvo) => {
      const quem = (c as { params?: { player?: PlayerId } }).params?.player;
      if (alvo.kind !== 'obj' || quem === undefined || controllerOf(c.g, atacante) !== quem) return true;
      const ch = chars(c.g, alvo.id);
      return !(ch.types.includes('Planeswalker') && ch.subtypes.includes('Jace') && controllerOf(c.g, alvo.id) === c.you);
    },
  },
  text: 'As criaturas deste jogador não podem atacar Jaces do controlador de Jace, Multiverse Architect neste turno.',
}));

export default defineCard({
  name: 'Jace, Multiverse Architect',
  faces: [{
    abilities: [
      triggered(on.beginCombat('opponent'), function* (c) {
        const op = c.event.active as PlayerId;
        if (c.g.state.players[op].left) return;
        if (yield* mayPay(c, op, '{2}', `que suas criaturas possam atacar Jaces de ${c.g.state.players[c.you].name} neste turno`)) return;
        ruleEffect(c, NAO_ATACA_JACES.id!, { kind: 'endOfTurn' }, { params: { player: op } });
        c.g.log(`${c.g.state.players[op].name} não paga {2}: suas criaturas não podem atacar Jaces de ${c.g.state.players[c.you].name} neste turno.`);
      }, { text: 'No início do combate no turno de cada oponente, ele pode pagar {2}. Se não pagar, as criaturas que ele controla não podem atacar Jaces que você controla neste turno.' }),
      activated('+1', function* (c) {
        yield* draw(c.g, c.you, 2);
        const mao = c.g.state.zones.hand[c.you];
        if (mao.length === 0) return;
        const [id] = yield* chooseItems(c.g, c.you, 'Jace: escolha uma carta da sua mão para pôr no fundo do grimório', mao.map((x) => ({ ...objItem(c.g, x, nameOf(c.g, x)), card: { def: c.g.state.objects[x].def } })), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(id), to: 'library', position: 'bottom' }], 'effect');
      }, { text: '+1: Compre duas cartas, depois coloque uma carta da sua mão no fundo do seu grimório.' }),
      activated('−3', function* (c) {
        const s = c.g.state;
        const alvo = tgt(c);
        if (alvo !== null) yield* exile(c.g, [alvo]);
        // revelar até achar uma carta de criatura ou planeswalker (CR 701.20)
        const lib = s.zones.library[c.you];
        const i = lib.findIndex((id) => { const ch = chars(c.g, id); return ch.types.includes('Creature') || ch.types.includes('Planeswalker'); });
        const reveladas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        c.g.log(`${s.players[c.you].name} revela ${reveladas.map((id) => nameOf(c.g, id)).join(', ') || 'nada'}.`, { rule: '701.20' });
        if (i >= 0) yield* putOntoBattlefield(c.g, [{ id: lib[i], controller: c.you }], 'effect');
        // o resto vai para o fundo em ordem aleatória
        const resto = shuffle(s.rng, reveladas.filter((id) => s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, {
        targets: [t.permanent(and(or(is.planeswalker, is.creature), is.yours, is.other), 'outro planeswalker ou criatura alvo que você controla')],
        text: '−3: Exile outro planeswalker ou criatura alvo que você controla. Revele cartas do topo do seu grimório até revelar uma carta de criatura ou planeswalker. Coloque essa carta no campo e o resto no fundo do seu grimório em ordem aleatória.',
      }),
    ],
  }],
  rulings: {},
});
