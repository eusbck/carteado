// Mister Fantastic
// Reach, vigilance
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, draw a card.
// {R}{G}{W}{U}, {T}: Copy target triggered ability you control twice. You may choose new targets for the copies.
import { activated, copyStackAbility, defineCard, draw, keywords } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

const HABILIDADE: TargetSpec = {
  what: 'ability',
  label: 'habilidade desencadeada alvo que você controla',
  filter: (c, t) => {
    if (t.kind !== 'obj') return false;
    const st = c.g.state.objects[t.id]?.stack;
    return !!st && st.kind === 'triggered' && st.controller === c.you;
  },
};

export default defineCard({
  name: 'Mister Fantastic',
  faces: [{
    abilities: [
      ...keywords('reach', 'vigilance'),
      noCombateSeConjurou(function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, compre uma carta.',
      }),
      activated('{R}{G}{W}{U}, {T}', function* (c) {
        const r = c.targets[0]?.[0];
        if (!r || r.kind !== 'obj') return;
        // CR 707.10: as cópias vão para a pilha acima da original, com a mesma fonte; novos alvos para cada uma (707.10c)
        for (let i = 0; i < 2; i++) yield* copyStackAbility(c.g, r.id, c.you, { newTargets: true });
      }, { targets: [HABILIDADE], text: '{R}{G}{W}{U}, {T}: Copie duas vezes a habilidade desencadeada alvo que você controla. Você pode escolher novos alvos para as cópias.' }),
    ],
  }],
  rulings: {},
});
