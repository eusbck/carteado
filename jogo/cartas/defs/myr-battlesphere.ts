// Myr Battlesphere
// When this creature enters, create four 1/1 colorless Myr artifact creature tokens.
// Whenever this creature attacks, you may tap X untapped Myr you control. If you do, this creature gets +X/+0 until end of turn and deals X damage to the player or planeswalker it's attacking.
import { attackingTarget, chooseItems, controlledBy, createTokens, dealDamage, defineCard, etb, isSubtype, nameOf, objItem, on, tap, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Myr Battlesphere",
  faces: [{
    abilities: [
      etb(function*(c) { yield* createTokens(c.g, c.you, 'Myr', 4); }, { text: 'Quando entra, crie quatro Myr artefato incolores 1/1.' }),
      triggered(on.selfAttacks(), function*(c) {
        const myr = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Myr') && !c.g.state.objects[id].tapped);
        const picked = yield* chooseItems(c.g, c.you, 'Myr Battlesphere: você pode virar Myr desvirados; cada um dá +1/+0 e causa 1 de dano', myr.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, myr.length);
        const n = picked.length;
        for (const id of picked.map(Number)) tap(c.g, id);
        if (!n) return;
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: n, t: 0 }]);
        const target = attackingTarget(c.g, c.source);
        if (target) dealDamage(c.g, [{ source: c.source, target, amount: n, combat: false }]);
      }, { text: 'Quando ataca, você pode virar X Myr desvirados que controla. Recebe +X/+0 e causa X de dano ao jogador ou planeswalker que está atacando.' }),
    ]
  }],
  rulings: {
    "1": "CR 608.2d: X é a quantidade de Myr escolhidos na resolução, limitada pelos desvirados controlados.",
    "2": "CR 302.6: teste: pode virar Myr recém-criados; não é custo com símbolo {T}.",
    "3": "CR 608.2h: teste: mesmo que a Battlesphere tenha saído, pode virar os Myr e causar dano ao último defensor conhecido."
  },
});
