// Determined Iteration
// At the beginning of combat on your turn, populate. The token created this way gains haste. Sacrifice it at the
// beginning of the next end step.
import { chooseItems, controllerOf, copiableValues, createTokens, defineAbility, defineCard, delayed, isCreature, nameOf, nextEndStepTrigger, objItem, on, sacrifice, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const SACRIFICAR = defineAbility('Determined Iteration:sacrificar', nextEndStepTrigger(function* (c) {
  const id = c.data.ficha as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield' && controllerOf(c.g, id) === c.you) yield* sacrifice(c.g, [id]);
}, 'Sacrifique a ficha povoada no início da próxima etapa final.'));

export default defineCard({
  name: 'Determined Iteration',
  faces: [{
    abilities: [triggered(on.beginCombat('you'), function* (c) {
      // Povoar (CR 701.36): cópia de uma ficha de criatura sua, à escolha, sem mirar (ruling 6)
      const fichas = c.g.state.zones.battlefield.filter((id) => c.g.state.objects[id].isToken && isCreature(c.g, id) && controllerOf(c.g, id) === c.you);
      if (fichas.length === 0) return; // ruling 3
      const [pick] = yield* chooseItems(c.g, c.you, 'Povoar: escolha uma ficha de criatura sua para copiar', fichas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
      const [nova] = yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, Number(pick)) }, 1);
      if (nova === undefined) return;
      untilEndOfTurn(c, [nova], [{ k: 'addKeyword', kw: 'haste' }]);
      delayed(c, SACRIFICAR.id!, { data: { ficha: nova } });
    }, { text: 'No início do combate no seu turno, povoe. A ficha criada assim ganha ímpeto. Sacrifique-a no início da próxima etapa final.' })],
  }],
  rulings: {
    1: 'teste: copia a ficha original',
    2: 'regra geral: CR 707.5 — a cópia dispara as próprias habilidades de entrar',
    3: 'teste: sem ficha de criatura, nada acontece',
    4: 'teste: não copia marcadores',
    5: 'regra geral: copia o que a ficha estiver copiando (valores copiáveis)',
    6: 'regra geral: CR 701.36 — povoar não mira',
  },
});
