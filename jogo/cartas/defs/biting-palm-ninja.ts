// Biting-Palm Ninja
// Ninjutsu {2}{B}
// This creature enters with a menace counter on it.
// Whenever this creature deals combat damage to a player, you may remove a menace counter from it. When you do, that
// player reveals their hand and you choose a nonland card from it. Exile that card.
import {
  chooseItems, defineAbility, defineCard, entersWithCounters, exile, isLand, nameOf, ninjutsu, on, reflexive, removeCounters, triggered, yesNo,
} from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { NINJUTSU } from '../ninjas.ts';

// CR 603.12: gatilho reflexivo "quando fizer isso" (ruling 1: vai para a pilha e pode ser respondido)
const REVELA = defineAbility('Biting-Palm Ninja:revela', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const g = c.g;
  const p = c.data.player as PlayerId;
  if (p === undefined || g.state.players[p].left) return;
  const mao = g.state.zones.hand[p];
  g.log(`${g.state.players[p].name} revela a mão: ${mao.map((id) => nameOf(g, id)).join(', ') || 'vazia'}.`, { rule: '701.20' });
  const cands = mao.filter((id) => !isLand(g, id));
  if (!cands.length) return;
  const [esc] = yield* chooseItems(g, c.you, 'Biting-Palm Ninja: escolha uma carta que não seja terreno para exilar', cands.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), 1, 1);
  yield* exile(g, [Number(esc)]);
}, { text: 'Esse jogador revela a mão e você escolhe uma carta que não seja terreno dela. Exile essa carta.' }));

export default defineCard({
  name: 'Biting-Palm Ninja',
  faces: [{
    abilities: [
      ninjutsu('{2}{B}'),
      entersWithCounters('menace', 1),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield' || !(o.counters.menace > 0)) return;
        if (!(yield* yesNo(c.g, c.you, 'Biting-Palm Ninja: remover um marcador de ameaçar para exilar uma carta da mão desse jogador?'))) return;
        if (removeCounters(c.g, { kind: 'obj', id: c.source }, 'menace', 1) > 0) reflexive(c, REVELA.id!, { player: c.event.player });
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode remover um marcador de ameaçar dela. Quando fizer isso, esse jogador revela a mão e você escolhe uma carta que não seja terreno dela. Exile essa carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: removendo o marcador de ameaçar, o reflexivo exila a carta escolhida da mão do jogador atingido',
    2: NINJUTSU.depoisDosBloqueios,
    3: NINJUTSU.revela,
    4: NINJUTSU.mesmoJogador,
    5: NINJUTSU.naoDeclarada,
    6: NINJUTSU.etapas,
    7: NINJUTSU.primeiroGolpe,
    8: 'não se aplica: piada da carta (sem regra)',
  },
});
