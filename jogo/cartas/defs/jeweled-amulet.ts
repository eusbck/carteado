// Jeweled Amulet
// {1}, {T}: Put a charge counter on this artifact. Note the type of mana spent to pay this activation cost. Activate
// only if there are no charge counters on this artifact.
// {T}, Remove a charge counter from this artifact: Add one mana of this artifact's last noted type.
import { activated, addCounters, defineCard, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Jeweled Amulet',
  faces: [{
    abilities: [
      activated('{1}, {T}', function* (c) {
        addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, {
        condition: (c) => (c.g.state.objects[c.source]?.counters.charge ?? 0) === 0,
        // o tipo é anotado ao pagar o custo (CR 602.2h), mesmo que a habilidade não resolva
        onManaPaid: (c, tipos) => { const o = c.g.state.objects[c.source]; if (o && tipos[0]) { o.data.tipoAnotado = tipos[0]; c.g.bump(); } },
        text: '{1}, {T}: Coloque um marcador de carga neste artefato. Anote o tipo de mana gasto para pagar este custo de ativação. Ative somente se não houver marcadores de carga neste artefato.',
      }),
      // ruling 2: sem tipo anotado, não produz mana
      mana((c) => { const t = c.g.state.objects[c.source]?.data.tipoAnotado as ManaType | undefined; return t ? [[t]] : []; }, {
        cost: '{T}, Remove a charge counter from this artifact',
        text: '{T}, Remova um marcador de carga deste artefato: Adicione uma mana do último tipo anotado deste artefato.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 106.1 — os tipos de mana são as cinco cores e o incolor',
    2: 'teste: marcador posto por outro efeito, sem tipo anotado, não produz mana; anotado, produz esse tipo',
  },
});
