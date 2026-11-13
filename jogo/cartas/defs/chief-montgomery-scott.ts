// Chief Montgomery Scott
// Strange new worlds — {6}, {T}: You may put a creature or Spacecraft card from your hand onto the battlefield. It
// enters with X additional +1/+1 counters on it if it's a creature and X additional charge counters on it if it's a
// Spacecraft, where X is the number of differently named lands you control.
import { activated, chars, chooseItems, defineCard, isCreature, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import { terrenosComNomesDiferentes } from '../startrek.ts';

export default defineCard({
  name: 'Chief Montgomery Scott',
  faces: [{
    abilities: [
      activated('{6}, {T}', function* (c) {
        const s = c.g.state;
        const nave = (id: number) => chars(c.g, id).subtypes.includes('Spacecraft');
        const cands = s.zones.hand[c.you].filter((id) => isCreature(c.g, id) || nave(id));
        if (!cands.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Chief Scott: você pode pôr uma carta de criatura ou Spacecraft da sua mão no campo', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        const id = Number(esc[0]);
        const x = terrenosComNomesDiferentes(c.g, c.you);
        // CR 614.1c: entra com os marcadores; criatura e Spacecraft (as duas coisas) recebe os dois tipos
        const counters: Record<string, number> = {};
        if (x > 0 && isCreature(c.g, id)) counters['+1/+1'] = x;
        if (x > 0 && nave(id)) counters.charge = x;
        yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters }], 'effect');
      }, { text: 'Strange new worlds — {6}, {T}: Você pode pôr uma carta de criatura ou Spacecraft da sua mão no campo. Ela entra com X marcadores +1/+1 adicionais se for criatura e X marcadores de carga adicionais se for Spacecraft, em que X é o número de terrenos com nomes diferentes que você controla.' }),
    ],
  }],
  rulings: {},
});
