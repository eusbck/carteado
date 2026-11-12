// Jaheira, Friend of the Forest
// Tokens you control have "{T}: Add {G}."
// Choose a Background (You can have a Background as a second commander.)
import { and, anthem, defineAbility, defineCard, is, keyword, mana } from '../../motor/api.ts';

// a habilidade concedida às fichas (CR 613.1f, camada 6)
const VERDE = defineAbility('Jaheira, Friend of the Forest:fichas', mana('G', { text: '{T}: Adicione {G}.' }));

export default defineCard({
  name: 'Jaheira, Friend of the Forest',
  faces: [{
    abilities: [
      // ruling 1: todas as fichas, não só as de criatura
      anthem(and(is.token, is.yours), () => [{ k: 'addAbility', id: VERDE.id! }], 'Fichas que você controla têm "{T}: Adicione {G}."'),
      // CR 702.124k: escolher um Antecedente vale na montagem do deck (motor/deck.ts lê o Oracle)
      keyword('choose a background'),
    ],
  }],
  rulings: {
    1: 'teste: todas as fichas, não só as de criatura, ganham "{T}: Adicione {G}"',
    2: 'teste: CR 302.6: a ficha de criatura que acabou de entrar não pode virar para a mana; a de artefato pode',
    3: 'regra geral: CR 702.124k — dupla com um Antecedente na montagem do deck (motor/deck.ts)',
    4: 'regra geral: CR 903.4 — identidade de cor somada dos dois comandantes (motor/deck.ts)',
    5: 'regra geral: CR 903.6 — os dois comandantes começam na zona de comando (motor/deck.ts, motor/state.ts)',
    6: 'regra geral: CR 903.3 — continua comandante mesmo perdendo a habilidade (o motor marca os comandantes no início)',
    7: 'regra geral: CR 903.8, 903.10a — imposto e dano de comandante contados por comandante (motor/state.ts)',
    8: 'regra geral: CR 903.3c — "seu comandante" com dois: um deles, à sua escolha',
    9: 'regra geral: CR 903.3c — controlar um dos dois basta (cartas/wakanda.ts controlaComandante)',
    10: 'regra geral: CR 903.4 — os dois podem ter as mesmas cores (motor/deck.ts)',
    11: 'não se aplica: nenhum Antecedente nos decks do jogo',
    12: 'não se aplica: nenhum Antecedente nos decks do jogo',
  },
});
