// Shadowgrange Archfiend
// When this creature enters, each opponent sacrifices a creature with the greatest power among creatures they control.
// You gain life equal to the greatest power among creatures sacrificed this way.
// Madness—{2}{B}, Pay 8 life. (If you discard this card, discard it into exile. When you do, cast it for its madness
// cost or put it into your graveyard.)
import { chooseItems, creaturesOf, defineCard, etb, gainLife, madness, nameOf, objItem, power, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Shadowgrange Archfiend',
  faces: [{
    abilities: [
      etb(function* (c) {
        const g = c.g;
        const escolhidas: ObjId[] = [];
        let maior = 0;
        // CR 101.4: os oponentes escolhem em ordem de turno e sacrificam ao mesmo tempo
        for (const p of g.apnap().filter((x) => g.isOpponent(c.you, x))) {
          const criaturas = creaturesOf(g, p);
          if (!criaturas.length) continue;
          const forca = Math.max(...criaturas.map((id) => power(g, id)));
          const empatadas = criaturas.filter((id) => power(g, id) === forca);
          // ruling 10: no empate, o próprio jogador escolhe qual sacrificar
          const [esc] = empatadas.length === 1 ? [String(empatadas[0])] : yield* chooseItems(g, p, 'Shadowgrange Archfiend: sacrifique uma criatura com a maior força entre as suas', empatadas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          escolhidas.push(Number(esc));
          maior = Math.max(maior, forca);
        }
        if (!escolhidas.length) return;
        const forcas = new Map(escolhidas.map((id) => [id, power(g, id)]));
        const sacrificadas = yield* sacrifice(g, escolhidas);
        // conta só as que foram mesmo sacrificadas (a força é a que tinham no campo)
        const ganho = Math.max(0, ...escolhidas.filter((_, i) => sacrificadas[i] !== null && sacrificadas[i] !== undefined).map((id) => forcas.get(id) ?? 0));
        if (ganho > 0) gainLife(g, c.you, ganho, c.source);
      }, { text: 'Quando esta criatura entra, cada oponente sacrifica uma criatura com a maior força entre as criaturas que controla. Você ganha vida igual à maior força entre as criaturas sacrificadas assim.' }),
      // CR 702.35: custo de loucura com vida ({2}{B} e pagar 8 de vida)
      madness('{2}{B}', { life: 8 }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.35a — descartada durante uma resolução, vai para o exílio e o gatilho vem depois (testes/regras-conjurar.test.ts)',
    2: 'regra geral: CR 701.9a — só se descarta da mão (motor/actions.ts)',
    3: 'regra geral: CR 702.35a — vale para qualquer descarte (motor/actions.ts moveObjects)',
    4: 'regra geral: CR 702.35a — continua sendo descarte (testes/regras-conjurar.test.ts)',
    5: 'teste: conjurada pela loucura no turno de outro jogador, paga {2}{B} e 8 de vida',
    6: 'teste: conjurada pela loucura no turno de outro jogador, paga {2}{B} e 8 de vida',
    7: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    8: 'teste: sem conjurar, vai para o cemitério',
    9: 'regra geral: CR 603.3 — o gatilho da loucura vai para a pilha acima da mágica paga com o descarte (testes/regras-conjurar.test.ts)',
    10: 'teste: no empate de força, o oponente escolhe qual sacrificar',
  },
});
