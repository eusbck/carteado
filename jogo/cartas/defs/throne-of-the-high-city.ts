// Throne of the High City
// {T}: Add {C}.
// {4}, {T}, Sacrifice this land: You become the monarch.
import { activated, becomeMonarch, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Throne of the High City',
  faces: [{
    abilities: [
      mana('C'),
      // CR 725: o monarca compra no fim do turno dele e perde o título para quem lhe causar dano de combate
      activated('{4}, {T}, Sacrifice this land', function* (c) {
        becomeMonarch(c.g, c.you);
      }, { text: '{4}, {T}, Sacrifique este terreno: Você se torna o monarca.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 725.2 — o gatilho de compra do monarca já disparado resolve mesmo que outro vire monarca (motor/builtin.ts)',
    2: 'não se aplica: nenhuma carta dos decks dispara quando você se torna o monarca',
    3: 'teste: CR 725.1: o jogo começa sem monarca; ao resolver, você se torna o monarca',
    4: 'teste: CR 725.2: o monarca compra uma carta no começo da etapa final dele',
  },
});
