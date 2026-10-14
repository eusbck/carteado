// Ram Through
// Target creature you control deals damage equal to its power to target creature you don't control. If the creature
// you control has trample, excess damage is dealt to that creature's controller instead.
import { controllerOf, dealDamage, defineCard, hasKw, is, not, power, t, tgt, toughness } from '../../motor/api.ts';

export default defineCard({
  name: 'Ram Through',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla'), t.creature(not(is.yours), 'criatura alvo que você não controla')],
      *effect(c) {
        const minha = tgt(c, 0);
        const outra = tgt(c, 1);
        // ruling 1 (CR 608.2b): com um dos alvos ilegal, não há dano
        if (minha === null || outra === null) return;
        const n = power(c.g, minha);
        if (n <= 0) return;
        if (!hasKw(c.g, minha, 'trample')) {
          dealDamage(c.g, [{ source: minha, target: { kind: 'obj', id: outra }, amount: n, combat: false }]);
          return;
        }
        // ruling 2: o letal é a resistência menos o dano marcado, ignorando indestrutível, prevenção e substituição;
        // com toque mortífero, 1 basta (ruling 3). O dano à criatura e o excedente são simultâneos (ruling 4)
        const base = Math.max(0, toughness(c.g, outra) - (c.g.state.objects[outra].damage ?? 0));
        const letal = hasKw(c.g, minha, 'deathtouch') ? Math.min(1, base) : base;
        const naCriatura = Math.min(n, letal);
        const excedente = n - naCriatura;
        dealDamage(c.g, [
          { source: minha, target: { kind: 'obj', id: outra }, amount: naCriatura, combat: false },
          { source: minha, target: { kind: 'player', id: controllerOf(c.g, outra) }, amount: excedente, combat: false },
        ]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com um dos alvos ilegal, a criatura não causa dano (if no efeito)',
    2: 'teste: com atropelar, o excedente além do letal vai para o controlador da outra criatura',
    3: 'teste: com atropelar e toque mortífero, 1 basta e o resto vai para o controlador',
    4: 'teste: com atropelar, o excedente além do letal vai para o controlador da outra criatura',
  },
});
