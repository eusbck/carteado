// Tragic Arrogance
// For each player, you choose from among the permanents that player controls an artifact, a creature, an enchantment, and
// a planeswalker. Then each player sacrifices all other nonland permanents they control.
import { chooseItems, controlledBy, defineCard, isLand, isType, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const TIPOS: [string, string][] = [['Artifact', 'um artefato'], ['Creature', 'uma criatura'], ['Enchantment', 'um encantamento'], ['Planeswalker', 'um planeswalker']];

export default defineCard({
  name: 'Tragic Arrogance',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const poupados = new Set<ObjId>();
        // ruling 1: não mira; ruling 2: um permanente com vários tipos pode contar por qualquer um deles
        for (const p of c.g.apnap()) {
          for (const [tipo, rotulo] of TIPOS) {
            const cands = controlledBy(c.g, p, (id) => isType(c.g, id, tipo));
            if (!cands.length) continue;
            const [id] = cands.length === 1 ? [String(cands[0])] : yield* chooseItems(c.g, c.you, `Tragic Arrogance: escolha ${rotulo} de ${s.players[p].name} para ficar`, cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
            poupados.add(Number(id));
          }
        }
        const resto = c.g.apnap().flatMap((p) => controlledBy(c.g, p, (id) => !isLand(c.g, id) && !poupados.has(id)));
        if (resto.length) yield* sacrifice(c.g, resto);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 115.1 — a escolha não mira (resistência a magia não impede)',
    2: 'teste: uma criatura artefato pode ser o artefato e a criatura ao mesmo tempo',
  },
});
