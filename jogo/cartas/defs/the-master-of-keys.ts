// The Master of Keys
// Flying
// When The Master of Keys enters, put X +1/+1 counters on it and mill twice X cards.
// Each enchantment card in your graveyard has escape. The escape cost is equal to the card's mana cost plus exile three
// other cards from your graveyard. (You may cast cards from your graveyard for their escape cost.)
import { addCounters, asEnters, chars, defineCard, etb, isType, keyword, lkiObj, mill, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'The Master of Keys',
  faces: [{
    abilities: [
      keyword('flying'),
      // o X da mágica fica guardado no permanente para o gatilho de entrar (CR 107.3m: fora da pilha, X é 0)
      asEnters(function* (_c, ev) { ev.choices.x = Number(ev.spell?.x ?? 0); }),
      etb(function* (c) {
        // ruling 5: sem ela no campo, ainda moe duas vezes X
        const x = Number(lkiObj(c.g, c.source)?.choices.x ?? 0);
        if (x <= 0) return;
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', x, c.you);
        yield* mill(c.g, c.you, 2 * x);
      }, { text: 'Quando The Master of Keys entra, coloque X marcadores +1/+1 nela e moa o dobro de X cartas.' }),
      // fuga concedida (CR 702.138): o custo de mana da carta (da porta escolhida, numa Sala) mais exilar três outras
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const o = c.g.state.objects[carta];
            if (p !== c.you || !o || o.zone !== 'graveyard' || o.owner !== p || !isType(c.g, carta, 'Enchantment')) return null;
            // ruling 6: sem custo de mana, a fuga não pode ser paga
            if (!chars(c.g, carta).manaCost) return null;
            return { key: `master-of-keys:${c.source}`, label: 'fuga (custo de mana e exilar três outras cartas do seu cemitério)', parts: [{ k: 'exileFromGraveyard', n: 3, other: true }] };
          },
        },
        text: 'Cada carta de encantamento no seu cemitério tem fuga. O custo de fuga é o custo de mana da carta mais exilar três outras cartas do seu cemitério.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: com mais de uma permissão, o jogador escolhe a ação de qual usar (motor/priority.ts castOptions)',
    2: 'regra geral: CR 118.9 — a fuga é custo alternativo: não se junta a outro; custos adicionais continuam',
    3: 'regra geral: CR 116.2, 117.3a — o jogador ativo recebe prioridade primeiro e pode conjurá-la do cemitério',
    4: 'regra geral: CR 601.2a — a carta vai para a pilha logo no começo da conjuração (motor/stack.ts)',
    5: 'teste: entra com X marcadores e moe duas vezes X; com ela fora do campo, ainda moe',
    6: 'teste: conjura o encantamento do cemitério pagando o custo de mana e exilando outras três; sem três outras, não',
    7: 'regra geral: CR 709.3 — numa Sala, escolhe-se a porta e paga-se o custo dela (motor/priority.ts opcoesDeFaces)',
    8: 'não se aplica: as cartas de encantamento do deck não têm custo adicional de descartar ou sacrificar',
    9: 'regra geral: a permissão de fuga não muda o tempo da mágica (motor/priority.ts canStartCast)',
    10: 'regra geral: CR 601.2f — o custo total parte do custo de mana; o valor de mana não muda',
    11: 'regra geral: a permanente que fugiu volta ao cemitério normalmente depois e pode fugir de novo',
  },
});
