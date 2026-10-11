// Superior Foes of Spider-Man
// Trample
// Whenever you cast a spell with mana value 4 or greater, you may exile the top card of your library. If you do, you may
// play that card until you exile another card with this creature.
import { addEffect, defineCard, exile, keyword, manaValue, on, removeEffect, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Superior Foes of Spider-Man',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.youCast((c, id) => manaValue(c.g, id) >= 4), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        const topo = s.zones.library[c.you][0];
        if (!eu || eu.zone !== 'battlefield' || topo === undefined) return;
        if (!(yield* yesNo(c.g, c.you, 'Superior Foes of Spider-Man: exilar a carta do topo do seu grimório? (você poderá jogá-la até exilar outra assim)'))) return;
        const [ex] = yield* exile(c.g, [topo]);
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        // a permissão anterior acaba quando outra carta é exilada com esta criatura
        if (typeof eu.data.foesEfeito === 'number') removeEffect(c.g, eu.data.foesEfeito);
        // ruling 1: paga os custos e segue o tempo normal (terreno só com jogada de terreno disponível)
        const ef = addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'permanent' }, affected: null, mods: [{ k: 'rule', id: 'rule:mayPlay', params: { objs: [ex], player: c.you } }] });
        eu.data.foesEfeito = ef.id;
      }, { text: 'Sempre que você conjura uma mágica com valor de mana 4 ou mais, você pode exilar a carta do topo do seu grimório. Se fizer isso, você pode jogar essa carta até exilar outra carta com esta criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.3, 305.1 — a carta exilada é jogada no tempo normal, pagando os custos (motor/priority.ts rule:mayPlay)',
  },
});
