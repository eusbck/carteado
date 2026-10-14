// Gisela, Blade of Goldnight
// Flying, first strike
// If a source would deal damage to an opponent or a permanent an opponent controls, that source deals double that
// damage to that player or permanent instead.
// If a source would deal damage to you or a permanent you control, prevent half that damage, rounded up.
import { controllerOf, defineCard, keywords, staticAbility } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { TargetRef } from '../../motor/types.ts';

function dono(c: SCtx, alvo: TargetRef): number | null {
  if (alvo.kind === 'player') return alvo.id;
  return c.g.state.objects[alvo.id] ? controllerOf(c.g, alvo.id) : null;
}

export default defineCard({
  name: 'Gisela, Blade of Goldnight',
  faces: [{
    abilities: [
      ...keywords('flying', 'first strike'),
      // ruling 1: qualquer fonte, inclusive dos próprios oponentes; ruling 3: o dano já dividido é que é dobrado
      staticAbility({
        rules: { damageDouble: (c, _fonte, alvo) => { const p = dono(c, alvo); return p !== null && c.g.isOpponent(c.you, p); } },
        text: 'Se uma fonte fosse causar dano a um oponente ou a uma permanente que um oponente controla, em vez disso essa fonte causa o dobro desse dano.',
      }),
      // CR 615.1: prevenção de metade, arredondada para cima
      staticAbility({
        rules: { preventsSomeDamage: (c, alvo, _fonte, quantidade) => (dono(c, alvo) === c.you ? Math.ceil(quantidade / 2) : 0) },
        text: 'Se uma fonte fosse causar dano a você ou a uma permanente que você controla, previna metade desse dano, arredondada para cima.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: dobra o dano a oponentes e às permanentes deles, de qualquer fonte; previne metade (para cima) do dano a você',
    2: 'regra geral: CR 616.1 — o motor aplica primeiro as substituições que mudam a quantidade (dobrar) e depois as prevenções',
    3: 'teste: atropelar: 2 no bloqueador e 3 no jogador viram 4 e 6',
  },
});
