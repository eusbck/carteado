// Sunforger
// Equipped creature gets +4/+0.
// {R}{W}, Unattach this Equipment: Search your library for a red or white instant card with mana value 4 or less and
// cast that card without paying its mana cost. Then shuffle.
// Equip {3}
import { activated, attachedGets, castSpell, chars, defineCard, equip, manaValue, searchLibrary, shuffleLibrary, unattach } from '../../motor/api.ts';
import type { CostPart } from '../../motor/defs.ts';

// ruling 1: só dá para pagar com a Sunforger anexada a uma criatura
const DESANEXAR: CostPart = {
  k: 'custom', label: 'Desanexe este Equipamento',
  canPay: (c) => c.g.state.objects[c.source]?.attachedTo != null,
  *pay(c) { return unattach(c.g, c.source) ? {} : false; },
};

export default defineCard({
  name: 'Sunforger',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 4, t: 0 }], 'A criatura equipada recebe +4/+0.'),
      activated([{ k: 'mana', cost: '{R}{W}' }, DESANEXAR], function* (c) {
        const [id] = yield* searchLibrary(c.g, c.you, c.you, {
          max: 1, prompt: 'Procure uma carta de mágica instantânea vermelha ou branca com valor de mana 4 ou menos',
          filter: (x) => { const ch = chars(c.g, x); return ch.types.includes('Instant') && (ch.colors.includes('R') || ch.colors.includes('W')) && manaValue(c.g, x) <= 4; },
        });
        // rulings 2-3: sem pagar o custo de mana, sem custos alternativos; X = 0 (CR 118.9a, 107.3b)
        if (id !== undefined) yield* castSpell(c.g, c.you, id, { key: 'free', label: 'sem pagar o custo de mana', zone: 'library', free: true, duringResolution: true });
        shuffleLibrary(c.g, c.you);
      }, { text: '{R}{W}, Desanexe este Equipamento: Procure no seu grimório uma carta de mágica instantânea vermelha ou branca com valor de mana 4 ou menos e conjure-a sem pagar o custo de mana. Depois embaralhe.' }),
      equip('{3}'),
    ],
  }],
  rulings: {
    1: 'teste: sem estar anexada a uma criatura, a habilidade não pode ser ativada',
    2: 'regra geral: CR 118.9a — sem pagar o custo de mana não cabem custos alternativos; os adicionais continuam (motor/stack.ts)',
    3: 'regra geral: CR 107.3b — sem pagar o custo de mana, o X do custo só pode ser 0 (motor/stack.ts)',
  },
});
