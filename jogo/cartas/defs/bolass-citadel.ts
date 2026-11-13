// Bolas's Citadel
// You may look at the top card of your library any time.
// You may play lands and cast spells from the top of your library. If you cast a spell this way, pay life equal to
// its mana value rather than pay its mana cost.
// {T}, Sacrifice ten nonland permanents: Each opponent loses 10 life.
import { activated, defineCard, is, isLand, loseLife, manaValue, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Bolas's Citadel",
  faces: [{
    abilities: [
      // rulings 1-2: olhar o topo não usa a pilha (motor/view.ts lookAtTopOfLibrary)
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          // ruling 3: o tempo normal de cada carta; ruling 4: terreno só com jogada de terreno sobrando
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta) return null;
            if (isLand(c.g, carta)) return { key: `citadel-terreno:${c.source}`, label: 'jogar do topo do grimório (Bolas\'s Citadel)', land: true };
            // rulings 5-6: vida igual ao valor de mana em vez do custo de mana (X = 0; custos adicionais continuam)
            const mv = manaValue(c.g, carta);
            return { key: `citadel:${c.source}`, label: `conjurar do topo do grimório pagando ${mv} de vida (Bolas's Citadel)`, free: true, parts: mv > 0 ? [{ k: 'life', n: mv }] : [] };
          },
        },
        text: 'Você pode jogar terrenos e conjurar mágicas do topo do seu grimório. Se conjurar uma mágica assim, pague vida igual ao valor de mana dela em vez de pagar o custo de mana.',
      }),
      // ruling 7: a própria Citadel pode ser uma das sacrificadas
      activated([{ k: 'tap' }, { k: 'sacrifice', n: 10, filter: is.nonland, label: 'dez permanentes que não são terrenos' }], function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 10, c.source);
      }, { text: '{T}, Sacrifique dez permanentes que não são terrenos: Cada oponente perde 10 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 401.5 — olhar o topo não usa a pilha (motor/view.ts lookAtTopOfLibrary)',
    2: 'regra geral: CR 401.5 — o topo novo só é visto depois de terminar a jogada (motor/view.ts)',
    3: 'teste: conjura a mágica do topo do grimório pagando vida igual ao valor de mana',
    4: 'teste: joga o terreno do topo do grimório como a jogada do turno',
    5: 'regra geral: CR 107.3b — sem pagar o custo de mana, X é 0 (motor/stack.ts)',
    6: 'regra geral: CR 118.9 — custos adicionais continuam (motor/stack.ts)',
    7: 'teste: sacrificando dez permanentes, inclusive a Citadel, cada oponente perde 10 de vida',
    8: 'não se aplica: Gigante de Duas Cabeças não é jogado aqui',
  },
});
