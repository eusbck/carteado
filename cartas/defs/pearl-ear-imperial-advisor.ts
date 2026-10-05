// Pearl-Ear, Imperial Advisor
// Lifelink
// Enchantment spells you cast have affinity for Auras. (They cost {1} less to cast for each Aura you control.)
// Whenever you cast an Aura spell that targets a modified permanent you control, draw a card. (Equipment, Auras you
// control, and counters are modifications.)
import { controlledBy, controllerOf, defineCard, draw, is, isSubtype, keyword, on, staticAbility, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/** permanente modificado (CR 700.9): com marcador, Equipamento anexado ou Aura controlada pelo controlador dele */
function modificado(g: G, id: ObjId, dono: PlayerId): boolean {
  const s = g.state;
  const o = s.objects[id];
  if (!o || o.zone !== 'battlefield') return false;
  if (Object.values(o.counters).some((n) => n > 0)) return true; // ruling 3
  return s.zones.battlefield.some((a) => s.objects[a].attachedTo === id && (isSubtype(g, a, 'Equipment') || (isSubtype(g, a, 'Aura') && controllerOf(g, a) === dono))); // rulings 2, 5
}

export default defineCard({
  name: 'Pearl-Ear, Imperial Advisor',
  faces: [{
    abilities: [
      keyword('lifelink'),
      // rulings 1, 4: afinidade por Auras que você controla (onde estiverem anexadas); instâncias se somam
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Enchantment') ? { reduce: controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Aura')).length } : null) },
        text: 'As mágicas de encantamento que você conjura têm afinidade por Auras (custam {1} a menos para cada Aura que você controla).',
      }),
      // ruling 6: a Aura sendo conjurada não conta como modificação
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || e.player !== c.you || !c.g.state.objects[e.obj] || !is.subtype('Aura')(c, e.obj)) return false;
        const alvos = (c.g.state.objects[e.obj].stack?.targets ?? []).flat();
        return alvos.some((t) => t && t.kind === 'obj' && controllerOf(c.g, t.id) === c.you && modificado(c.g, t.id, c.you));
      }), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que você conjura uma mágica de Aura que tem como alvo um permanente modificado que você controla, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: a redução conta cada Aura que você controla',
    2: 'regra geral: CR 700.9 — Aura de outro jogador não modifica sua criatura',
    3: 'teste: criatura com marcador está modificada',
    4: 'regra geral: CR 702.41 — Aura sua em permanente de oponente conta para a afinidade',
    5: 'regra geral: CR 700.9 — Equipamento de qualquer controlador modifica',
    6: 'teste: criatura sem modificação não faz comprar',
  },
});
