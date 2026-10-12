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
    1: 'regra geral: CR 702.124k — "escolha um Antecedente" é da montagem do deck: um comandante com essa habilidade e um Antecedente lendário (decks/)',
    2: SELECAO.identidade,
    3: SELECAO.comecam,
    4: 'regra geral: CR 702.124a — as habilidades de parceiro valem antes de a partida começar; perdê-las depois não muda os comandantes',
    5: SELECAO.separados,
    6: SELECAO.refere,
    7: SELECAO.controla,
    8: 'regra geral: CR 702.124k — os dois comandantes podem ter as mesmas cores; é da montagem do deck (decks/)',
    9: 'regra geral: CR 903.3 — "criatura comandante" não conta o Antecedente, a menos que ele vire criatura (cartas/defs/folk-hero.ts)',
    10: 'teste: a criatura comandante de que você é dono compra uma carta, uma vez por turno, quando você conjura mágica que compartilha tipo com ela',
  },
});