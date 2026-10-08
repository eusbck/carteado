// Rionya, Fire Dancer
// At the beginning of combat on your turn, create X tokens that are copies of another target creature you control, where
// X is one plus the number of instant and sorcery spells you've cast this turn. They gain haste. Exile them at the
// beginning of the next end step.
import { addEffect, and, copiableValues, createTokens, defineAbility, defineCard, delayed, exile, is, nextEndStepTrigger, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const EXILA = defineAbility('Rionya, Fire Dancer:exila', nextEndStepTrigger(function* (c) {
  const fichas = (c.data.fichas as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (fichas.length) yield* exile(c.g, fichas);
}, 'No início da próxima etapa final, exile as fichas criadas por Rionya.'));

export default defineCard({
  name: 'Rionya, Fire Dancer',
  faces: [{
    abilities: [triggered(on.beginCombat('you'), function* (c) {
      const id = tgt(c);
      if (id === null) return;
      // ruling 2: conta as mágicas conjuradas até a resolução
      const x = 1 + c.g.state.turnStats[c.you].instantSorceryCast;
      // rulings 1, 3-6: valores copiáveis
      const fichas = yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, x);
      for (const f of fichas) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: f }, affected: [f], mods: [{ k: 'addKeyword', kw: 'haste' }] });
      if (fichas.length) delayed(c, EXILA.id!, { data: { fichas } });
    }, {
      targets: [t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla')],
      text: 'No início do combate no seu turno, crie X fichas que são cópias de outra criatura alvo que você controla, onde X é um mais o número de mágicas instantâneas e de feitiço que você conjurou neste turno. Elas ganham ímpeto. Exile-as no início da próxima etapa final.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    2: 'teste: conta as mágicas conjuradas no turno',
    3: 'regra geral: CR 707.5 — as fichas disparam as próprias habilidades de entrar',
    4: 'regra geral: CR 707.2 — ficha copia os valores originais da ficha',
    5: 'regra geral: CR 707.9 — X vale 0',
    6: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
  },
});
