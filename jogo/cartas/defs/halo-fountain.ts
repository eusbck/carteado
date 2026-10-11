// Halo Fountain
// {W}, {T}, Untap a tapped creature you control: Create a 1/1 green and white Citizen creature token.
// {W}{W}, {T}, Untap two tapped creatures you control: Draw a card.
// {W}{W}{W}{W}{W}, {T}, Untap fifteen tapped creatures you control: You win the game.
import { activated, createTokens, defineCard, draw, winGame } from '../../motor/api.ts';
import type { CostPart } from '../../motor/defs.ts';

// ruling 1: desvirar as criaturas é custo
const custo = (mana: string, n: number): CostPart[] => [{ k: 'mana', cost: mana }, { k: 'tap' }, { k: 'untapCreatures', n }];

export default defineCard({
  name: 'Halo Fountain',
  faces: [{
    abilities: [
      activated(custo('{W}', 1), function* (c) { yield* createTokens(c.g, c.you, 'Citizen', 1); }, { text: '{W}, {T}, Desvire uma criatura virada que você controla: Crie uma ficha de criatura Citizen 1/1 verde e branca.' }),
      activated(custo('{W}{W}', 2), function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{W}{W}, {T}, Desvire duas criaturas viradas que você controla: Compre uma carta.' }),
      activated(custo('{W}{W}{W}{W}{W}', 15), function* (c) { winGame(c.g, c.you, 'Halo Fountain'); }, { text: '{W}{W}{W}{W}{W}, {T}, Desvire quinze criaturas viradas que você controla: Você vence o jogo.' }),
    ],
  }],
  rulings: {
    1: 'teste: {W}, {T}, desvire uma criatura virada: cria um Citizen 1/1 verde e branco',
    2: 'regra geral: CR 601.2g — as habilidades de mana são ativadas antes de pagar os custos: a criatura virada para mana pode ser a desvirada (motor/costs.ts)',
  },
});