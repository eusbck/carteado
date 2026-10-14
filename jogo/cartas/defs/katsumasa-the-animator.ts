// Katsumasa, the Animator
// Flying
// {2}{U}: Until end of turn, target noncreature artifact you control becomes an artifact creature and gains flying. If it's
// not a Vehicle, it has base power and toughness 1/1 until end of turn.
// At the beginning of your upkeep, put a +1/+1 counter on each of up to three target noncreature artifacts.
import { activated, addCounters, and, defineCard, is, keyword, not, on, t, tgt, tgtsAll, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';
import type { Mod } from '../../motor/types.ts';
import { ehVeiculo } from '../veiculos.ts';

export default defineCard({
  name: 'Katsumasa, the Animator',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{2}{U}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const mods: Mod[] = [{ k: 'addTypes', types: ['Artifact', 'Creature'] }, { k: 'addKeyword', kw: 'flying' }];
        // Veículo fica com a força e a resistência impressas; os outros, base 1/1 (camada 7b)
        if (!ehVeiculo(c.g, id)) mods.push({ k: 'setPT', p: 1, t: 1 });
        untilEndOfTurn(c, [id], mods);
      }, {
        targets: [t.artifact(and(is.yours, not(is.creature)), 'artefato alvo que não é criatura que você controla')],
        text: '{2}{U}: Até o fim do turno, o artefato alvo que não é criatura que você controla se torna uma criatura artefato e ganha voar. Se não for um Veículo, tem força e resistência base 1/1 até o fim do turno.',
      }),
      triggered(on.upkeep('you'), function* (c) {
        for (const id of tgtsAll(c, 0)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        targets: [upTo(3, t.artifact(not(is.creature), 'até três artefatos alvo que não são criaturas'))],
        text: 'No início da sua manutenção, coloque um marcador +1/+1 em cada um de até três artefatos alvo que não são criaturas.',
      }),
    ],
  }],
  rulings: {},
});
