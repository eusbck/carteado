// Restless Prairie
// This land enters tapped.
// {T}: Add {G} or {W}.
// {2}{G}{W}: This land becomes a 3/3 green and white Llama creature until end of turn. It's still a land.
// Whenever this land attacks, other creatures you control get +1/+1 until end of turn.
import { activated, controlledBy, defineCard, isCreature, land, mana, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Restless Prairie',
  faces: [{
    abilities: [
      land.tapped(),
      mana(['G', 'W']),
      // ruling 2: como criatura, o enjoo de invocação vale normalmente (CR 302.6)
      activated('{2}{G}{W}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // continua terreno: só acrescenta o tipo criatura e o subtipo Llama (CR 613.1d, camada 4)
        untilEndOfTurn(c, [c.source], [
          { k: 'addTypes', types: ['Creature'], subtypes: ['Llama'] }, { k: 'setPT', p: 3, t: 3 }, { k: 'setColors', colors: ['G', 'W'] },
        ]);
      }, { text: '{2}{G}{W}: Até o fim do turno, este terreno vira uma criatura Llama verde e branca 3/3. Continua sendo terreno.' }),
      // ruling 1: o gatilho é do terreno, vale mesmo se ele virou criatura por outro efeito
      triggered(on.selfAttacks(), function* (c) {
        // CR 611.2c: afeta só as criaturas que você controla na resolução
        const outras = controlledBy(c.g, c.you, (id) => id !== c.source && isCreature(c.g, id));
        untilEndOfTurn(c, outras, [{ k: 'pt', p: 1, t: 1 }]);
      }, { text: 'Sempre que este terreno ataca, as outras criaturas que você controla recebem +1/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: dispara mesmo se virou criatura por outro efeito',
    2: 'teste: CR 302.6: sem controle contínuo desde o início do turno, não ataca nem usa a mana',
  },
});
