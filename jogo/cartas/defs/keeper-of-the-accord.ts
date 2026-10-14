// Keeper of the Accord
// At the beginning of each opponent's end step, if that player controls more creatures than you, create a 1/1 white
// Soldier creature token.
// At the beginning of each opponent's end step, if that player controls more lands than you, you may search your library
// for a basic Plains card, put it onto the battlefield tapped, then shuffle.
import { canSearchLibraries, chars, controlledBy, createTokens, defineCard, isCreature, isLand, on, searchTo, triggered, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const mais = (c: SCtx, f: (id: number) => boolean): boolean => {
  const ativo = c.g.state.turn.active;
  return controlledBy(c.g, ativo, f).length > controlledBy(c.g, c.you, f).length;
};

export default defineCard({
  name: 'Keeper of the Accord',
  faces: [{
    abilities: [
      // cláusula "se" interveniente (CR 603.4): confere ao disparar e ao resolver (ruling 2)
      triggered(on.endStep('opponent'), function* (c) { yield* createTokens(c.g, c.you, 'Soldier', 1); }, {
        condition: (c) => mais(c, (id) => isCreature(c.g, id)),
        text: 'No início da etapa final de cada oponente, se esse jogador controlar mais criaturas que você, crie uma ficha de criatura Soldier branca 1/1.',
      }),
      triggered(on.endStep('opponent'), function* (c) {
        if (!canSearchLibraries(c.g, c.you) || !(yield* yesNo(c.g, c.you, 'Keeper of the Accord: procurar uma carta de Plains básica e colocá-la no campo virada?'))) return;
        yield* searchTo(c, c.you, (id) => isLand(c.g, id) && chars(c.g, id).supertypes.includes('Basic') && chars(c.g, id).subtypes.includes('Plains'), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de Plains básica' });
      }, {
        condition: (c) => mais(c, (id) => isLand(c.g, id)),
        text: 'No início da etapa final de cada oponente, se esse jogador controlar mais terrenos que você, você pode procurar no seu grimório uma carta de Plains básica, colocá-la no campo virada e depois embaralhar.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — os dois gatilhos disparam juntos e você escolhe a ordem',
    2: 'teste: na etapa final de Bruno, com mais criaturas e mais terrenos que você: cria um Soldier e busca uma Plains virada',
  },
});
