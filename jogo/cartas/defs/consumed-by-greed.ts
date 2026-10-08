// Consumed by Greed
// Gift a card (You may promise an opponent a gift as you cast this spell. If you do, they draw a card before its
// other effects.)
// Target opponent sacrifices a creature with the greatest power among creatures they control. If the gift was
// promised, return target creature card from your graveyard to your hand.
import { chooseItems, creaturesOf, defineCard, giftCard, is, moveObject, nameOf, objItem, power, sacrifice, t, tgt, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Consumed by Greed',
  faces: [{
    // CR 702.174: o oponente do presente é escolhido ao conjurar e compra antes dos outros efeitos
    gift: giftCard(),
    spell: {
      targets: [
        t.opponent(),
        // só com o presente prometido (CR 702.174m, ruling 8)
        { ...t.card('graveyard', is.creature, 'carta de criatura do seu cemitério', 'you'), gift: true },
      ],
      *effect(c) {
        const op = tgtPlayer(c, 0);
        if (op !== null) {
          const criaturas = creaturesOf(c.g, op);
          if (criaturas.length) {
            const maior = Math.max(...criaturas.map((id) => power(c.g, id)));
            const empatadas = criaturas.filter((id) => power(c.g, id) === maior);
            // ruling 1: no empate, quem sacrifica escolhe
            let escolhida = empatadas[0];
            if (empatadas.length > 1) {
              const [id] = yield* chooseItems(c.g, op, 'Consumed by Greed: sacrifique uma das suas criaturas de maior força', empatadas.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
              escolhida = Number(id);
            }
            yield* sacrifice(c.g, [escolhida]);
          }
        }
        if (c.paid.gift) {
          const carta = tgt(c, 1);
          if (carta !== null) yield* moveObject(c.g, carta, 'hand', 'effect');
        }
      },
    },
  }],
  rulings: {
    1: 'teste: no empate de maior força, o oponente escolhe qual sacrificar',
    2: 'teste: o oponente do presente é escolhido ao conjurar e pode ser outro que não o alvo',
    3: 'não se aplica: Consumed by Greed é instantânea (presente de permanente dispara ao entrar)',
    4: 'teste: o presenteado compra antes de o alvo sacrificar',
    5: 'teste: anulada, o presente não é dado',
    6: 'regra geral: o presente é uma escolha só ao conjurar (motor/stack.ts, CR 702.174a)',
    7: 'regra geral: CR 707.10 — a cópia leva o que foi pago e o oponente escolhido (copySpell copia paid e data)',
    8: 'teste: sem o presente, não se escolhe o alvo do cemitério',
    9: 'não se aplica: os outros tipos de presente não estão nos decks',
  },
});
