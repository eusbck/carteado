// Akroma's Will
// Choose one. If you control a commander as you cast this spell, you may choose both instead.
// • Creatures you control gain flying, vigilance, and double strike until end of turn.
// • Creatures you control gain lifelink, indestructible, and protection from each color until end of turn.
import { controlledBy, creaturesOf, defineCard, modal, untilEndOfTurn } from '../../motor/api.ts';
import type { Mod } from '../../motor/types.ts';
import { ehComandante } from '../vingadores.ts';

const CORES = ['W', 'U', 'B', 'R', 'G'] as const;

export default defineCard({
  name: "Akroma's Will",
  faces: [{
    spell: {
      // rulings 2-6: qualquer comandante que você controle, verificado ao escolher os modos (CR 601.2b)
      modes: modal(1, (c) => (controlledBy(c.g, c.you, (id) => ehComandante(c.g, id)).length > 0 ? 2 : 1), [
        {
          text: 'As criaturas que você controla ganham voar, vigilância e golpe duplo até o fim do turno',
          *effect(c) {
            untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'double strike' }]);
          },
        },
        {
          text: 'As criaturas que você controla ganham vínculo com a vida, indestrutível e proteção contra cada cor até o fim do turno',
          *effect(c) {
            // ruling 1: proteção contra cada uma das cinco cores; incolor não é cor (CR 105.2c)
            const mods: Mod[] = [{ k: 'addKeyword', kw: 'lifelink' }, { k: 'addKeyword', kw: 'indestructible' },
              ...CORES.map((cor): Mod => ({ k: 'addKeyword', kw: 'protection', param: `color:${cor}` }))];
            untilEndOfTurn(c, creaturesOf(c.g, c.you), mods);
          },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: proteção contra as cinco cores, não contra incolor',
    2: 'teste: controlando um comandante, pode escolher os dois modos; sem ele, só um',
    3: 'regra geral: CR 601.2 — enquanto se conjura a mágica, ninguém pode agir (motor/stack.ts)',
    4: 'teste: controlando um comandante, pode escolher os dois modos; sem ele, só um',
    5: 'teste: controlando um comandante, pode escolher os dois modos; sem ele, só um',
    6: 'regra geral: CR 601.2b — os modos são fixados ao conjurar; perder o comandante depois não muda nada (motor/stack.ts)',
  },
});
