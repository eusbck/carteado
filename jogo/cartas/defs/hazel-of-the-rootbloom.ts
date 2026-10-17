// Hazel of the Rootbloom
// {T}, Pay 2 life, Tap X untapped tokens you control: Add X mana in any combination of colors.
// At the beginning of your end step, create a token that's a copy of target token you control. If that token is a
// Squirrel, instead create two tokens that are copies of it.
import { and, copiableValues, cost, createTokens, defineCard, is, mana, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ManaAbilityDef, SCtx } from '../../motor/defs.ts';
import type { ManaType, ObjId } from '../../motor/types.ts';
import { ehEsquilo, ehFicha, fichasDe } from '../esquilos.ts';

// ruling 1: qualquer ficha desvirada, mesmo criatura com enjoo de invocação
const fichasDesviradas = (c: SCtx): ObjId[] => fichasDe(c.g, c.you).filter((id) => id !== c.source && !c.g.state.objects[id].tapped);

// uma alternativa para cada X possível; cada '*' vira uma cor escolhida ao ativar (CR 106.1a, "qualquer combinação")
const MANA: ManaAbilityDef = {
  ...mana((c) => Array.from({ length: fichasDesviradas(c).length }, (_, i) => Array<ManaType>(i + 1).fill('*' as ManaType)), {
    text: '{T}, Pague 2 de vida, Vire X fichas desviradas que você controla: Adicione X manas em qualquer combinação de cores.',
  }),
  cost: [...cost('{T}, Pay 2 life'), { k: 'tapPermanents', n: 'X', filter: (c, id) => id !== c.source && ehFicha(c.g, id), label: 'ficha(s) desvirada(s)' }],
  // o X do custo é a quantidade de mana da alternativa escolhida (motor/costs.ts activateManaAbility)
  xFromAlt: true,
};

export default defineCard({
  name: 'Hazel of the Rootbloom',
  faces: [{
    abilities: [
      MANA,
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // rulings 2-4: copia os valores copiáveis da ficha (o que a criou definiu, ou o que ela copia)
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, ehEsquilo(c.g, id) ? 2 : 1);
      }, {
        targets: [t.permanent(and(is.token, is.yours), 'ficha alvo que você controla')],
        text: 'No início da sua etapa final, crie uma ficha que é uma cópia da ficha alvo que você controla. Se essa ficha for um Squirrel, em vez disso crie duas fichas que são cópias dela.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: vira três fichas (inclusive com enjoo de invocação) e paga 2 de vida: três manas das cores escolhidas',
    2: 'teste: na sua etapa final, copia a ficha alvo; um Squirrel vira dois, sem marcadores e desvirados',
    3: 'regra geral: CR 707.3 — a ficha que copia outra copia o que ela copia (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.2 — X do custo de mana copiado é 0',
    5: 'regra geral: CR 707.5 — as habilidades de entrar da ficha copiada funcionam (motor/actions.ts putOntoBattlefield)',
  },
});
