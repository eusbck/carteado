// Merchant of Truth
// Flying
// Whenever a nontoken creature you control dies, investigate.
// Clues you control have exalted. (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of
// turn for each instance of exalted among permanents you control.)
import { and, anthem, defineAbility, defineCard, exalted, investigate, is, keyword, on, triggered } from '../../motor/api.ts';

// exaltado concedido às Clues (CR 702.83): cada Clue é uma instância
const EXALTADO = defineAbility('Merchant of Truth:exaltado', exalted());

export default defineCard({
  name: 'Merchant of Truth',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: morrendo junto com outras criaturas suas, dispara para cada uma (CR 603.10a)
      triggered(on.dies((c, lki, old) => lki.controller === c.you && !old.isToken), function* (c) {
        yield* investigate(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que não é ficha que você controla morre, investigue.' }),
      anthem(and(is.subtype('Clue'), is.yours), () => [{ k: 'addAbility', id: EXALTADO.id! }], 'As Clues que você controla têm exaltado.'),
    ],
  }],
  rulings: {
    1: 'teste: morrendo junto com outras criaturas suas, dispara para cada uma',
    2: 'regra geral: CR 702.83b — só a criatura declarada sozinha como atacante (motor/mecanicas.ts exalted)',
    3: 'teste: cada Clue dá uma instância de exaltado',
    4: 'regra geral: Clue é um tipo de artefato (cartas/fichas.ts)',
    5: 'regra geral: "Clue" é qualquer artefato Clue, ficha ou não (o filtro olha o subtipo)',
    6: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    7: 'não se aplica: o investigar de Merchant of Truth não tem alvo',
    8: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma Clue',
  },
});
