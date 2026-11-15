// Deadly Cover-Up
// As an additional cost to cast this spell, you may collect evidence 6.
// Destroy all creatures. If evidence was collected, exile a card from an opponent's graveyard. Then search its owner's
// graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles, then draws
// a card for each card exiled from their hand this way.
import { allCreatures, ask, chooseItems, collectEvidenceCost, defineCard, destroy, draw, exile, nameOf, objItem, searchLibrary, shuffleLibrary } from '../../motor/api.ts';
import type { Answer } from '../../motor/types.ts';

export default defineCard({
  name: 'Deadly Cover-Up',
  faces: [{
    additionalCosts: [collectEvidenceCost(6)],
    spell: {
      *effect(c) {
        yield* destroy(c.g, allCreatures(c.g));
        if (!c.paid.collectEvidence) return;
        const cem = c.g.opponents(c.you).flatMap((p) => c.g.state.zones.graveyard[p]);
        if (!cem.length) return;
        // Não é alvo: a escolha acontece depois de destruir, incluindo as criaturas que acabaram de morrer.
        const [esc] = yield* chooseItems(c.g, c.you, 'Deadly Cover-Up: exile uma carta do cemitério de um oponente', cem.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const id = Number(esc);
        const dono = c.g.state.objects[id].owner;
        const nome = nameOf(c.g, id);
        yield* exile(c.g, [id]);
        // CR 701.23a-b: a pessoa olha as zonas inteiras; pode escolher qualquer quantidade com esse nome.
        const zonas = [...c.g.state.zones.graveyard[dono], ...c.g.state.zones.hand[dono]];
        const itens = zonas.map((carta) => ({ ...objItem(c.g, carta, `${nameOf(c.g, carta)} (${c.g.state.objects[carta].zone === 'hand' ? 'mão' : 'cemitério'})`),
          card: { def: c.g.state.objects[carta].def }, disabled: nameOf(c.g, carta) !== nome }));
        // Pergunta mesmo sem cópias elegíveis: procurar permite olhar a mão inteira (CR 701.23a).
        const escolhidas = itens.length ? (yield* ask<Extract<Answer, { kind: 'select' }>>(c.g, {
          kind: 'select', player: c.you, prompt: `Deadly Cover-Up: procure cartas chamadas ${nome} na mão e no cemitério`,
          items: itens, min: 0, max: itens.filter((i) => !i.disabled).length,
        })).ids.map(Number) : [];
        const grimorio = yield* searchLibrary(c.g, c.you, dono, {
          filter: (carta) => nameOf(c.g, carta) === nome, max: c.g.state.zones.library[dono].length,
          prompt: `Deadly Cover-Up: procure cartas chamadas ${nome} no grimório`,
        });
        const todas = [...escolhidas, ...grimorio];
        const daMao = new Set(c.g.state.zones.hand[dono]);
        const exiladas = yield* exile(c.g, todas);
        const repor = exiladas.filter((novo, i) => novo !== null && c.g.state.objects[novo]?.zone === 'exile' && daMao.has(todas[i])).length;
        shuffleLibrary(c.g, dono);
        if (repor) yield* draw(c.g, dono, repor);
      },
    },
  }],
  rulings: {
    1: 'teste: pode exilar terrenos básicos e repõe somente as cartas exiladas da mão',
    2: 'teste: CR 701.59b: indícios insuficientes desabilitam o custo opcional',
    3: 'teste: CR 601.2h: os indícios são exilados como custo, antes de o oponente receber prioridade',
  },
});
