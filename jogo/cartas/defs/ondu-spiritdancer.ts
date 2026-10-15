// Ondu Spiritdancer
// Whenever an enchantment you control enters, you may create a token that's a copy of it. Do this only once each turn.
import { chars, controllerOf, copiableValues, createTokens, defineCard, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'Ondu Spiritdancer:copia';
const jaCopiou = (g: G, id: ObjId) => g.state.objects[id]?.usedThisTurn[CHAVE] === g.state.turn.number;

export default defineCard({
  name: 'Ondu Spiritdancer',
  faces: [{
    abilities: [
      // ruling 1: depois de criar a cópia, não dispara mais no turno
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && controllerOf(c.g, e.obj) === c.you
        && !!c.g.state.objects[e.obj] && chars(c.g, e.obj).types.includes('Enchantment') && !jaCopiou(c.g, c.source)
        ? { encantamento: e.obj } : false)), function* (c) {
        // ruling 2: com várias na pilha, só uma cria a cópia
        if (jaCopiou(c.g, c.source)) return;
        const id = c.event.encantamento as ObjId;
        if (!(yield* yesNo(c.g, c.you, `Ondu Spiritdancer: criar uma ficha que é cópia de ${nameOf(c.g, id)}? (só uma vez por turno)`))) return;
        const fonte = c.g.state.objects[c.source];
        if (fonte) fonte.usedThisTurn[CHAVE] = c.g.state.turn.number;
        // rulings 4-7: os valores copiáveis, do jeito que o encantamento existiu por último no campo
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, { text: 'Sempre que um encantamento que você controla entra, você pode criar uma ficha que é cópia dele. Faça isso apenas uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: cria a cópia uma vez por turno; o encantamento seguinte do turno não dispara',
    2: 'teste: com dois gatilhos na pilha, só um cria a cópia',
    3: 'regra geral: CR 303.4f — a ficha de Aura escolhe o que encantar ao entrar (motor/actions.ts putOntoBattlefield)',
    4: 'regra geral: CR 707.2 — só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.2 — o X do custo de mana conta 0 na cópia',
    6: 'regra geral: CR 707.2 — a cópia de ficha usa os valores da ficha original (CopyValues da ficha)',
    7: 'regra geral: CR 707.3 — se o encantamento copiava outro, a ficha é cópia desse outro (motor/mecanicas.ts copiableValues)',
    8: 'teste: cria a cópia uma vez por turno; o encantamento seguinte do turno não dispara',
  },
});
