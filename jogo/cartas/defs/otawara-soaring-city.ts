// Otawara, Soaring City
// {T}: Add {U}.
// Channel — {3}{U}, Discard this card: Return target artifact, creature, enchantment, or planeswalker to its owner's
// hand. This ability costs {1} less to activate for each legendary creature you control.
import { activated, controlledBy, cost, defineCard, is, isCreature, isLegendary, mana, or, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Otawara, Soaring City',
  faces: [{
    abilities: [
      mana('U'),
      // canalizar é palavra de habilidade (CR 207.2c): uma habilidade ativada da mão; descartar é custo (ruling 1)
      activated([...cost('{3}{U}'), { k: 'discardSelf' }], function* (c) {
        const id = tgt(c);
        if (id !== null) yield* returnToHand(c.g, [id]);
      }, {
        zones: ['hand'],
        targets: [t.permanent(or(is.artifact, is.creature, is.enchantment, is.planeswalker), 'artefato, criatura, encantamento ou planeswalker alvo')],
        // CR 601.2f, 602.2b: reduz só o genérico
        selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isLegendary(c.g, id)).length }),
        text: 'Canalizar — {3}{U}, Descarte esta carta: Devolva o artefato, criatura, encantamento ou planeswalker alvo para a mão do dono. Custa {1} a menos para ativar para cada criatura lendária que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: descartar é parte do custo: a carta vai para o cemitério ao ativar',
    2: 'teste: sem um alvo possível, não pode ativar só para descartar',
  },
});
