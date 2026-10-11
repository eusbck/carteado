// Stranglehold
// Your opponents can't search libraries.
// If an opponent would begin an extra turn, that player skips that turn instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Stranglehold',
  faces: [{
    abilities: [
      // rulings 1-3: só "procurar" é impedido; embaralhar, olhar e revelar continuam (motor/actions.ts searchLibrary)
      staticAbility({ rules: { cantSearchLibraries: (c, p) => c.g.isOpponent(c.you, p) }, text: 'Os seus oponentes não podem procurar em grimórios.' }),
      // o jogo não tem turnos extras: a segunda habilidade não tem o que substituir
      staticAbility({ text: 'Se um oponente fosse começar um turno extra, em vez disso esse jogador pula esse turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.23 — quem não pode procurar não procura nem embaralha por um "você pode procurar" (motor/actions.ts searchLibrary)',
    2: 'teste: o oponente não encontra nada ao procurar, mas embaralha o grimório',
    3: 'regra geral: CR 701.23 — olhar ou revelar cartas do topo não é procurar (motor/actions.ts)',
    4: 'não se aplica: o motor não tem turnos extras',
    5: 'não se aplica: o motor não tem turnos extras',
  },
});