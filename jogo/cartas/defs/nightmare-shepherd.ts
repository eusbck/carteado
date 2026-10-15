// Nightmare Shepherd
// Flying
// Whenever another nontoken creature you control dies, you may exile it. If you do, create a token that's a copy of that
// creature, except it's 1/1 and it's a Nightmare in addition to its other types.
import { copyWithExcept, createTokens, defineCard, exile, keyword, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Nightmare Shepherd',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.dies((c, lki, old) => old.id !== c.source && !old.isToken && lki.controller === c.you), function* (c) {
        const { obj: carta, old } = c.event as { obj: ObjId; old: ObjId };
        const o = c.g.state.objects[carta];
        // a carta tem de estar no cemitério para ser exilada
        if (!o || o.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, `Nightmare Shepherd: exilar ${nameOf(c.g, carta)} para criar uma cópia 1/1 Nightmare?`))) return;
        const [ex] = yield* exile(c.g, [carta]);
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        // rulings 1-3: copia a criatura como ela existiu por último no campo (os valores copiáveis), 1/1 e Nightmare
        yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, old, { power: 1, toughness: 1, addSubtypes: ['Nightmare'] }) }, 1);
      }, { text: 'Sempre que outra criatura que não é ficha que você controla morre, você pode exilá-la. Se fizer isso, crie uma ficha que é cópia dessa criatura, exceto que é 1/1 e é um Nightmare além dos outros tipos.' }),
    ],
  }],
  rulings: {
    1: 'teste: exila a criatura que morreu e cria uma cópia 1/1 Nightmare, com a habilidade de entrar',
    2: 'regra geral: CR 707.2 — só os valores copiáveis: sem marcadores, Auras nem efeitos (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 707.3 — se a criatura copiava outra, a ficha é cópia dessa outra (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.2 — o X do custo de mana conta 0 na cópia',
    5: 'teste: exila a criatura que morreu e cria uma cópia 1/1 Nightmare, com a habilidade de entrar',
    6: 'regra geral: CR 707.9d — com força e resistência definidas pela exceção, a habilidade que as define não é copiada',
    7: 'regra geral: CR 707.9b — as exceções viram valores copiáveis da ficha (CopyValues.except)',
  },
});
