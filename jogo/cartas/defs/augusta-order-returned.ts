// Augusta, Order Returned
// Flying, vigilance
// Whenever Augusta attacks, each player exiles a card from their graveyard. When one or more nonland cards are exiled
// this way, put that many +1/+1 counters on target attacking creature.
import { addCounters, chooseItems, defineAbility, defineCard, exile, isAttacking, isLand, keywords, nameOf, objItem, on, reflexive, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const MARCADORES = defineAbility('Augusta, Order Returned:marcadores', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', c.data.n as number, c.you);
}, { targets: [t.creature((c, id) => isAttacking(c.g, id), 'criatura atacante alvo')], text: 'Coloque marcadores +1/+1 na criatura atacante alvo.' }));

export default defineCard({
  name: 'Augusta, Order Returned',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      triggered(on.selfAttacks(), function* (c) {
        // ruling 2: o jogador ativo escolhe primeiro, depois os outros em ordem; exilam ao mesmo tempo
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap()) {
          const cem = c.g.state.zones.graveyard[p];
          if (cem.length === 0) continue;
          const [pick] = yield* chooseItems(c.g, p, 'Augusta: exile uma carta do seu cemitério', cem.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          escolhidas.push(Number(pick));
        }
        const naoTerrenos = escolhidas.filter((id) => !isLand(c.g, id)).length;
        yield* exile(c.g, escolhidas);
        // ruling 1: gatilho reflexivo com alvo escolhido ao ir para a pilha (CR 603.12)
        if (naoTerrenos > 0) reflexive(c, MARCADORES.id!, { n: naoTerrenos });
      }, { text: 'Sempre que Augusta ataca, cada jogador exila uma carta do próprio cemitério. Quando uma ou mais cartas que não são terrenos são exiladas assim, coloque essa quantidade de marcadores +1/+1 na criatura atacante alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: o alvo é escolhido no gatilho reflexivo',
    2: 'regra geral: CR 101.4 — escolhas em ordem APNAP e exílio simultâneo',
  },
});
