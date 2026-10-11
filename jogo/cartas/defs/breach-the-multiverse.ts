// Breach the Multiverse
// Each player mills ten cards. For each player, choose a creature or planeswalker card in that player's graveyard. Put
// those cards onto the battlefield under your control. Then each creature you control becomes a Phyrexian in addition to
// its other types.
import { addEffect, chooseItems, creaturesOf, defineCard, isCreature, isType, mill, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Breach the Multiverse',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        for (const p of c.g.apnap()) yield* mill(c.g, p, 10);
        // ruling 1: uma carta por jogador, moída agora ou não; sem alvo, escolhida na resolução
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap()) {
          const cartas = s.zones.graveyard[p].filter((id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'));
          if (!cartas.length) continue;
          const [esc] = cartas.length === 1 ? [String(cartas[0])] : yield* chooseItems(c.g, c.you, `Breach the Multiverse: escolha uma carta de criatura ou planeswalker do cemitério de ${s.players[p].name}`, cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          escolhidas.push(Number(esc));
        }
        if (escolhidas.length) yield* putOntoBattlefield(c.g, escolhidas.map((id) => ({ id, controller: c.you })), 'effect');
        // ruling 2: Phyrexian enquanto estiverem no campo (efeito sem prazo sobre as criaturas que você controla agora)
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'permanent' }, affected: ids, mods: [{ k: 'addTypes', subtypes: ['Phyrexian'] }] });
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador moi dez cartas; você põe no campo uma criatura ou planeswalker do cemitério de cada um, e as suas criaturas viram Phyrexian',
    2: 'regra geral: CR 611.2c — o efeito vale para as criaturas que você controla na resolução, sem prazo; fora do campo o objeto é outro (CR 400.7)',
  },
});
