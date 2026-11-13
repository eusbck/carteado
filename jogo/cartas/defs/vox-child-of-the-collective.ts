// Võx, Child of the Collective
// When Võx enters and at the beginning of your first main phase, the next artifact creature spell and the next
// Spacecraft spell you cast this turn have undaunted. (They cost {1} less to cast for each opponent.)
import { defineCard, on, registerUndauntedFilter, triggered, undauntedNext } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';

const CRIATURA_ARTEFATO = 'Võx:criaturaArtefato';
const ESPACONAVE = 'Võx:spacecraft';
registerUndauntedFilter(CRIATURA_ARTEFATO, (ch) => ch.types.includes('Artifact') && ch.types.includes('Creature'));
registerUndauntedFilter(ESPACONAVE, (ch) => ch.subtypes.includes('Spacecraft'));

// CR 702.125: cada uma das duas próximas mágicas tem destemido; o efeito de cada uma acaba quando ela é conjurada
const efeito: EffectFn = function* (c) {
  undauntedNext(c, c.you, CRIATURA_ARTEFATO);
  undauntedNext(c, c.you, ESPACONAVE);
};
const TEXTO = 'a próxima mágica de criatura artefato e a próxima mágica de Spacecraft que você conjurar neste turno têm destemido (custam {1} a menos para cada oponente).';

export default defineCard({
  name: 'Võx, Child of the Collective',
  faces: [{
    abilities: [
      triggered(on.selfEnters(), efeito, { text: `Quando Võx entra, ${TEXTO}` }),
      triggered(on.firstMain(), efeito, { text: `No início da sua primeira fase principal, ${TEXTO}` }),
    ],
  }],
  rulings: {},
});
