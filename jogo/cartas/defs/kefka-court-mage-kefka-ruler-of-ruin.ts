// Kefka, Court Mage // Kefka, Ruler of Ruin
// Whenever Kefka enters or attacks, each player discards a card. Then you draw a card for each card type among cards
// discarded this way.
// {8}: Each opponent sacrifices a permanent of their choice. Transform Kefka. Activate only as a sorcery.
// //
// Flying
// Whenever an opponent loses life during your turn, you draw that many cards.
import { activated, chars, defineCard, discard, draw, eachSacrifices, keyword, on, transformFrom, triggered } from '../../motor/api.ts';
import type { Ctx } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

const TIPOS = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Instant', 'Kindred', 'Land', 'Planeswalker', 'Sorcery'];

function* cadaUmDescarta(c: Ctx) {
  const g = c.g;
  const descartadas: ObjId[] = [];
  // CR 101.4: cada jogador escolhe em ordem APNAP
  for (const p of g.apnap()) if (!g.state.players[p].left) descartadas.push(...(yield* discard(g, p, 1)));
  // ruling 1: tipos de carta (supertipos e subtipos não contam), pela informação das cartas descartadas
  const tipos = new Set<string>();
  for (const id of descartadas) for (const t of (g.state.objects[id] ? chars(g, id) : g.state.lki[id]?.chars)?.types ?? []) if (TIPOS.includes(t)) tipos.add(t);
  if (tipos.size) yield* draw(g, c.you, tipos.size);
}

const TEXTO = 'Sempre que Kefka entra ou ataca, cada jogador descarta uma carta. Depois você compra uma carta para cada tipo de carta entre as cartas descartadas assim.';

export default defineCard({
  name: 'Kefka, Court Mage // Kefka, Ruler of Ruin',
  faces: [
    {
      abilities: [
        triggered(on.selfEnters(), cadaUmDescarta, { text: TEXTO }),
        triggered(on.selfAttacks(), cadaUmDescarta, { text: TEXTO }),
        activated('{8}', function* (c) {
          // ruling 8: cada oponente escolhe na ordem de turno; os escolhidos são sacrificados juntos
          yield* eachSacrifices(c, c.g.opponents(c.you), () => true, 1, 'um permanente');
          transformFrom(c.g, c.source, 0);
        }, { timing: 'sorcery', text: '{8}: Cada oponente sacrifica um permanente à escolha dele. Transforme Kefka. Ative somente como um feitiço.' }),
      ],
    },
    {
      abilities: [
        keyword('flying'),
        triggered(on.custom((e, c) => (e.type === 'lifeLoss' && c.g.isOpponent(c.you, e.player) && c.g.state.turn.active === c.you && e.amount > 0 ? { n: e.amount, quem: e.player as PlayerId } : false)), function* (c) {
          yield* draw(c.g, c.you, c.event.n as number);
        }, { text: 'Sempre que um oponente perde vida durante o seu turno, você compra essa quantidade de cartas.' }),
      ],
    },
  ],
  rulings: {
    1: 'teste: compra uma carta para cada tipo de carta entre as descartadas',
    2: 'regra geral: CR 712.8 — o valor de mana é o da frente, qualquer que seja a face para cima (motor/chars.ts)',
    3: 'regra geral: CR 204 — o verso tem indicador de cor (motor/oracle.ts)',
    4: 'regra geral: CR 903.4 — a identidade de cor soma as duas faces (motor/oracle.ts)',
    5: 'regra geral: CR 712.8 — fora do campo só vale a frente (motor/chars.ts)',
    6: 'não se aplica: nenhuma carta dos decks põe Kefka no campo transformado',
    7: 'teste: {8} faz cada oponente sacrificar um permanente e Kefka transforma; no verso, perder vida no seu turno compra cartas',
    8: 'teste: {8} faz cada oponente sacrificar um permanente e Kefka transforma; no verso, perder vida no seu turno compra cartas',
    9: 'regra geral: CR 712.14 — entra com a frente para cima (motor/actions.ts)',
    10: 'regra geral: CR 707.8 — a ficha que copia uma carta de duas faces tem as duas faces (motor/criaturas.ts)',
  },
});
