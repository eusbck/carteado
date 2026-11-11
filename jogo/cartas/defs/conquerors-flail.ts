// Conqueror's Flail
// Equipped creature gets +1/+1 for each color among permanents you control.
// As long as this Equipment is attached to a creature, your opponents can't cast spells during your turn.
// Equip {2}
import { attachedGets, chars, defineCard, equip, staticAbility } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

function cores(c: SCtx): number {
  // durante o cálculo das camadas, lê as características parciais (cor: camada 5) em vez de recalcular
  const set = new Set<string>();
  for (const id of c.g.state.zones.battlefield) {
    const ch = c.g.computing?.get(id) ?? chars(c.g, id);
    if (ch.controller === c.you) for (const col of ch.colors) set.add(col);
  }
  return set.size;
}

export default defineCard({
  name: "Conqueror's Flail",
  faces: [{
    abilities: [
      attachedGets((c) => { const n = cores(c); return [{ k: 'pt', p: n, t: n }]; }, 'A criatura equipada recebe +1/+1 para cada cor entre as permanentes que você controla.'),
      staticAbility({
        rules: { cantCastSpells: (c, p) => c.g.isOpponent(c.you, p) && c.g.state.turn.active === c.you && c.g.state.objects[c.source]?.attachedTo != null },
        text: 'Enquanto este Equipamento estiver anexado a uma criatura, seus oponentes não podem conjurar mágicas durante o seu turno.',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: conta as cores (no máximo cinco) das permanentes que você controla',
    2: 'regra geral: CR 701.3 — trocar de criatura com equipar não deixa uma janela sem anexo (motor/actions.ts attach)',
    3: 'regra geral: CR 704.5g — o bônus é recalculado o tempo todo; dano marcado pode matar quando ele cai (motor/sba.ts)',
  },
});
