// Cazur, Ruthless Stalker
// Partner with Ukkima, Stalking Shadow (When this creature enters, target player may put Ukkima into their hand from
// their library, then shuffle.)
// Whenever a creature you control deals combat damage to a player, put a +1/+1 counter on that creature.
import { addCounters, chars, controllerOf, defineCard, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { PARCEIRO_COM, SELECAO } from '../tartarugas.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Cazur, Ruthless Stalker',
  faces: [{
    abilities: [
      parceiroCom('Ukkima, Stalking Shadow'),
      // um gatilho por criatura (e por jogador atingido)
      triggered(on.custom((e, c) => {
        if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player') return false;
        const o = c.g.state.objects[e.source];
        return o && o.zone === 'battlefield' && controllerOf(c.g, e.source) === c.you && chars(c.g, e.source).types.includes('Creature') ? { criatura: e.source } : false;
      }), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, coloque um marcador +1/+1 nessa criatura.' }),
    ],
  }],
  rulings: {
    1: PARCEIRO_COM.gatilho,
    2: PARCEIRO_COM.busca,
    3: PARCEIRO_COM.deck,
    4: SELECAO.identidade,
    5: SELECAO.comecam,
    6: PARCEIRO_COM.soEntreSi,
    7: SELECAO.separados,
    8: 'teste: ao entrar, o jogador alvo pode pôr Ukkima do grimório dele na mão',
  },
});
