// Maturation Chamber
// Whenever you cast an artifact spell, put a charge counter on this artifact.
// {4}, {T}: Create a 1/1 colorless Borg artifact creature token for each charge counter on this artifact. Activate only
// as a sorcery.
import { activated, addCounters, defineCard, is, on, triggered } from '../../motor/api.ts';
import { criaBorg } from '../borg.ts';

export default defineCard({
  name: 'Maturation Chamber',
  faces: [{
    abilities: [
      triggered(on.youCast(is.artifact), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, { text: 'Sempre que você conjura uma mágica de artefato, coloque um marcador de carga neste artefato.' }),
      activated('{4}, {T}', function* (c) {
        const o = c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj;
        yield* criaBorg(c, o?.counters.charge ?? 0);
      }, { timing: 'sorcery', text: '{4}, {T}: Crie uma ficha de criatura artefato Borg 1/1 incolor para cada marcador de carga neste artefato. Ative só como um feitiço.' }),
    ],
  }],
  rulings: {},
});
