// Masked Vandal
// Changeling (This card is every creature type.)
// When this creature enters, you may exile a creature card from your graveyard. If you do, exile target artifact or
// enchantment an opponent controls.
import { and, changeling, chooseItems, defineCard, etb, exile, is, isCreature, nameOf, objItem, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Masked Vandal',
  faces: [{
    abilities: [
      changeling(),
      // ruling 2: o alvo é escolhido ao pôr o gatilho na pilha; a carta de criatura a exilar, na resolução
      etb(function* (c) {
        const alvo = tgt(c);
        if (alvo === null) return;
        const cartas = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
        if (!cartas.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Masked Vandal: exilar uma carta de criatura do seu cemitério?', [{ id: '', label: 'Não exilar' }, ...cartas.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
        if (!esc) return;
        const [ex] = yield* exile(c.g, [Number(esc)]);
        if (ex !== null && ex !== undefined) yield* exile(c.g, [alvo]);
      }, {
        targets: [t.permanent(and(or(is.artifact, is.enchantment), is.opponents), 'artefato ou encantamento alvo que um oponente controla')],
        text: 'Quando esta criatura entra, você pode exilar uma carta de criatura do seu cemitério. Se fizer isso, exile o artefato ou encantamento alvo que um oponente controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.73a — a carta com polimorfo é de todos os tipos de criatura (motor/criaturas.ts changeling)',
    2: 'teste: exilando uma carta de criatura do seu cemitério, exila o artefato ou encantamento alvo de um oponente',
    3: 'regra geral: CR 702.73a — polimorfo vale em todas as zonas (motor/criaturas.ts changeling)',
    4: 'regra geral: CR 613.1d — um efeito que troca o tipo de criatura passa por cima do polimorfo, que vem antes na camada 4',
    5: 'regra geral: CR 613.1d — perder as habilidades (camada 6) não desfaz os tipos dados na camada 4',
  },
});
