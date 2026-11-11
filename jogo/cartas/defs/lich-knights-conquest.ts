// Lich-Knights' Conquest
// Sacrifice any number of artifacts, enchantments, and/or tokens. Return that many creature cards from your graveyard to
// the battlefield.
import { chooseItems, controlledBy, defineCard, isCreature, isType, nameOf, objItem, putOntoBattlefield, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: "Lich-Knights' Conquest",
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const cands = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment') || s.objects[id].isToken);
        const ids = cands.length ? yield* chooseItems(c.g, c.you, "Lich-Knights' Conquest: sacrifique artefatos, encantamentos e/ou fichas", cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, cands.length) : [];
        const n = ids.length ? (yield* sacrifice(c.g, ids.map(Number))).filter((x) => x !== null).length : 0;
        // ruling 1: as cartas escolhidas podem incluir as que acabaram de ir para o cemitério
        const cemiterio = s.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
        if (n === 0 || !cemiterio.length) return;
        const k = Math.min(n, cemiterio.length);
        const volta = yield* chooseItems(c.g, c.you, `Devolva ${k} carta(s) de criatura do seu cemitério ao campo`, cemiterio.map((x) => objItem(c.g, x, nameOf(c.g, x))), k, k);
        yield* putOntoBattlefield(c.g, volta.map((id) => ({ id: Number(id), controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2c — uma criatura-artefato sacrificada já está no cemitério e pode voltar',
    2: 'regra geral: CR 111.7 — fichas sacrificadas não voltam',
    3: 'regra geral: CR 701.21a — pode sacrificar zero',
    4: 'regra geral: CR 608.2c — só volta até o número sacrificado',
  },
});
