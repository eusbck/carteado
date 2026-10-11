// Realmwalker
// Changeling (This card is every creature type.)
// As this creature enters, choose a creature type.
// You may look at the top card of your library any time.
// You may cast creature spells of the chosen type from the top of your library.
import { asEnters, changeling, chars, chooseCreatureType, defineCard, isCreature, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Realmwalker',
  faces: [{
    abilities: [
      changeling(),
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Realmwalker: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      // ruling 4: olhar a carta do topo não usa a pilha
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          // rulings 2, 6: só a zona muda; o tempo e os custos continuam os da mágica de criatura
          mayPlayFrom: (c, p, carta) => {
            const tipo = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
            // ruling 3: sem tipo escolhido, nada pode ser conjurado do topo
            if (!tipo || p !== c.you || c.g.state.zones.library[p][0] !== carta) return null;
            if (!isCreature(c.g, carta) || !chars(c.g, carta).subtypes.includes(tipo)) return null;
            return { key: `realmwalker:${c.source}`, label: 'conjurar do topo do grimório' };
          },
        },
        text: 'Você pode conjurar mágicas de criatura do tipo escolhido do topo do seu grimório.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 401.5 — a carta do topo do grimório não está na mão: não dá para descartá-la nem ativar habilidades dela',
    2: 'teste: conjura do topo do grimório uma criatura do tipo escolhido, no tempo de uma criatura',
    3: 'teste: sem tipo escolhido, ou com criatura de outro tipo no topo, nada é conjurado do grimório',
    4: 'regra geral: o gancho lookAtTopOfLibrary mostra a carta do topo ao controlador o tempo todo, sem usar a pilha (motor/defs.ts)',
    5: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos (motor/efeitos.ts chooseCreatureType)',
    6: 'regra geral: CR 601.2f — todos os custos da mágica continuam valendo (motor/stack.ts)',
    7: 'regra geral: a carta nova do topo só é mostrada depois que a conjuração termina (o cliente lê o estado depois de cada ação)',
  },
});
