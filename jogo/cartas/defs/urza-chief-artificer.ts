// Urza, Chief Artificer
// Affinity for artifact creatures
// Artifact creatures you control have menace.
// At the beginning of your end step, create a 0/0 colorless Construct artifact creature token with "This token gets
// +1/+1 for each artifact you control."
import { and, anthem, createTokens, defineCard, is, on, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import { artefatoCriatura } from '../borg.ts';

const afinidade = (c: SCtx) => ({ reduce: c.g.state.zones.battlefield.filter((id) => artefatoCriatura(c.g, id) && is.yours(c, id)).length });

export default defineCard({
  name: 'Urza, Chief Artificer',
  faces: [{
    selfCost: afinidade,
    abilities: [
      anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'addKeyword', kw: 'menace' }], 'As criaturas-artefato que você controla têm ameaça.'),
      triggered(on.endStep('you'), function* (c) { yield* createTokens(c.g, c.you, 'Construct (artefatos)', 1); }, {
        text: 'No início da sua etapa final, crie uma ficha de criatura-artefato Construct 0/0 incolor com "Esta ficha recebe +1/+1 para cada artefato que você controla."',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 702.41a — afinidade reduz só a parte genérica do custo' },
});
