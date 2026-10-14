// Sword of the Squeak
// Equipped creature gets +1/+1 for each creature you control with base power or toughness 1.
// Whenever a Hamster, Mouse, Rat, or Squirrel you control enters, you may attach this Equipment to that creature.
// Equip {2}
import { attach, attachedGets, chars, controlledBy, controllerOf, copiableValues, copyValuesChars, defineCard, equip, isCreature, on, triggered, yesNo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const TIPOS = ['Hamster', 'Mouse', 'Rat', 'Squirrel'];

/**
 * força e resistência base (ruling 1): as dos valores copiáveis (o impresso ou o da ficha), trocadas pelos efeitos que
 * definem força e resistência (camada 7b) em ordem de registro. Simplificação: as estáticas que definem a base (Graaz)
 * não entram na conta.
 */
function base(g: G, id: ObjId): [number | null, number | null] {
  const o = g.state.objects[id];
  const v = copyValuesChars(copiableValues(g, id), o.owner);
  let p = v.power;
  let t = v.toughness;
  for (const e of [...g.state.effects].sort((a, b) => a.timestamp - b.timestamp)) {
    if (!e.affected?.includes(id)) continue;
    for (const m of e.mods) {
      if (m.k === 'setPT') { p = m.p; t = m.t; } else if (m.k === 'setT') t = m.t;
    }
  }
  return [p, t];
}

export default defineCard({
  name: 'Sword of the Squeak',
  faces: [{
    abilities: [
      attachedGets((c) => {
        const n = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && base(c.g, id).some((x) => x === 1)).length;
        return n > 0 ? [{ k: 'pt', p: n, t: n }] : [];
      }, 'A criatura equipada recebe +1/+1 para cada criatura que você controla com força ou resistência base 1.'),
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isCreature(c.g, e.obj)
        && controllerOf(c.g, e.obj) === c.you && chars(c.g, e.obj).subtypes.some((s) => TIPOS.includes(s)) ? { criatura: e.obj } : false), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone !== 'battlefield' || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        if (yield* yesNo(c.g, c.you, `Sword of the Squeak: equipar ${chars(c.g, id).name}?`)) attach(c.g, c.source, id);
      }, { text: 'Sempre que um Hamster, Mouse, Rat ou Squirrel que você controla entra, você pode anexar este Equipamento a essa criatura.' }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: Squirrel entra e é equipado; recebe +1/+1 por criatura sua com força ou resistência base 1, inclusive ele',
    2: 'regra geral: CR 604.3 — a habilidade que define força e resistência faz parte da base (valores copiáveis)',
    3: 'regra geral: bônus que não definem força e resistência não mudam a base',
  },
});
