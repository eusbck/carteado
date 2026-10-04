// Deadly Brew
// Each player sacrifices a creature or planeswalker of their choice. If you sacrificed a permanent this way, you may
// return another permanent card from your graveyard to your hand.
import { chooseItems, defineCard, eachSacrifices, isCreature, isPermanentCard, isType, lkiObj, moveObjects, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Deadly Brew',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 3: na ordem APNAP cada um escolhe; depois sacrificam ao mesmo tempo
        const sac = yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker'), 1, 'uma criatura ou planeswalker');
        const meu = sac.find((id) => lkiObj(c.g, id)?.controller === c.you);
        if (meu === undefined) return;
        // ruling 2: não pode ser a própria carta sacrificada
        const novo = c.g.state.lki[meu]?.newId ?? null;
        const opcoes = c.g.state.zones.graveyard[c.you].filter((id) => id !== novo && isPermanentCard(c.g, id));
        if (opcoes.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, 'Deadly Brew: você pode devolver outra carta de permanente do seu cemitério para a mão', opcoes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (pick.length) yield* moveObjects(c.g, [{ id: Number(pick[0]), to: 'hand' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: eachSacrifices obriga quem tem criatura ou planeswalker a sacrificar',
    2: 'teste: não pode devolver a carta que sacrificou',
    3: 'regra geral: CR 101.4 — escolhas em ordem APNAP e sacrifício simultâneo (eachSacrifices)',
    4: 'teste: escolhe o que devolver depois dos sacrifícios',
  },
});
