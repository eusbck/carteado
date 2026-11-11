// Dracogenesis
// You may cast Dragon spells without paying their mana costs.
import { chars, defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Dracogenesis',
  faces: [{
    abilities: [
      // CR 118.9: sem pagar o custo de mana (X = 0, ruling 3; custos adicionais continuam, ruling 2); o momento de
      // conjurar não muda (ruling 1). Vale da mão e da zona de comando (com o imposto de comandante, CR 903.8)
      staticAbility({
        rules: {
          mayPlayFrom: (c, jogador, carta) => {
            const o = c.g.state.objects[carta];
            if (jogador !== c.you || !o || o.owner !== jogador || (o.zone !== 'hand' && o.zone !== 'command')) return null;
            const ch = chars(c.g, carta);
            if (ch.types.includes('Land') || !ch.subtypes.includes('Dragon')) return null;
            return { key: 'dracogenesis', label: 'Conjurar sem pagar o custo de mana (Dracogenesis)', free: true, fromHand: true, fromCommand: true };
          },
        },
        text: 'Você pode conjurar mágicas de Dragon sem pagar os custos de mana delas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o momento de conjurar continua o normal',
    2: 'regra geral: CR 118.9 — sem pagar o custo de mana, os custos adicionais continuam (motor/stack.ts)',
    3: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    4: 'não se aplica: é sobre quando se recebe a prioridade, sem efeito no jogo',
  },
});
