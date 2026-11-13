// Zurgo and Ojutai
// Flying, haste
// Zurgo and Ojutai has hexproof as long as it entered this turn.
// Whenever one or more Dragons you control deal combat damage to a player or battle, look at the top three cards of
// your library. Put one of them into your hand and the rest on the bottom of your library in any order. You may return
// one of those Dragons to its owner's hand.
import {
  chars, chooseItems, defineCard, keywords, lkiChars, moveObjects, nameOf, objItem, on, returnToHand, selfGets, triggered,
} from '../../motor/api.ts';
import type { GameEvent } from '../../motor/events.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Zurgo and Ojutai',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      // "enquanto tiver entrado neste turno" (o mesmo objeto)
      selfGets((c) => (c.g.state.enteredThisTurn?.turn === c.g.state.turn.number && c.g.state.enteredThisTurn.objs.includes(c.source) ? [{ k: 'addKeyword', kw: 'hexproof' }] : []),
        'Zurgo and Ojutai tem resistência a magia enquanto tiver entrado neste turno.'),
      // ruling 1-2: um gatilho por jogador (ou batalha) que tomou dano de combate de Dragons seus, em cada passo de dano
      triggered(on.batch((evs: GameEvent[], c) => {
        const porJogador = new Map<number, ObjId[]>();
        for (const e of evs) {
          if (e.type !== 'damage' || !e.combat || e.amount <= 0 || e.target.kind !== 'player') continue;
          // a fonte agora, ou pela última informação se já saiu do campo
          const ch = c.g.state.objects[e.source] ? chars(c.g, e.source) : lkiChars(c.g, e.source);
          if (!ch || ch.controller !== c.you || !ch.subtypes.includes('Dragon')) continue;
          porJogador.set(e.target.id, [...(porJogador.get(e.target.id) ?? []), e.source]);
        }
        return [...porJogador.entries()].map(([jogador, dragoes]) => ({ jogador, dragoes }));
      }), function* (c) {
        const g = c.g;
        const topo = g.state.zones.library[c.you].slice(0, 3);
        if (topo.length) {
          const [mao] = yield* chooseItems(g, c.you, 'Zurgo and Ojutai: escolha a carta que vai para a sua mão', topo.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          yield* moveObjects(g, [{ id: Number(mao), to: 'hand' }], 'effect');
          let resto = topo.filter((id) => id !== Number(mao) && g.state.objects[id]?.zone === 'library');
          // "em qualquer ordem": escolhe a que vai primeiro para o fundo
          while (resto.length) {
            let prox = resto[0];
            if (resto.length > 1) {
              const [r] = yield* chooseItems(g, c.you, 'Zurgo and Ojutai: escolha a próxima carta a ir para o fundo do grimório', resto.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
              prox = Number(r);
            }
            yield* moveObjects(g, [{ id: prox, to: 'library', position: 'bottom' }], 'effect');
            resto = resto.filter((id) => id !== prox);
          }
        }
        // ruling 3: não é alvo; escolhe na resolução um dos Dragons que causaram o dano
        const dragoes = (c.event.dragoes as ObjId[]).filter((id) => g.state.objects[id]?.zone === 'battlefield');
        if (!dragoes.length) return;
        const esc = yield* chooseItems(g, c.you, 'Zurgo and Ojutai: você pode devolver um desses Dragons para a mão do dono', dragoes.map((id) => objItem(g, id, nameOf(g, id))), 0, 1);
        if (esc.length) yield* returnToHand(g, [Number(esc[0])]);
      }, { text: 'Sempre que um ou mais Dragons que você controla causam dano de combate a um jogador ou batalha, olhe as três cartas do topo do seu grimório. Coloque uma delas na sua mão e o resto no fundo do seu grimório em qualquer ordem. Você pode devolver um desses Dragons para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'teste: um gatilho por jogador que tomou dano de combate dos seus Dragons',
    2: 'regra geral: CR 510.4 — com iniciativa, há dois passos de dano e o gatilho pode disparar em cada um (motor/combat.ts)',
    3: 'teste: um gatilho por jogador que tomou dano de combate dos seus Dragons',
  },
});
