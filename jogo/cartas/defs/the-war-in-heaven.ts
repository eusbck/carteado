// The War in Heaven
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — You draw three cards and you lose 3 life.
// II — Mill three cards.
// III — Choose up to three target creature cards with total mana value 8 or less in your graveyard. Return each of them
// to the battlefield with a necrodermis counter on it. They're artifacts in addition to their other types.
import { addEffect, chapter, chars, defineCard, draw, loseLife, manaValue, mill, putOntoBattlefield, sagaEnters, t, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'The War in Heaven',
  faces: [{
    abilities: [
      sagaEnters(),
      chapter([1], function* (c) {
        yield* draw(c.g, c.you, 3);
        loseLife(c.g, c.you, 3, c.source);
      }, { text: 'I — Você compra três cartas e perde 3 pontos de vida.' }),
      chapter([2], function* (c) { yield* mill(c.g, c.you, 3); }, { text: 'II — Triture três cartas.' }),
      chapter([3], function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id] : []));
        if (!ids.length) return;
        const novos = yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, counters: { necrodermis: 1 } })), 'effect');
        // "são artefatos além dos outros tipos": vale enquanto cada uma continuar no campo
        for (const id of novos) {
          if (c.g.state.objects[id]?.zone !== 'battlefield') continue;
          addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id], mods: [{ k: 'addTypes', types: ['Artifact'] }] });
        }
      }, {
        targets: [{
          ...upTo(3, t.card('graveyard', (c, id) => chars(c.g, id).types.includes('Creature'), 'cartas de criatura alvo no seu cemitério com valor de mana total 8 ou menos')),
          // ruling 1: o X do custo de uma carta no cemitério conta como 0
          validateSet: (c, alvos) => alvos.reduce((n, r) => n + (r.kind === 'obj' ? manaValue(c.g, r.id) : 0), 0) <= 8,
        }],
        text: 'III — Escolha até três cartas de criatura alvo com valor de mana total 8 ou menos no seu cemitério. Devolva cada uma delas ao campo de batalha com um marcador de necroderme. Elas são artefatos além dos outros tipos delas.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 202.3e — fora da pilha, o X do custo conta como 0 no valor de mana (motor/chars.ts manaValue)' },
});