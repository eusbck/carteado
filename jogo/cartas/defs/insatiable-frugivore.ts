// Insatiable Frugivore
// When this creature enters, create a Food token, then you may exile three cards from your graveyard. If you do, repeat
// this process.
// {3}{B}, Sacrifice X Foods: Creatures you control get +X/+0 and gain menace until end of turn.
import { activated, chooseItems, controlledBy, createTokens, defineCard, etb, exile, isCreature, nameOf, objItem, untilEndOfTurn } from '../../motor/api.ts';
import { COMIDA, ehComida } from '../esquilos.ts';

export default defineCard({
  name: 'Insatiable Frugivore',
  faces: [{
    abilities: [
      // rulings 5-7: tudo na mesma resolução; repete até você não exilar (ou não ter três cartas)
      etb(function* (c) {
        for (;;) {
          yield* createTokens(c.g, c.you, 'Food', 1);
          const cemiterio = c.g.state.zones.graveyard[c.you];
          if (cemiterio.length < 3) return;
          const esc = yield* chooseItems(c.g, c.you, 'Insatiable Frugivore: exilar três cartas do seu cemitério para criar outra Food? (escolha nenhuma para parar)',
            cemiterio.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 3);
          if (esc.length !== 3) return;
          yield* exile(c.g, esc.map(Number));
        }
      }, { text: 'Quando esta criatura entra, crie uma ficha Food; depois você pode exilar três cartas do seu cemitério. Se fizer isso, repita o processo.' }),
      activated('{3}{B}, Sacrifice X Foods', function* (c) {
        // ruling 8: X pode ser 0 (só ameaçar)
        const ids = controlledBy(c.g, c.you, (id) => isCreature(c.g, id));
        untilEndOfTurn(c, ids, [{ k: 'pt', p: c.x, t: 0 }, { k: 'addKeyword', kw: 'menace' }]);
      }, {
        xMax: (c) => controlledBy(c.g, c.you, (id) => ehComida(c.g, id)).length,
        text: '{3}{B}, Sacrifique X Foods: As criaturas que você controla recebem +X/+0 e ganham ameaçar até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.piada,
    2: COMIDA.qualquer,
    3: COMIDA.tipo,
    4: COMIDA.umCusto,
    5: 'teste: ao entrar cria uma Food; exilando três cartas do cemitério, cria outra, e para quando você não exila',
    6: 'regra geral: CR 608.2 — ninguém age no meio da resolução',
    7: 'teste: ao entrar cria uma Food; exilando três cartas do cemitério, cria outra, e para quando você não exila',
    8: 'teste: X = 0 dá só ameaçar; X = 2 sacrifica duas Foods e dá +2/+0',
  },
});
