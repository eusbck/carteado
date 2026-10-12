// Folk Hero
// Commander creatures you own have "Whenever you cast a spell that shares a creature type with this creature, draw a
// card. This ability triggers only once each turn."
import { and, anthem, chars, defineAbility, defineCard, draw, is, on, triggered } from '../../motor/api.ts';
import { SELECAO } from '../tartarugas.ts';
import { ehSeuComandante } from '../vingadores.ts';

const COMPRA = defineAbility('Folk Hero:compra', triggered(on.youCast((c, id) => {
  const meus = chars(c.g, c.source).subtypes;
  return chars(c.g, id).subtypes.some((s) => meus.includes(s));
}), function* (c) { yield* draw(c.g, c.you, 1); }, {
  oncePerTurn: true,
  text: 'Sempre que você conjura uma mágica que compartilha um tipo de criatura com esta criatura, compre uma carta. Esta habilidade dispara apenas uma vez por turno.',
}));

export default defineCard({
  name: 'Folk Hero',
  faces: [{
    abilities: [
      // rulings 9 e 10: cada comandante de que você é dono e que é criatura no campo ganha a habilidade
      anthem(and(is.creature, (c, id) => ehSeuComandante(c.g, id, c.you)), () => [{ k: 'addAbility', id: COMPRA.id! }],
        'As criaturas comandantes de que você é dono têm "Sempre que você conjura uma mágica que compartilha um tipo de criatura com esta criatura, compre uma carta. Esta habilidade dispara apenas uma vez por turno."'),
    ],
  }],
  rulings: {
    1: 'não se aplica: é da montagem do deck, e dois comandantes ainda não existem neste jogo (o importador recusa; ver PROGRESSO, "dois comandantes")',
    2: SELECAO.identidade,
    3: SELECAO.comecam,
    4: 'não se aplica: as habilidades de parceiro só valem na montagem do deck, antes de a partida começar (CR 702.124a)',
    5: SELECAO.separados,
    6: SELECAO.refere,
    7: SELECAO.controla,
    8: 'não se aplica: é da montagem do deck, e dois comandantes ainda não existem neste jogo (o importador recusa; ver PROGRESSO, "dois comandantes")',
    9: 'regra geral: CR 903.3 — "criatura comandante" não conta o Antecedente, a menos que ele vire criatura (cartas/defs/folk-hero.ts)',
    10: 'teste: a criatura comandante de que você é dono compra uma carta, uma vez por turno, quando você conjura mágica que compartilha tipo com ela',
  },
});