// One with the Multiverse
// You may look at the top card of your library any time.
// You may play lands and cast spells from the top of your library.
// Once during each of your turns, you may cast a spell from your hand or the top of your library without paying its
// mana cost.
import { defineCard, isLand, staticAbility } from '../../motor/api.ts';

const CHAVE = 'One with the Multiverse:gratis';

export default defineCard({
  name: 'One with the Multiverse',
  faces: [{
    abilities: [
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      // ruling 1: tempo e custos normais; só a zona muda
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => (p === c.you && c.g.state.zones.library[p][0] === carta
            ? { key: `owtm:${c.source}`, label: 'jogar do topo do grimório', land: true }
            : null),
        },
        text: 'Você pode jogar terrenos e conjurar mágicas do topo do seu grimório.',
      }),
      // rulings 2, 4, 5: sem pagar o custo de mana, uma vez em cada um dos seus turnos, por One with the Multiverse
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const fonte = s.objects[c.source];
            if (p !== c.you || s.turn.active !== p || !fonte || fonte.usedThisTurn[CHAVE] === s.turn.number) return null;
            const o = s.objects[carta];
            if (!o || isLand(c.g, carta) || o.owner !== p) return null;
            if (!(o.zone === 'hand' || (o.zone === 'library' && s.zones.library[p][0] === carta))) return null;
            const id = c.source;
            return {
              key: `owtm-gratis:${id}`, label: 'sem pagar o custo de mana (One with the Multiverse)', free: true, fromHand: true,
              onUse: (cc) => { const x = cc.g.state.objects[id]; if (x) { x.usedThisTurn[CHAVE] = cc.g.state.turn.number; cc.g.bump(); } },
            };
          },
        },
        text: 'Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica da sua mão ou do topo do seu grimório sem pagar o custo de mana dela.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: joga o terreno do topo e conjura a mágica do topo pagando o custo dela',
    2: 'regra geral: CR 118.9 — sem pagar o custo de mana não se junta a outro custo alternativo; X vale 0 (motor/stack.ts)',
    3: 'não se aplica: nenhuma carta dos decks tem protótipo',
    4: 'teste: conjura uma mágica da mão sem pagar, uma vez por turno; a segunda tem de ser paga',
    5: 'regra geral: cada One with the Multiverse marca o próprio uso (GameObject.usedThisTurn) e um objeto novo começa sem uso',
  },
});
