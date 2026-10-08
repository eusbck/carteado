// Locke, Treasure Hunter
// Locke can't be blocked by creatures with greater power.
// Mug — Whenever Locke attacks, each player mills a card. If a land card was milled this way, create a Treasure token.
// Until end of turn, you may cast a spell from among those cards.
import { allowPlay, createTokens, defineCard, isLand, mill, on, power, staticAbility, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Locke, Treasure Hunter',
  faces: [{
    abilities: [
      // ruling 5: só vale ao declarar bloqueadores
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source || power(c.g, bloqueador) <= power(c.g, atacante) },
        text: 'Locke não pode ser bloqueado por criaturas com força maior.',
      }),
      triggered(on.selfAttacks(), function* (c) {
        const moidas: ObjId[] = [];
        for (const p of c.g.apnap()) moidas.push(...(yield* mill(c.g, p, 1)));
        // ruling 2: uma ficha só, mesmo com vários terrenos
        if (moidas.some((id) => isLand(c.g, id))) yield* createTokens(c.g, c.you, 'Treasure', 1);
        // rulings 1, 3, 4, 6: uma mágica, pagando os custos e no tempo normal, mesmo sem controlar Locke
        allowPlay(c.g, c.you, c.source, moidas.filter((id) => c.g.state.objects[id]?.zone === 'graveyard'), { kind: 'endOfTurn' }, { once: true, spellsOnly: true });
      }, { text: 'Assalto — Sempre que Locke ataca, cada jogador mói uma carta. Se um card de terreno foi moído assim, crie uma ficha de Tesouro. Até o fim do turno, você pode conjurar uma mágica dentre essas cartas.' }),
    ],
  }],
  rulings: {
    1: 'teste: depois de conjurar uma, a permissão acaba',
    2: 'teste: um Tesouro só, mesmo com vários terrenos',
    3: 'regra geral: CR 601.2f — paga os custos; pode usar custo alternativo',
    4: 'regra geral: CR 603.2 — a permissão vem da resolução, não do controle de Locke',
    5: 'regra geral: CR 509.1b — restrição só ao declarar bloqueadores',
    6: 'regra geral: CR 307.1 — respeita o tempo da carta',
  },
});
