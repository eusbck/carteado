// Casualties of War
// Choose one or more —
// • Destroy target artifact. • Destroy target creature. • Destroy target enchantment. • Destroy target land.
// • Destroy target planeswalker.
import { defineCard, destroy, is, modal, t, tgt, type TargetSpec } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';

function* destroiAlvo(c: Ctx) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); }
const modo = (text: string, spec: TargetSpec) => ({ text, targets: [spec], effect: destroiAlvo });

export default defineCard({
  name: 'Casualties of War',
  faces: [{
    spell: {
      // CR 700.2d: cada modo no máximo uma vez; executados na ordem escrita (ruling 2)
      modes: modal(1, 5, [
        modo('Destrua o artefato alvo', t.artifact()),
        modo('Destrua a criatura alvo', t.creature()),
        modo('Destrua o encantamento alvo', t.enchantment()),
        modo('Destrua o terreno alvo', t.land()),
        modo('Destrua o planeswalker alvo', t.permanent(is.planeswalker, 'planeswalker alvo')),
      ]),
    },
  }],
  rulings: {
    1: 'teste: escolhe vários modos, cada um uma vez',
    2: 'regra geral: CR 608.2c e 603.3 — destrói em ordem e os gatilhos esperam o fim da resolução',
  },
});
