// Coalition Relic
// {T}: Add one mana of any color.
// {T}: Put a charge counter on this artifact.
// At the beginning of your first main phase, remove all charge counters from this artifact. Add one mana of any color for
// each charge counter removed this way.
import { activated, addCounters, addMana, chooseColor, defineCard, mana, on, removeCounters, triggered } from '../../motor/api.ts';
import type { Color } from '../../motor/types.ts';

export default defineCard({
  name: 'Coalition Relic',
  faces: [{
    abilities: [
      mana('any'),
      activated('{T}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, { text: '{T}: Coloque um marcador de carga neste artefato.' }),
      // ruling 2: só a primeira fase principal do turno; ruling 1: uma cor para cada marcador
      triggered(on.firstMain(), function* (c) {
        const n = c.g.state.objects[c.source]?.counters.charge ?? 0;
        if (n <= 0) return;
        removeCounters(c.g, { kind: 'obj', id: c.source }, 'charge', n);
        const cores: Color[] = [];
        for (let i = 0; i < n; i++) cores.push(yield* chooseColor(c.g, c.you, `Coalition Relic: cor da mana ${i + 1} de ${n}`));
        addMana(c.g, c.you, cores, { source: c.source });
      }, { text: 'No início da sua primeira fase principal, remova todos os marcadores de carga deste artefato. Adicione uma mana de qualquer cor para cada marcador de carga removido assim.' }),
    ],
  }],
  rulings: {
    1: 'teste: na sua primeira fase principal, troca os marcadores de carga por mana, uma cor para cada um',
    2: 'regra geral: CR 505.1a — só a primeira fase principal do turno é a pré-combate (motor/dsl.ts on.firstMain)',
  },
});
