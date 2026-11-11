// Isolinear Processor
// {T}: Add {C}. Spend this mana only to cast an artifact spell or activate an ability of an artifact source.
// {2}, {T}: Draw a card, then discard a card.
import { activated, defineCard, defineFn, discard, draw, isType, mana, type G } from '../../motor/api.ts';

const RESTRICAO = 'Isolinear Processor:artefatos';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.obj === undefined) return false;
  if (purpose.kind === 'spell') return isType(g, purpose.obj, 'Artifact');
  if (purpose.kind === 'ability') { const fonte = g.state.objects[purpose.obj]?.stack?.source; return fonte !== undefined && fonte !== null && isType(g, fonte, 'Artifact'); }
  return false;
});

export default defineCard({
  name: 'Isolinear Processor',
  faces: [{
    abilities: [
      mana('C', { restriction: RESTRICAO, text: '{T}: Adicione {C}. Gaste esta mana apenas para conjurar uma mágica de artefato ou ativar uma habilidade de uma fonte artefato.' }),
      activated('{2}, {T}', function* (c) { yield* draw(c.g, c.you, 1); yield* discard(c.g, c.you, 1); }, { text: '{2}, {T}: Compre um card e depois descarte um card.'.replace(/um card/g, 'uma carta') }),
    ],
  }],
  rulings: {},
});
