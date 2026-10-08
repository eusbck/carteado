// Cyan, Vengeful Samurai
// This spell costs {1} less to cast for each creature card in your graveyard.
// Double strike
// Whenever one or more creature cards leave your graveyard, put a +1/+1 counter on Cyan.
import { addCounters, defineCard, isCreature, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Cyan, Vengeful Samurai',
  faces: [{
    selfCost: (c) => ({ reduce: c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length }),
    abilities: [
      keyword('double strike'),
      // ruling 1: várias ao mesmo tempo disparam uma vez
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you && !!c.g.state.lki[e.old]?.chars.types.includes('Creature'))), function* (c) {
        if (c.g.state.objects[c.source]) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma ou mais cartas de criatura saem do seu cemitério, coloque um marcador +1/+1 em Cyan.' }),
    ],
  }],
  rulings: { 1: 'teste: várias cartas saindo juntas disparam uma vez' },
});
