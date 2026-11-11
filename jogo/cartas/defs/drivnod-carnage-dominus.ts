// Drivnod, Carnage Dominus
// If a creature dying causes a triggered ability of a permanent you control to trigger, that ability triggers an
// additional time.
// {B/P}{B/P}, Exile three creature cards from your graveyard: Put an indestructible counter on Drivnod.
import { activated, addCounters, controllerOf, defineCard, isCreature, staticAbility } from '../../motor/api.ts';
import { disparoPorMorte } from '../morte.ts';

export default defineCard({
  name: 'Drivnod, Carnage Dominus',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you) return 0;
            const o = c.g.state.objects[tr.source] ?? c.g.state.lki[tr.source]?.obj;
            // "de um permanente que você controla": no campo, ou que saiu junto (olha para trás)
            if (!o || (o.zone !== 'battlefield' && !c.g.state.lki[tr.source])) return 0;
            if (o.zone === 'battlefield' && controllerOf(c.g, tr.source) !== c.you) return 0;
            return disparoPorMorte(c.g, tr) ? 1 : 0;
          },
        },
        text: 'Se uma criatura morrendo fizer disparar uma habilidade desencadeada de um permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
      activated([{ k: 'mana', cost: '{B/P}{B/P}' }, { k: 'exileFromGraveyard', n: 3, filter: (c, id) => isCreature(c.g, id) }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'indestructible', 1, c.you);
      }, { text: '{B/P}{B/P}, Exile três cartas de criatura do seu cemitério: Coloque um marcador de indestrutível em Drivnod.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.2 — vale para habilidades que disparam por uma criatura morrer (inclusive de quem morreu)',
    2: 'regra geral: CR 603.2 — não vale para habilidades de cartas em outras zonas que não o campo',
    3: 'regra geral: CR 122.1b — o marcador de indestrutível dá a palavra-chave',
  },
});
