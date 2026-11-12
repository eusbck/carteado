// Ygra, Eater of All
// Ward—Sacrifice a Food.
// Other creatures are Food artifacts in addition to their other types and have "{2}, {T}, Sacrifice this permanent: You
// gain 3 life."
// Whenever a Food is put into a graveyard from the battlefield, put two +1/+1 counters on Ygra.
import { activated, addCounters, defineAbility, defineCard, gainLife, isCreature, staticAbility, triggered, ward } from '../../motor/api.ts';
import { COMIDA } from '../esquilos.ts';
import { comidaVaiParaOCemiterio } from '../forragear.ts';

// a habilidade concedida às outras criaturas (CR 613.1f, camada 6)
const COMER = defineAbility('Ygra, Eater of All:comida', activated('{2}, {T}, Sacrifice this permanent', function* (c) {
  gainLife(c.g, c.you, 3, c.source);
}, { text: '{2}, {T}, Sacrifique este permanente: Você ganha 3 de vida.' }));

export default defineCard({
  name: 'Ygra, Eater of All',
  faces: [{
    abilities: [
      // CR 702.21a: resguardo com custo de sacrificar uma Food (motor/mecanicas.ts, 'sacrifice:Food')
      ...ward('sacrifice:Food'),
      // CR 613.1d (camada 4) e 613.1f (camada 6); ruling 7: mantêm os outros tipos e habilidades
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.id !== c.source && isCreature(c.g, o.id),
        mods: () => [{ k: 'addTypes', types: ['Artifact'], subtypes: ['Food'] }, { k: 'addAbility', id: COMER.id! }],
        text: 'Outras criaturas são artefatos Food além dos outros tipos e têm "{2}, {T}, Sacrifique este permanente: Você ganha 3 de vida."',
      }),
      // ruling 6: a criatura que morre ainda era Food ao sair (última informação conhecida, CR 603.10a)
      triggered(comidaVaiParaOCemiterio(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: 'Sempre que uma Food é colocada num cemitério vinda do campo, coloque dois marcadores +1/+1 em Ygra.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.umCusto,
    4: COMIDA.piada,
    5: 'regra geral: CR 614.12 — substituições de "artefatos entram…" valem para as criaturas que entram como Food (o tipo vem da estática da Ygra)',
    6: 'teste: uma criatura (que é Food) morrendo dá dois marcadores à Ygra',
    7: 'teste: as outras criaturas são artefatos Food, mantêm os outros tipos e podem ser comidas por 3 de vida',
  },
});
