// Forum Filibuster
// At the beginning of your upkeep, create a 2/1 white and black Inkling creature token with flying. When you do, return
// up to one target Aura or Equipment card from your graveyard to the battlefield attached to that token.
import { createTokens, defineAbility, defineCard, is, on, or, putOntoBattlefield, reflexive, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const ANEXA = defineAbility('Forum Filibuster:anexa', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  const ficha = c.data.ficha as ObjId;
  if (id === null || c.g.state.objects[ficha]?.zone !== 'battlefield') return;
  yield* putOntoBattlefield(c.g, [{ id, controller: c.you, attachTo: ficha }], 'effect');
}, { targets: [upTo(1, t.card('graveyard', or(is.subtype('Aura'), is.subtype('Equipment')), 'até uma carta de Aura ou Equipamento alvo no seu cemitério'))], text: 'Devolva até uma carta de Aura ou Equipamento alvo do seu cemitério ao campo anexada à ficha.' }));

export default defineCard({
  name: 'Forum Filibuster',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) {
      const [ficha] = yield* createTokens(c.g, c.you, 'Inkling', 1);
      // ruling 1: gatilho reflexivo, alvo escolhido quando ele vai para a pilha (CR 603.12)
      if (ficha !== undefined) reflexive(c, ANEXA.id!, { ficha });
    }, { text: 'No início da sua manutenção, crie uma ficha de criatura Inkling branca e preta 2/1 com voar. Quando fizer isso, devolva até uma carta de Aura ou Equipamento alvo do seu cemitério ao campo anexada a essa ficha.' })],
  }],
  rulings: { 1: 'teste: a Aura volta anexada à ficha nova' },
});
