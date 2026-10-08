// Kalitas, Traitor of Ghet
// Lifelink
// If a nontoken creature an opponent controls would die, instead exile that card and create a 2/2 black Zombie
// creature token.
// {2}{B}, Sacrifice another Vampire or Zombie: Put two +1/+1 counters on Kalitas.
import { activated, addCounters, controllerOf, createTokens, defineCard, isCreature, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Kalitas, Traitor of Ghet',
  faces: [{
    abilities: [
      ...keywords('lifelink'),
      // efeito de substituição (CR 614.1a, 614.6): "morreria" = iria do campo para o cemitério. Quem cria a ficha é
      // quem controlava o Kalitas quando a criatura iria morrer (ruling 3: vale mesmo se ele morrer junto)
      staticAbility({
        rules: {
          leavesBattlefield: (c, o, dest) => {
            if (dest !== 'graveyard' || o.isToken || !isCreature(c.g, o.id) || !c.g.isOpponent(c.you, controllerOf(c.g, o.id))) return null;
            const { g, you } = c;
            return { dest: 'exile', label: 'Kalitas, Traitor of Ghet (exila e cria um Zumbi)', *then() { yield* createTokens(g, you, 'Zombie 2/2', 1); } };
          },
        },
        text: 'Se uma criatura que não seja ficha controlada por um oponente fosse morrer, em vez disso, exile aquela carta e crie uma ficha de criatura Zumbi preta 2/2.',
      }),
      // ruling 4: "outro" — o próprio Kalitas não serve, nem que tenha virado Zumbi
      activated('{2}{B}, Sacrifice another Vampire or Zombie', function* (c) {
        if (c.g.state.objects[c.source]) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: '{2}{B}, Sacrifique outro Vampiro ou Zumbi: Coloque dois marcadores +1/+1 em Kalitas.' }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura do oponente vai para o exílio: "quando morre" não dispara',
    2: 'teste: ficha do oponente vai para o cemitério normalmente e não cria Zumbi',
    3: 'teste: Kalitas morrendo junto com as criaturas do oponente ainda exila e cria os Zumbis',
    4: 'teste: não dá para sacrificar o próprio Kalitas para a última habilidade',
  },
});
