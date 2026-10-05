// Path of Ancestry
// This land enters tapped.
// {T}: Add one mana of any color in your commander's color identity. When that mana is spent to cast a creature spell
// that shares a creature type with your commander, scry 1.
import { chars, defineAbility, defineCard, land, lookAndArrange, manaCommanderIdentity, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/** tipos de criatura atuais dos seus comandantes, onde estiverem (ruling 7) */
function tiposDosComandantes(g: G, p: PlayerId): Set<string> {
  const s = g.state;
  const out = new Set<string>();
  for (const cid of s.players[p].commanders) {
    const o = Object.values(s.objects).find((x) => x.card === cid && !x.isCopy);
    if (o) for (const st of chars(g, o.id).subtypes) out.add(st);
  }
  return out;
}

const VIDENCIA = defineAbility('Path of Ancestry:videncia', triggered({ kind: 'batch', match: () => false }, function* (c) {
  yield* lookAndArrange(c.g, c.you, 1, 'scry');
}, {
  // rulings 2, 4, 6: mágica de criatura que compartilha um tipo de criatura com um dos seus comandantes
  condition: (c) => {
    const spell = c.event.spell as ObjId;
    const o = c.g.state.objects[spell] ?? c.g.state.lki[spell]?.obj;
    if (!o) return false;
    const ch = c.g.state.objects[spell] ? chars(c.g, spell) : c.g.state.lki[spell].chars;
    if (!ch.types.includes('Creature')) return false;
    const tipos = tiposDosComandantes(c.g, c.you);
    return ch.subtypes.some((st) => tipos.has(st));
  },
  text: 'Quando essa mana é gasta para conjurar uma mágica de criatura que compartilha um tipo de criatura com seu comandante, vidência 1.',
}));

export default defineCard({
  name: 'Path of Ancestry',
  faces: [{
    abilities: [
      land.tapped(),
      // rulings 1, 5: sem comandante ou identidade incolor, não produz mana
      manaCommanderIdentity({ onSpend: VIDENCIA.id!, text: '{T}: Adicione uma mana de qualquer cor da identidade de cor do seu comandante. Quando essa mana for gasta numa mágica de criatura que compartilha um tipo de criatura com seu comandante, vidência 1.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 903.4f — sem comandante, nenhuma mana',
    2: 'teste: conjurar uma criatura que compartilha tipo faz vidência 1',
    3: 'regra geral: cada mana gasta dispara separadamente',
    4: 'teste: criatura sem tipo em comum não faz vidência',
    5: 'regra geral: CR 903.4f — identidade incolor não produz {C}',
    6: 'regra geral: dois comandantes somam identidades e tipos',
    7: 'regra geral: os tipos do comandante são vistos na hora, onde ele estiver',
  },
});
