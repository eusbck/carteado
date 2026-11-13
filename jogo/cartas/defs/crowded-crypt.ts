// Crowded Crypt
// {T}: Add {B}.
// Whenever a creature you control dies, put a corpse counter on this artifact.
// {4}{B}{B}, {T}, Sacrifice this artifact: Create a 2/2 black Zombie creature token with decayed for each corpse counter
// on this artifact. (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)
import { activated, addCounters, createTokens, defineCard, mana, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Crowded Crypt',
  faces: [{
    abilities: [
      mana('B'),
      triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'corpse', 1, c.you);
      }, { text: 'Sempre que uma criatura que você controla morre, coloque um marcador de cadáver neste artefato.' }),
      activated('{4}{B}{B}, {T}, Sacrifice this artifact', function* (c) {
        // sacrificado no custo: os marcadores pela última informação (CR 608.2h)
        const n = c.g.state.lki[c.source]?.obj.counters.corpse ?? c.g.state.objects[c.source]?.counters.corpse ?? 0;
        // rulings 1-4: a ficha 'Zombie' tem decaimento (cartas/fichas.ts)
        yield* createTokens(c.g, c.you, 'Zombie', n);
      }, { text: '{4}{B}{B}, {T}, Sacrifique este artefato: Crie uma ficha de criatura Zombie preta 2/2 com decaimento para cada marcador de cadáver neste artefato.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.147a — decaimento (ficha Zombie em cartas/fichas.ts)',
    2: 'regra geral: CR 702.147a — decaimento não obriga a atacar (motor)',
    3: 'regra geral: CR 302.6 — decaimento não dá ímpeto (motor)',
    4: 'regra geral: CR 702.147a — a ficha que atacou é sacrificada no fim do combate mesmo sem decaimento (motor/criaturas.ts decayed)',
  },
});
