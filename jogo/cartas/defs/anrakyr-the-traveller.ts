// Anrakyr the Traveller
// Lord of the Pyrrhian Legions — Whenever Anrakyr the Traveller attacks, you may cast an artifact spell from your hand or
// graveyard by paying life equal to its mana value rather than paying its mana cost.
import { chars, chooseItems, defineCard, isLand, manaValue, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import { castSpell } from '../../motor/stack.ts';

export default defineCard({
  name: 'Anrakyr the Traveller',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        const vida = s.players[c.you].life;
        // ruling 1: só pagando a vida (custo alternativo); ruling 2: com {X} no custo, X é 0
        const cartas = [...s.zones.hand[c.you], ...s.zones.graveyard[c.you]].filter((id) => !isLand(c.g, id) && chars(c.g, id).types.includes('Artifact') && manaValue(c.g, id) <= vida);
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Anrakyr: você pode conjurar uma mágica de artefato da mão ou do cemitério pagando vida igual ao valor de mana dela', cartas.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (${manaValue(c.g, id)} de vida)`)), 0, 1);
        if (!esc.length) return;
        const id = Number(esc[0]);
        const zona = s.objects[id].zone;
        const rotulo = 'pagando vida igual ao valor de mana (Anrakyr)';
        yield* castSpell(c.g, c.you, id, {
          key: 'anrakyr', label: rotulo, zone: zona, duringResolution: true,
          alt: { key: 'anrakyr', label: rotulo, zone: zona, mana: '', parts: [{ k: 'life', n: manaValue(c.g, id) }] },
        });
      }, { text: 'Lord of the Pyrrhian Legions — Sempre que Anrakyr the Traveller ataca, você pode conjurar uma mágica de artefato da sua mão ou do seu cemitério pagando pontos de vida iguais ao valor de mana dela em vez de pagar o custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacando, conjura um artefato da mão ou do cemitério pagando vida igual ao valor de mana',
    2: 'regra geral: CR 107.3b — sem pagar o custo de mana, o X do custo só pode ser 0 (motor/stack.ts)',
  },
});