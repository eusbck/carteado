// Shark Typhoon
// Whenever you cast a noncreature spell, create an X/X blue Shark creature token with flying, where X is that spell's
// mana value.
// Cycling {X}{1}{U} ({X}{1}{U}, Discard this card: Draw a card.)
// When you cycle this card, create an X/X blue Shark creature token with flying.
import { createTokens, cycling, defineCard, is, lkiChars, lkiObj, not, on, triggered, type Ctx, type Gen } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** ficha Shark X/X azul com voar: a força e a resistência vêm de quem a cria */
function* tubarao(c: Ctx, x: number): Gen<void> {
  yield* createTokens(c.g, c.you, { copyOf: { def: 'Shark', face: 0, except: { power: x, toughness: x } } }, 1);
}

const ciclagem = cycling('{X}{1}{U}');

export default defineCard({
  name: 'Shark Typhoon',
  faces: [{
    abilities: [
      triggered(on.youCast(not(is.creature)), function* (c) {
        // ruling 1: o valor de mana inclui o X escolhido; ruling 3: resolve mesmo que a mágica tenha saído da pilha
        const x = lkiChars(c.g, c.event.spell as ObjId)?.manaValue ?? 0;
        yield* tubarao(c, x);
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, crie uma ficha de criatura Shark azul X/X com voar, onde X é o valor de mana dessa mágica.' }),
      ciclagem,
      // CR 702.29c: "quando você cicla esta carta" = quando você a descarta para pagar o custo de ciclagem; dispara da
      // zona em que a carta foi parar. O X é o escolhido para o custo de ciclagem (CR 107.3e).
      triggered(on.custom((e, c) => {
        if (e.type !== 'activate' || e.abilityId !== ciclagem.id) return false;
        const antes = lkiObj(c.g, e.source);
        if (!antes || antes.card === null || antes.card !== c.obj.card) return false;
        return { x: c.g.state.objects[e.obj]?.stack?.x ?? 0 };
      }), function* (c) {
        // ruling 6: com X = 0, a ficha 0/0 morre logo depois
        yield* tubarao(c, Number(c.event.x ?? 0));
      }, { zones: ['graveyard', 'exile'], text: 'Quando você cicla esta carta, crie uma ficha de criatura Shark azul X/X com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: o X de uma mágica com {X} no custo entra no valor de mana',
    2: 'regra geral: CR 702.29a, 113.3b-c — a ciclagem e o gatilho são habilidades, não mágicas',
    3: 'teste: o gatilho resolve antes da mágica e mesmo que ela seja anulada',
    4: 'regra geral: CR 603.2, 702.29c — a ciclagem e o gatilho de ciclar são habilidades separadas na pilha',
    5: 'teste: ciclar: o gatilho cria o Shark X/X antes de comprar a carta',
    6: 'teste: ciclar com X = 0 cria um Shark 0/0, que morre',
  },
});
