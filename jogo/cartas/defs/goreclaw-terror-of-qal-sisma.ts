// Goreclaw, Terror of Qal Sisma
// Creature spells you cast with power 4 or greater cost {2} less to cast.
// Whenever Goreclaw attacks, each creature you control with power 4 or greater gets +1/+1 and gains trample until end
// of turn.
import { creaturesOf, defineCard, on, power, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Goreclaw, Terror of Qal Sisma',
  faces: [{
    abilities: [
      // a força vista é a da mágica na pilha: marcadores com que vai entrar e efeitos de depois não contam (ruling 1)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Creature') && (spell.chars.power ?? 0) >= 4 ? { reduce: 2 } : null) },
        text: 'Mágicas de criatura com força 4 ou mais que você conjura custam {2} a menos.',
      }),
      // ruling 3: as criaturas afetadas são as que têm força 4 ou mais quando a habilidade resolve
      triggered(on.selfAttacks(), function* (c) {
        const fortes = creaturesOf(c.g, c.you).filter((id) => power(c.g, id) >= 4);
        untilEndOfTurn(c, fortes, [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'trample' }]);
      }, { text: 'Sempre que Goreclaw ataca, cada criatura com força 4 ou mais que você controla recebe +1/+1 e ganha atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: criatura de força 4 ou mais custa {2} a menos; de força menor, não',
    2: 'regra geral: CR 603.3b — o controlador escolhe a ordem dos próprios gatilhos de ataque (motor/triggers.ts)',
    3: 'teste: ao atacar, as criaturas com força 4 ou mais recebem +1/+1 e atropelar',
  },
});
