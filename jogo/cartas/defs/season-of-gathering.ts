// Season of Gathering
// Choose up to five {P} worth of modes. You may choose the same mode more than once.
// {P} — Put a +1/+1 counter on a creature you control. It gains vigilance and trample until end of turn.
// {P}{P} — Choose artifact or enchantment. Destroy all permanents of the chosen type.
// {P}{P}{P} — Draw cards equal to the greatest power among creatures you control.
import { addCounters, chooseItems, chooseOne, controlledBy, defineCard, destroy, draw, isCreature, isType, modalPatinhas, nameOf, objItem, untilEndOfTurn } from '../../motor/api.ts';
import { maiorForca } from '../voja.ts';

const MODOS = 'regra geral: CR 700.2i — modos com patinhas: escolhidos ao conjurar, um por vez, até cinco patinhas (motor/patinhas.ts)';

export default defineCard({
  name: 'Season of Gathering',
  faces: [{
    spell: {
      modes: modalPatinhas([1, 2, 3], 5, [
        {
          text: 'Coloque um marcador +1/+1 numa criatura que você controla. Ela ganha vigilância e atropelar até o fim do turno',
          *effect(c) {
            // ruling 1: sem alvo, a criatura é escolhida na resolução
            const minhas = controlledBy(c.g, c.you, (id) => isCreature(c.g, id));
            if (!minhas.length) return;
            const [esc] = yield* chooseItems(c.g, c.you, 'Season of Gathering: escolha uma criatura que você controla para o marcador +1/+1', minhas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
            const id = Number(esc);
            addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
            untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'trample' }]);
          },
        },
        {
          text: 'Escolha artefato ou encantamento. Destrua todas as permanentes do tipo escolhido',
          *effect(c) {
            const tipo = yield* chooseOne(c.g, c.you, 'Season of Gathering: escolha artefato ou encantamento', [{ id: 'Artifact', label: 'Artefato' }, { id: 'Enchantment', label: 'Encantamento' }]);
            const alvos = c.g.state.zones.battlefield.filter((id) => !c.g.state.objects[id].phasedOut && isType(c.g, id, tipo));
            if (alvos.length) yield* destroy(c.g, alvos);
          },
        },
        {
          text: 'Compre cartas igual à maior força entre as criaturas que você controla',
          *effect(c) {
            const n = maiorForca(c.g, c.you);
            if (n > 0) yield* draw(c.g, c.you, n);
          },
        },
      ], { repeat: true }),
    },
  }],
  rulings: {
    1: 'teste: um, dois e dois: o marcador, depois destrói os artefatos e depois os encantamentos',
    2: 'não se aplica: as patinhas não são recurso; nada é guardado entre mágicas (CR 107.18)',
    3: 'teste: pode escolher menos de cinco patinhas, inclusive nenhum modo',
    4: MODOS,
    5: 'não se aplica: nenhum modo da Season of Gathering tem alvo',
    6: 'teste: um, dois e dois: o marcador, depois destrói os artefatos e depois os encantamentos',
    7: 'regra geral: CR 608.2 — ninguém age entre os modos de uma mágica resolvendo',
    8: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    9: 'não se aplica: nenhum modo da Season of Gathering tem alvo',
  },
});
