// Midnight Arsonist
// When this creature enters, destroy up to X target artifacts without mana abilities, where X is the number of Vampires
// you control.
import { chars, controlledBy, defineCard, destroy, etb, isSubtype, t } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';

export default defineCard({
  name: 'Midnight Arsonist',
  faces: [{
    abilities: [
      etb(function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' ? [r.id] : []));
        if (ids.length) yield* destroy(c.g, ids);
      }, {
        targets: [{
          // ruling 1: fora os artefatos com habilidade de mana, ativada ou desencadeada
          ...t.artifact((c, id) => !chars(c.g, id).abilities.some((a) => { const def = registry.abilities.get(a.id); return def?.kind === 'mana' || (def?.kind === 'triggered' && !!(def as { mana?: boolean }).mana); }), 'até X artefatos alvo sem habilidades de mana'),
          min: 0, max: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Vampire')).length,
        }],
        text: 'Quando esta criatura entra, destrua até X artefatos alvo sem habilidades de mana, onde X é o número de Vampires que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: destrói até X artefatos sem habilidade de mana; o artefato com habilidade de mana não é alvo',
  },
});
