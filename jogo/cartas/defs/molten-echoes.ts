// Molten Echoes
// As this enchantment enters, choose a creature type.
// Whenever a nontoken creature you control of the chosen type enters, create a token that's a copy of that creature. That
// token gains haste. Exile it at the beginning of the next end step.
import { addEffect, and, asEnters, chars, chooseCreatureType, copiableValues, createTokens, defineAbility, defineCard, delayed, exile, is, nextEndStepTrigger, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const EXILA = defineAbility('Molten Echoes:exila', nextEndStepTrigger(function* (c) {
  const id = c.data.ficha as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* exile(c.g, [id]);
}, 'Exile a ficha no início da próxima etapa final.'));

export default defineCard({
  name: 'Molten Echoes',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Molten Echoes: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.to !== 'battlefield' || !c.g.state.objects[e.obj]) return false;
        const tipo = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
        return !!tipo && and(is.creature, is.yours, is.nontoken)(c, e.obj) && chars(c.g, e.obj).subtypes.includes(tipo) ? { criatura: e.obj } : false;
      }), function* (c) {
        // rulings 2-4: valores copiáveis da criatura, pela última informação se ela já saiu, e o que ela estiver copiando
        const [ficha] = yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.event.criatura as ObjId) }, 1);
        if (ficha === undefined) return;
        // "essa ficha ganha ímpeto": sem prazo, enquanto ela existir
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: ficha }, affected: [ficha], mods: [{ k: 'addKeyword', kw: 'haste' }] });
        delayed(c, EXILA.id!, { data: { ficha } });
      }, { text: 'Sempre que uma criatura que não é ficha que você controla do tipo escolhido entra, crie uma ficha que é uma cópia dessa criatura. Essa ficha ganha ímpeto. Exile-a no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos (motor/efeitos.ts chooseCreatureType)',
    2: 'regra geral: CR 707.2 — a ficha copia pela última informação se a criatura já saiu do campo (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 707.2 — copia os valores copiáveis, sem marcadores nem efeitos (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 107.3 — X do custo da criatura copiada vale 0 no campo',
    6: 'teste: a criatura do tipo escolhido que entra ganha uma cópia com ímpeto, exilada na etapa final; as habilidades de entrar da cópia disparam',
  },
});
