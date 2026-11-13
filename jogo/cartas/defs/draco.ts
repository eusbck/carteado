// Draco
// Domain — This spell costs {2} less to cast for each basic land type among lands you control.
// Flying
// Domain — At the beginning of your upkeep, sacrifice this creature unless you pay {10}. This cost is reduced by {2} for
// each basic land type among lands you control.
import { defineCard, keyword, mayPay, on, sacrifice, triggered } from '../../motor/api.ts';
import { dominio } from '../dominio.ts';

export default defineCard({
  name: 'Draco',
  faces: [{
    // CR 601.2f: {2} a menos por tipo básico de terreno (só a parte genérica)
    selfCost: (c) => ({ reduce: 2 * dominio(c.g, c.you) }),
    abilities: [
      keyword('flying'),
      triggered(on.upkeep('you'), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const custo = Math.max(0, 10 - 2 * dominio(c.g, c.you));
        // com custo {0}, paga-se sem gastar nada
        if (custo === 0 || (yield* mayPay(c, c.you, `{${custo}}`, 'manter Draco'))) return;
        yield* sacrifice(c.g, [c.source]);
      }, { text: 'Domínio — No início da sua manutenção, sacrifique esta criatura a menos que você pague {10}. Esse custo é reduzido em {2} para cada tipo básico de terreno entre os terrenos que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta tipos básicos de terreno, não terrenos',
    2: 'teste: conta tipos básicos de terreno, não terrenos',
  },
});
