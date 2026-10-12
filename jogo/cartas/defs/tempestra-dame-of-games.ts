// Tempestra, Dame of Games
// {2}{R}, {T}, Sacrifice an artifact: Create a token that's a copy of another target creature you control, except it
// isn't legendary. It gains haste. Sacrifice it at the beginning of the next end step.
import { activated, and, copyWithExcept, createTokens, defineAbility, defineCard, delayed, is, nextEndStepTrigger, sacrifice, t, tgt } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const SACRIFICA = defineAbility('Tempestra, Dame of Games:sacrifica', nextEndStepTrigger(function* (c) {
  const fichas = ((c.data.fichas ?? []) as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (fichas.length) yield* sacrifice(c.g, fichas);
}, 'Sacrifique a ficha no início da próxima etapa final.'));

export default defineCard({
  name: 'Tempestra, Dame of Games',
  faces: [{
    abilities: [
      activated('{2}{R}, {T}, Sacrifice an artifact', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // o ímpeto entra junto com a ficha (simplificação: fica como exceção da cópia, em vez de um efeito à parte)
        const fichas = yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, id, { legendary: false, addKeywords: ['haste'] }) }, 1);
        if (fichas.length) delayed(c, SACRIFICA.id!, { data: { fichas } });
      }, {
        targets: [t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla')],
        text: '{2}{R}, {T}, Sacrifique um artefato: Crie uma ficha que é uma cópia de outra criatura alvo que você controla, exceto que ela não é lendária. Ela ganha ímpeto. Sacrifique-a no início da próxima etapa final.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — o X do custo de mana copiado vale 0 (motor/chars.ts)',
    2: 'regra geral: CR 707.3 — se o modelo é cópia de outra coisa, a ficha entra como o que ele copiou (motor/criaturas.ts copyWithExcept)',
    3: 'regra geral: CR 707.2 — copia só os valores copiáveis, com a exceção: não copia estar virada, marcadores nem anexos (motor/criaturas.ts copyWithExcept)',
    4: 'regra geral: CR 707.2 — a ficha tem as habilidades de entrar copiadas, e elas disparam (motor/actions.ts putOntoBattlefield)',
    5: 'regra geral: CR 707.2 — copiando uma ficha, valem as características originais dela (motor/mecanicas.ts copiableValues)',
  },
});