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
      // CR 614.10: o turno extra do oponente é pulado quando começaria (motor/turn.ts)
      staticAbility({ rules: { skipsExtraTurn: (c, p) => c.g.isOpponent(c.you, p) }, text: 'Se um oponente fosse começar um turno extra, em vez disso esse jogador pula esse turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.23 — quem não pode procurar não procura nem embaralha por um "você pode procurar" (motor/actions.ts searchLibrary)',
    2: 'teste: o oponente não encontra nada ao procurar, mas embaralha o grimório',
    3: 'regra geral: CR 701.23 — olhar ou revelar cartas do topo não é procurar (motor/actions.ts)',
    4: 'regra geral: CR 500.7 — turno extra é o criado por mágica ou habilidade (motor/cedh.ts takeExtraTurn)',
    5: 'teste: CR 614.10: com Stranglehold de um oponente no campo, o turno extra é pulado quando começaria (ruling 5) (testes/regras-turno-extra.test.ts)',
  },
});