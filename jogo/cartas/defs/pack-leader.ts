// Pack Leader
// Other Dogs you control get +1/+1.
// Whenever this creature attacks, prevent all combat damage that would be dealt this turn to Dogs you control.
import { and, anthem, defineCard, is, on, ruleEffect, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Pack Leader',
  faces: [{
    abilities: [
      anthem(and(is.subtype('Dog'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }], 'Os outros Dogs que você controla recebem +1/+1.'),
      // ruling 2: o efeito continua valendo se Pack Leader sair do campo; vale para os Dogs que você controlar na hora do dano
      triggered(on.selfAttacks(), function* (c) {
        ruleEffect(c, 'rule:preventCombatDamageToSubtype', { kind: 'endOfTurn' }, { params: { controller: c.you, subtype: 'Dog' } });
      }, { text: 'Sempre que esta criatura ataca, previna todo o dano de combate que seria causado neste turno aos Dogs que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.6 — o dano fica marcado até a limpeza; sem o bônus, pode virar letal (motor/sba.ts)',
    2: 'teste: ao atacar, o dano de combate aos seus Dogs é prevenido, mesmo que Pack Leader saia do campo',
  },
});
