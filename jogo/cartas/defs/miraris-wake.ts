// Mirari's Wake
// Creatures you control get +1/+1.
// Whenever you tap a land for mana, add one mana of any type that land produced.
import { and, anthem, defineCard, is } from '../../motor/api.ts';
import { manaAMaisDeTerreno } from '../miku.ts';

export default defineCard({
  name: "Mirari's Wake",
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours), () => [{ k: 'pt', p: 1, t: 1 }], 'As criaturas que você controla recebem +1/+1.'),
      // rulings 2-4: um tipo só (você escolhe se o terreno produziu mais de um), sem as restrições da mana original
      ...manaAMaisDeTerreno(),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.5g — o dano marcado fica até a limpeza; sem o +1/+1, pode passar a ser letal (motor/sba.ts)',
    2: 'regra geral: CR 106.1b — os tipos de mana são branco, azul, preto, vermelho, verde e incolor (motor/types.ts ManaType)',
    3: 'regra geral: CR 605.1b — habilidade de mana desencadeada; com mais de um tipo produzido, você escolhe um deles (cartas/miku.ts manaAMaisDeTerreno)',
    4: 'teste: virando um terreno para mana, você adiciona mais uma mana do tipo que ele produziu',
  },
});