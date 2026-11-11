// Crowded Crypt
// {T}: Add {B}.
// Whenever a creature you control dies, put a corpse counter on this artifact.
// {4}{B}{B}, {T}, Sacrifice this artifact: Create a 2/2 black Zombie creature token with decayed for each corpse
// counter on this artifact.
import { activated, addCounters, createTokens, defineCard, lkiObj, mana, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Crowded Crypt',
  faces: [{
    abilities: [
      mana('B'),
      triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'corpse', 1, c.you);
      }, { text: 'Sempre que uma criatura que você controla morre, coloque um marcador de cadáver neste artefato.' }),
      activated('{4}{B}{B}, {T}, Sacrifice this artifact', function* (c) {
        // ruling 1: conta os marcadores que tinha ao ser sacrificado
        const n = lkiObj(c.g, c.source)?.counters.corpse ?? c.g.state.objects[c.source]?.counters.corpse ?? 0;
        if (n > 0) yield* createTokens(c.g, c.you, 'Zombie', n);
      }, { text: '{4}{B}{B}, {T}, Sacrifique este artefato: Crie uma ficha de criatura Zombie preta 2/2 com decomposição para cada marcador de cadáver neste artefato.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta os marcadores de cadáver que tinha ao ser sacrificado',
    2: 'regra geral: CR 702.147a — decomposição: não bloqueia e é sacrificada no fim do combate em que atacou',
    3: 'regra geral: CR 603.10a — dispara mesmo se a criatura morrer junto com ele',
    4: 'regra geral: CR 111.1 — fichas de criatura também contam',
  },
});
