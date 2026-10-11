// Crystal, Inhuman Princess
// Flying
// Whenever you cast a noncreature spell, Crystal deals X damage to each opponent, where X is the number of colors that
// spell is.
// {T}: Add {R}, {G}, {W}, or {U}.
import { chars, dealDamage, defineCard, keyword, mana, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { aoConjurarNaoCriatura } from '../quarteto.ts';

export default defineCard({
  name: 'Crystal, Inhuman Princess',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(aoConjurarNaoCriatura(), function* (c) {
        const magica = c.event.spell as ObjId;
        // as cores da mágica (ou as últimas que ela teve, se já saiu da pilha)
        const cores = (c.g.state.objects[magica]?.zone === 'stack' ? chars(c.g, magica) : c.g.state.lki[magica]?.chars)?.colors.length ?? 0;
        if (cores > 0) dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: cores, combat: false })));
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, Crystal causa X de dano a cada oponente, onde X é o número de cores dessa mágica.' }),
      mana(['R', 'G', 'W', 'U']),
    ],
  }],
  rulings: {},
});
