// Vorinclex, Voice of Hunger
// Trample
// Whenever you tap a land for mana, add one mana of any type that land produced.
// Whenever an opponent taps a land for mana, that land doesn't untap during its controller's next untap step.
import { defineCard, isLand, keyword, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { manaAMaisDeTerreno } from '../miku.ts';

export default defineCard({
  name: 'Vorinclex, Voice of Hunger',
  faces: [{
    abilities: [
      keyword('trample'),
      // rulings 1-2: um tipo só, à sua escolha entre os que o terreno produziu
      ...manaAMaisDeTerreno(),
      // não gera mana: é um gatilho comum, que usa a pilha. Ruling 3: resolve mesmo que Vorinclex já tenha saído
      triggered(on.custom((e, c) => (e.type === 'mana' && !!e.tappedForMana && c.g.isOpponent(c.you, e.player) && !!c.g.state.objects[e.source] && isLand(c.g, e.source) ? { terreno: e.source } : false)), function* (c) {
        const o = c.g.state.objects[c.event.terreno as ObjId];
        if (!o || o.zone !== 'battlefield') return;
        o.data.skipNextUntap = true;
        c.g.bump();
      }, { text: 'Sempre que um oponente vira um terreno para gerar mana, esse terreno não desvira durante a próxima etapa de desvirar do controlador dele.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 106.1b — os tipos de mana são branco, azul, preto, vermelho, verde e incolor (motor/types.ts ManaType)',
    2: 'regra geral: CR 605.1b — habilidade de mana desencadeada; com mais de um tipo produzido, você escolhe um deles (cartas/miku.ts manaAMaisDeTerreno)',
    3: 'teste: o terreno que o oponente virou para mana não desvira na próxima etapa de desvirar dele, só na seguinte',
  },
});