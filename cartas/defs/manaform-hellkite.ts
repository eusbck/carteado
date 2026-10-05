// Manaform Hellkite
// Flying
// Whenever you cast a noncreature spell, create an X/X red Dragon Illusion creature token with flying and haste, where X
// is the amount of mana spent to cast that spell. Exile that token at the beginning of the next end step.
import { createTokens, defineAbility, defineCard, delayed, exile, is, keyword, nextEndStepTrigger, not, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const EXILA = defineAbility('Manaform Hellkite:exila', nextEndStepTrigger(function* (c) {
  const ficha = c.data.ficha as ObjId;
  if (c.g.state.objects[ficha]?.zone === 'battlefield') yield* exile(c.g, [ficha]);
}, 'No início da próxima etapa final, exile a ficha Dragon Illusion.'));

export default defineCard({
  name: 'Manaform Hellkite',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.youCast(not(is.creature)), function* (c) {
        const spell = c.event.spell as ObjId;
        // ruling 1: a mana realmente gasta (0 se conjurada sem pagar)
        const o = c.g.state.objects[spell] ?? c.g.state.lki[spell]?.obj;
        const x = o?.stack?.manaSpent?.total ?? 0;
        const [ficha] = yield* createTokens(c.g, c.you, { copyOf: { def: 'Dragon Illusion', face: 0, except: { power: x, toughness: x } } }, 1);
        if (ficha !== undefined) delayed(c, EXILA.id!, { data: { ficha } });
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, crie uma ficha de criatura Dragon Illusion vermelha X/X com voar e ímpeto, onde X é a quantidade de mana gasta para conjurá-la. Exile a ficha no início da próxima etapa final.' }),
    ],
  }],
  rulings: { 1: 'teste: X é a mana gasta, não o valor de mana' },
});
