// Helga, Skittish Seer
// Whenever you cast a creature spell with mana value 4 or greater, you draw a card, gain 1 life, and put a +1/+1
// counter on Helga.
// {T}: Add X mana of any one color, where X is Helga's power. Spend this mana only to cast creature spells with mana
// value 4 or greater or creature spells with {X} in their mana costs.
import { addCounters, chars, defineCard, defineFn, draw, gainLife, isCreature, mana, manaValue, on, power, triggered, type G } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

// CR 106.6; rulings 3-4: pode ser gasta em mais de uma mágica, e em qualquer parte do custo da mágica com {X}
const RESTRICAO = 'Helga, Skittish Seer:restricao';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined || !isCreature(g, purpose.obj)) return false;
  return manaValue(g, purpose.obj) >= 4 || (chars(g, purpose.obj).manaCost ?? []).some((s) => s.k === 'X');
});

export default defineCard({
  name: 'Helga, Skittish Seer',
  faces: [{
    abilities: [
      // ruling 1: o valor de mana na pilha conta o X escolhido
      triggered(on.youCast((c, id) => isCreature(c.g, id) && manaValue(c.g, id) >= 4), function* (c) {
        yield* draw(c.g, c.you, 1);
        gainLife(c.g, c.you, 1, c.source);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você conjura uma mágica de criatura com valor de mana 4 ou mais, você compra uma carta, ganha 1 de vida e coloca um marcador +1/+1 em Helga.' }),
      // ruling 2: habilidade de mana, sem pilha
      mana((c) => {
        const x = power(c.g, c.source);
        return x > 0 ? (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array<ManaType>(x).fill(cor)) : [];
      }, { restriction: RESTRICAO, text: '{T}: Adicione X manas de uma mesma cor, onde X é a força de Helga. Gaste essa mana só para conjurar mágicas de criatura com valor de mana 4 ou mais ou mágicas de criatura com {X} no custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — na pilha, o valor de mana conta o X escolhido (motor/chars.ts)',
    2: 'teste: a mana de Helga é X da mesma cor, só para mágica de criatura de valor 4 ou mais',
    3: 'regra geral: CR 106.6 — cada unidade de mana tem a restrição, e pode ir para mágicas diferentes (motor/costs.ts)',
    4: 'regra geral: CR 106.6 — a restrição olha a mágica, não a parte do custo (motor/costs.ts)',
  },
});
