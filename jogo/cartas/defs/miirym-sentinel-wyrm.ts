// Miirym, Sentinel Wyrm
// Flying, ward {2}
// Whenever another nontoken Dragon you control enters, create a token that's a copy of it, except the token isn't
// legendary.
import { controllerOf, copyWithExcept, createTokens, defineCard, keyword, lkiObj, on, triggered, ward } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { ehDragao } from '../dragoes.ts';

export default defineCard({
  name: 'Miirym, Sentinel Wyrm',
  faces: [{
    abilities: [
      keyword('flying'),
      ...ward('{2}'),
      triggered(on.enters((c, id) => id !== c.source && !c.g.state.objects[id].isToken && ehDragao(c.g, id) && controllerOf(c.g, id) === c.you), function* (c) {
        const id = c.event.obj as ObjId;
        // CR 707.2: os valores copiáveis (ruling 1: sem marcadores nem efeitos); ruling 2: se copia outra coisa, a ficha
        // também copia; se o Dragon saiu do campo, pela última informação
        const fonte = c.g.state.objects[id]?.zone === 'battlefield' ? id : (lkiObj(c.g, id) ? id : null);
        if (fonte === null) return;
        yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, fonte, { legendary: false }) }, 1);
      }, { text: 'Sempre que outro Dragon que não é ficha e que você controla entra, crie uma ficha que é uma cópia dele, exceto que a ficha não é lendária.' }),
    ],
  }],
  rulings: {
    1: 'teste: a ficha copia o Dragon que entrou, sem marcadores, e não é lendária',
    2: 'regra geral: CR 707.3 — copiando uma cópia, a ficha é o que ela copiava (motor/mecanicas.ts copiableValues)',
  },
});
