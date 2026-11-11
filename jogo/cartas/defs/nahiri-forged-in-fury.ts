// Nahiri, Forged in Fury
// Affinity for Equipment (This spell costs {1} less to cast for each Equipment you control.)
// Whenever an equipped creature you control attacks, exile the top card of your library. You may play that card this
// turn. You may cast Equipment spells this way without paying their mana costs.
import { allowPlay, chars, controllerOf, defineCard, exile, isSubtype, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';
import { equipamentosDe } from '../jin.ts';

const equipada = (g: G, id: ObjId) => g.state.zones.battlefield.some((x) => g.state.objects[x].attachedTo === id && chars(g, x).subtypes.includes('Equipment'));

export default defineCard({
  name: 'Nahiri, Forged in Fury',
  faces: [{
    // afinidade com Equipamentos (CR 702.41a)
    selfCost: (c) => ({ reduce: equipamentosDe(c.g, c.you).length }),
    abilities: [
      { kind: 'static', kw: 'affinity', param: 'Equipment', text: 'Afinidade com Equipamentos (Esta mágica custa {1} a menos para ser conjurada para cada Equipamento que você controla.)' },
      // rulings 1-2: um gatilho por criatura equipada que ataca, não importa quantos Equipamentos
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => controllerOf(c.g, a.obj) === c.you && equipada(c.g, a.obj)).map((a) => ({ atacante: a.obj }))
        : false)), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        if (ex === null || ex === undefined) return;
        // rulings 3-8: vale até o fim do turno, mesmo sem Nahiri; Equipamento pode ser conjurado de graça ou pagando
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
        if (isSubtype(c.g, ex, 'Equipment')) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' }, { free: true, spellsOnly: true });
      }, { text: 'Sempre que uma criatura equipada que você controla ataca, exile a carta do topo do seu grimório. Você pode jogar aquela carta neste turno. Você pode conjurar mágicas de Equipamento dessa forma sem pagar o custo de mana delas.' }),
    ],
  }],
  rulings: {
    1: 'teste: um gatilho por criatura equipada que ataca',
    2: 'teste: um gatilho por criatura equipada que ataca',
    3: 'regra geral: CR 611.2a — a permissão vale até o fim do turno, mesmo sem Nahiri (motor/mecanicas.ts allowPlay)',
    4: 'teste: a carta que não é Equipamento segue as regras normais e paga o custo',
    5: 'teste: o Equipamento exilado pode ser conjurado de graça ou pagando o custo',
    6: 'regra geral: CR 107.3b — sem pagar o custo de mana, X é 0 (motor/stack.ts)',
    7: 'regra geral: CR 305.2 — o terreno exilado só entra como a jogada de terreno do turno (motor/priority.ts)',
    8: 'regra geral: CR 611.2a — a carta não jogada continua exilada (motor/mecanicas.ts allowPlay)',
  },
});
