// Comeuppance
// Prevent all damage that would be dealt to you and planeswalkers you control this turn by sources you don't control.
// If damage from a creature source is prevented this way, Comeuppance deals that much damage to that creature. If
// damage from a noncreature source is prevented this way, Comeuppance deals that much damage to the source's controller.
import { controllerOf, dealDamage, defineAbility, defineCard, isType, lkiChars, ruleEffect } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

const DEVOLVE = defineAbility<StaticDef>('Comeuppance:devolve', {
  kind: 'static',
  rules: {
    preventsSomeDamage: (c, alvo, fonte, quantidade) => {
      const meu = alvo.kind === 'player'
        ? alvo.id === c.you
        : !!c.g.state.objects[alvo.id] && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you;
      if (!meu || controllerOf(c.g, fonte) === c.you) return 0;
      // ruling 1: Comeuppance é a fonte do dano novo, que não é de combate (CR 615.5)
      // fonte criatura: o dano vai para ela; se ela já saiu do campo (o gatilho de morte de uma criatura, pela última
      // informação), não há a quem causar o dano e ele não vai para o controlador
      const criatura = !!lkiChars(c.g, fonte)?.types.includes('Creature');
      if (criatura) {
        if (c.g.state.objects[fonte]?.zone === 'battlefield') dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id: fonte }, amount: quantidade, combat: false }]);
      } else dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: controllerOf(c.g, fonte) }, amount: quantidade, combat: false }]);
      return quantidade;
    },
  },
});

export default defineCard({
  name: 'Comeuppance',
  faces: [{
    spell: {
      *effect(c) { ruleEffect(c, DEVOLVE.id!, { kind: 'endOfTurn' }); },
    },
  }],
  rulings: {
    1: 'teste: no combate do oponente: o dano das criaturas dele a você é prevenido e cada uma recebe a mesma quantidade de Comeuppance',
  },
});
