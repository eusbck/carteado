// Boseiju, Who Endures
// {T}: Add {G}.
// Channel — {1}{G}, Discard this card: Destroy target artifact, enchantment, or nonbasic land an opponent controls.
// That player may search their library for a land card with a basic land type, put it onto the battlefield, then
// shuffle. This ability costs {1} less to activate for each legendary creature you control.
import {
  activated, and, chars, controlledBy, controllerOf, cost, defineCard, destroy, is, isCreature, isLegendary, mana, not, or, putOntoBattlefield,
  searchLibrary, shuffleLibrary, t, tgt, yesNo,
} from '../../motor/api.ts';

const BASICOS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];

export default defineCard({
  name: 'Boseiju, Who Endures',
  faces: [{
    abilities: [
      mana('G'),
      // canalizar é palavra de habilidade (CR 207.2c): ativada da mão; descartar é custo (ruling 1)
      activated([...cost('{1}{G}'), { k: 'discardSelf' }], function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const dono = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        if (c.g.state.players[dono].left) return;
        if (!(yield* yesNo(c.g, dono, 'Boseiju, Who Endures: procurar no seu grimório uma carta de terreno com um tipo básico de terreno?'))) return;
        const achados = yield* searchLibrary(c.g, dono, dono, { max: 1, filter: (x) => chars(c.g, x).types.includes('Land') && chars(c.g, x).subtypes.some((s) => BASICOS.includes(s)), prompt: 'Procure uma carta de terreno com um tipo básico de terreno' });
        if (achados.length) yield* putOntoBattlefield(c.g, [{ id: achados[0], controller: dono }], 'search');
        shuffleLibrary(c.g, dono);
      }, {
        zones: ['hand'],
        targets: [t.permanent(and(is.opponents, or(is.artifact, is.enchantment, and(is.land, not(is.basic)))), 'artefato, encantamento ou terreno não básico alvo que um oponente controla')],
        // CR 601.2f, 602.2b: reduz só o genérico
        selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isLegendary(c.g, id)).length }),
        text: 'Canalizar — {1}{G}, Descarte esta carta: Destrua o artefato, encantamento ou terreno não básico alvo que um oponente controla. Esse jogador pode procurar no grimório dele uma carta de terreno com um tipo básico de terreno, colocá-la no campo e embaralhar. Custa {1} a menos para ativar para cada criatura lendária que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: descartar é parte do custo: a carta vai para o cemitério ao ativar',
    2: 'teste: sem um alvo possível, não pode ativar só para descartar',
  },
});
