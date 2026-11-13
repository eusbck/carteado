// Sword of Truth and Justice
// Equipped creature gets +2/+2 and has protection from white and from blue.
// Whenever equipped creature deals combat damage to a player, put a +1/+1 counter on a creature you control, then
// proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already
// there.)
// Equip {2}
import { addCounters, attachedGets, chooseItems, controlledBy, defineCard, equip, isCreature, nameOf, objItem, proliferate, triggered } from '../../motor/api.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

const PROLIFERAR = 'regra geral: CR 701.34a — proliferar escolhe quaisquer permanentes e jogadores com marcadores, inclusive nenhum, e dá um de cada tipo que já têm (motor/mecanicas.ts proliferate)';

export default defineCard({
  name: 'Sword of Truth and Justice',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'protection', param: 'color:W' }, { k: 'addKeyword', kw: 'protection', param: 'color:U' }], 'A criatura equipada recebe +2/+2 e tem proteção contra o branco e contra o azul.'),
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        const g = c.g;
        // sem alvo: a criatura é escolhida na resolução
        const minhas = controlledBy(g, c.you, (id) => isCreature(g, id));
        if (minhas.length) {
          const [esc] = yield* chooseItems(g, c.you, 'Sword of Truth and Justice: coloque um marcador +1/+1 numa criatura que você controla', minhas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          addCounters(g, { kind: 'obj', id: Number(esc) }, '+1/+1', 1, c.you);
        }
        yield* proliferate(g, c.you);
      }, { text: 'Sempre que a criatura equipada causa dano de combate a um jogador, coloque um marcador +1/+1 numa criatura que você controla, depois prolifere.' }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam aos pares (motor/sba.ts)',
    2: 'não se aplica: nenhuma carta dos decks dispara "sempre que você prolifera"',
    3: PROLIFERAR,
    4: PROLIFERAR,
    5: 'teste: põe o marcador e prolifera, escolhendo só o que quiser',
    6: PROLIFERAR,
    7: PROLIFERAR,
    8: 'regra geral: CR 702.16 — proteção contra uma cor (motor/chars.ts, motor/combat.ts)',
  },
});
