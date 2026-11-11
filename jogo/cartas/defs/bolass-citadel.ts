// Bolas's Citadel
// You may look at the top card of your library any time.
// You may play lands and cast spells from the top of your library. If you cast a spell this way, pay life equal to its
// mana value rather than pay its mana cost.
// {T}, Sacrifice ten nonland permanents: Each opponent loses 10 life.
import { activated, defineCard, isLand, loseLife, manaValue, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Bolas's Citadel",
  faces: [{
    abilities: [
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta) return null;
            if (isLand(c.g, carta)) return { key: `citadel-terreno:${c.source}`, label: "jogar do topo do grimório (Bolas's Citadel)", land: true };
            // CR 118.9: custo alternativo; X é 0 (ruling)
            const vm = manaValue(c.g, carta);
            return { key: `citadel:${c.source}`, label: `conjurar do topo pagando ${vm} de vida (Bolas's Citadel)`, free: true, parts: [{ k: 'life', n: vm }] };
          },
        },
        text: 'Você pode jogar terrenos e conjurar mágicas do topo do seu grimório. Se conjurar uma mágica assim, pague vida igual ao valor de mana dela em vez do custo de mana.',
      }),
      activated([{ k: 'tap' }, { k: 'sacrifice', n: 10, filter: (c, id) => !isLand(c.g, id), label: 'dez permanentes que não sejam terrenos' }], function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 10, c.source);
      }, { text: '{T}, Sacrifique dez permanentes que não sejam terrenos: Cada oponente perde 10 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 118.9 — pagar vida é custo alternativo: não dá para combinar com outro (como evocar)',
    2: 'regra geral: CR 107.3 — com {X} no custo, X é 0',
    3: 'regra geral: CR 119.4 — só paga a vida que tem',
    4: 'regra geral: CR 601.2 — o tempo continua o normal (feitiço só na sua fase principal)',
    5: 'regra geral: CR 118.9a — custos adicionais ainda são pagos',
    6: 'regra geral: CR 305.2 — jogar terreno do topo conta para o limite do turno',
  },
});
