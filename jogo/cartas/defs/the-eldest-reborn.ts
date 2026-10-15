// The Eldest Reborn
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — Each opponent sacrifices a creature or planeswalker of their choice.
// II — Each opponent discards a card.
// III — Put target creature or planeswalker card from a graveyard onto the battlefield under your control.
import { chapter, chooseItems, defineCard, eachSacrifices, isCreature, isType, moveObjects, nameOf, putOntoBattlefield, sagaEnters, t, tgt } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'The Eldest Reborn',
  faces: [{
    abilities: [
      sagaEnters(),
      // ruling 1: cada oponente escolhe na ordem dos turnos e as escolhidas são sacrificadas ao mesmo tempo
      chapter([1], function* (c) {
        yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'), 1, 'uma criatura ou planeswalker');
      }, { text: 'I — Cada oponente sacrifica uma criatura ou planeswalker à escolha dele.' }),
      // ruling 2: cada oponente escolhe uma carta da mão sem revelar, e todas são descartadas ao mesmo tempo
      chapter([2], function* (c) {
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const mao = c.g.state.zones.hand[p];
          if (mao.length === 0) continue;
          if (mao.length === 1) { escolhidas.push(mao[0]); continue; }
          const [r] = yield* chooseItems(c.g, p, 'Descarte uma carta', mao.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: c.g.state.objects[id].def } })), 1, 1);
          escolhidas.push(Number(r));
        }
        if (escolhidas.length) yield* moveObjects(c.g, escolhidas.map((id) => ({ id, to: 'graveyard' as const })), 'discard');
      }, { text: 'II — Cada oponente descarta uma carta.' }),
      chapter([3], function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'), 'carta de criatura ou planeswalker alvo de um cemitério', 'any')],
        text: 'III — Coloque no campo sob o seu controle a carta de criatura ou planeswalker alvo de um cemitério.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: I: cada oponente sacrifica uma criatura ou planeswalker à escolha dele',
    2: 'teste: II: cada oponente descarta uma carta à escolha dele, todas ao mesmo tempo',
    3: 'regra geral: CR 800.4a — o jogador que sai leva o que é dele; o que você controla dele sai do jogo (motor)',
    4: 'regra geral: CR 714.3a-b — marcador de saber ao entrar e depois da etapa de compra (motor/mecanicas.ts sagaEnters)',
    5: 'regra geral: CR 714.2b — capítulo dispara quando os marcadores chegam ao número dele (motor/mecanicas.ts chapter)',
    6: 'regra geral: CR 714.2c — capítulos já passados não disparam de novo (motor/mecanicas.ts chapter)',
    7: 'regra geral: CR 714.2 — a habilidade na pilha não depende mais da Saga',
    8: 'regra geral: CR 603.3b — com vários capítulos juntos, o controlador escolhe a ordem',
    9: 'regra geral: CR 714.2b — remover marcadores e pôr de novo dispara outra vez (motor/mecanicas.ts chapter)',
    10: 'teste: III: põe a criatura do cemitério de um oponente no campo sob o seu controle e a Saga é sacrificada',
  },
});
