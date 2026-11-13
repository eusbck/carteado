// Fear of Impostors
// Flash
// When this creature enters, counter target spell. Its controller manifests dread. (That player looks at the top two
// cards of their library, then puts one onto the battlefield face down as a 2/2 creature and the other into their
// graveyard. If it's a creature card, it can be turned face up any time for its mana cost.)
import { counter, defineCard, etb, keyword, manifestDread, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Fear of Impostors',
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = c.g.state.objects[id]?.stack?.controller;
        yield* counter(c.g, id);
        // ruling 1: mesmo que a mágica não possa ser anulada, quem a controla manifesta o pavor (CR 701.62, motor/controle.ts)
        if (quem !== undefined) yield* manifestDread(c.g, quem);
      }, { targets: [t.spell()], text: 'Quando esta criatura entra, anule a mágica alvo. Quem a controla manifesta o pavor.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mágica que não pode ser anulada continua, mas quem a controla manifesta o pavor',
    2: 'teste: quem controlava a mágica manifesta uma das duas do topo e põe a outra no cemitério',
    3: 'regra geral: CR 701.40a, 116.2b — virar para cima pagando o custo de mana é ação especial (motor/mecanicas.ts turnFaceUp)',
    4: 'não se aplica: nenhuma carta dos decks com disfarce ou metamorfose é manifestada por estas cartas',
    5: 'regra geral: CR 701.40a — a manifestada que é carta de criatura vira para cima mesmo sem habilidades (motor/mecanicas.ts manifestFaceUpCost)',
    6: 'regra geral: CR 701.40b — carta de duas faces manifestada vira com a frente para cima (motor/mecanicas.ts)',
    7: 'regra geral: CR 701.62a — com uma carta só no grimório, ela é manifestada; sem cartas, nada (testes/regras-controle-pilha.test.ts)',
    8: 'regra geral: CR 701.62b — o evento de manifestar o pavor acontece mesmo com passos impossíveis (motor/controle.ts)',
    9: 'regra geral: CR 708.6 — só o controlador vê a permanente virada para baixo (motor/view.ts)',
    10: 'regra geral: CR 708.2 — virada para baixo, sem habilidades, não vira com disfarce ou metamorfose (motor/conjurar-alternativo.ts)',
    11: 'regra geral: CR 708.8 — virar para cima não é entrar no campo (motor/mecanicas.ts turnFaceUp)',
    12: 'regra geral: CR 708.2 — virada para baixo não tem nome (motor/chars.ts)',
    13: 'regra geral: CR 708.8 — é o mesmo permanente; alvos e anexos continuam (motor/mecanicas.ts turnFaceUp)',
    14: 'regra geral: CR 708.8 — virar para cima não muda se está virada ou desvirada',
    15: 'regra geral: CR 708.9 — a carta virada para baixo é revelada ao sair do campo (motor/view.ts)',
    16: 'não se aplica: a mesa mostra cada permanente virada para baixo separada, na ordem em que entrou',
    17: 'regra geral: CR 701.40a — instantânea ou feitiço manifestado não vira para cima (motor/mecanicas.ts manifestFaceUpCost)',
  },
});
