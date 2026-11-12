// Lich-Knights' Conquest
// Sacrifice any number of artifacts, enchantments, and/or tokens. Return that many creature cards from your graveyard
// to the battlefield.
import { chooseItems, controlledBy, defineCard, isCreature, isType, nameOf, objItem, putOntoBattlefield, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: "Lich-Knights' Conquest",
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        // ruling 1: sacrificar faz parte da resolução; ruling 2: pode ser zero
        const cands = controlledBy(g, c.you, (id) => isType(g, id, 'Artifact') || isType(g, id, 'Enchantment') || g.state.objects[id].isToken);
        const esc = cands.length ? yield* chooseItems(g, c.you, "Lich-Knights' Conquest: sacrifique quantos artefatos, encantamentos e/ou fichas quiser", cands.map((id) => objItem(g, id, nameOf(g, id))), 0, cands.length) : [];
        const res = esc.length ? yield* sacrifice(g, esc.map(Number)) : [];
        const n = res.filter((x) => x !== null && x !== undefined).length;
        if (n === 0) return;
        // ruling 4: uma criatura artefato ou encantamento sacrificada agora pode voltar; ruling 3: os gatilhos esperam
        const cemiterio = g.state.zones.graveyard[c.you].filter((id) => isCreature(g, id));
        const k = Math.min(n, cemiterio.length);
        if (!k) return;
        const voltam = k === cemiterio.length ? cemiterio.map(String) : yield* chooseItems(g, c.you, `Lich-Knights' Conquest: devolva ${k} carta(s) de criatura do seu cemitério ao campo`, cemiterio.map((id) => objItem(g, id, nameOf(g, id))), k, k);
        yield* putOntoBattlefield(g, voltam.map((id) => ({ id: Number(id), controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: sacrifica artefatos e fichas e devolve a mesma quantidade de criaturas do cemitério',
    2: 'teste: sem sacrificar nada, nada volta',
    3: 'regra geral: CR 608.2 — os gatilhos dos sacrifícios esperam a mágica terminar (motor)',
    4: 'teste: a criatura artefato sacrificada pode ser uma das que voltam',
  },
});
