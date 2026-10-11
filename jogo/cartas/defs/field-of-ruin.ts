// Field of Ruin
// {T}: Add {C}.
// {2}, {T}, Sacrifice this land: Destroy target nonbasic land an opponent controls. Each player searches their library
// for a basic land card, puts it onto the battlefield, then shuffles.
import { activated, chars, controllerOf, defineCard, destroy, isLand, mana, searchTo, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Field of Ruin',
  faces: [{
    abilities: [
      mana('C'),
      activated('{2}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        // ruling 1: com o alvo legal, todos procuram mesmo que ele não seja destruído (indestrutível)
        // CR 101.4: cada jogador procura na ordem APNAP; cada um embaralha o próprio grimório
        for (const p of c.g.apnap()) {
          if (c.g.state.players[p].left) continue;
          yield* searchTo(c, p, (x) => isLand(c.g, x) && chars(c.g, x).supertypes.includes('Basic'), 1, 'battlefield', { prompt: 'Field of Ruin: procure uma carta de terreno básico' });
        }
      }, {
        targets: [t.land((ctx, x) => !chars(ctx.g, x).supertypes.includes('Basic') && ctx.g.isOpponent(ctx.you, controllerOf(ctx.g, x)), 'terreno não básico alvo de um oponente')],
        text: '{2}, {T}, Sacrifique este terreno: Destrua o terreno não básico alvo que um oponente controla. Cada jogador procura uma carta de terreno básico no grimório, coloca-a no campo e embaralha.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: CR 608.2b: com o alvo ilegal, não resolve e ninguém procura',
  },
});
