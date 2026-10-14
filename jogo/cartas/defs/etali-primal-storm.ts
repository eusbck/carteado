// Etali, Primal Storm
// Whenever Etali attacks, exile the top card of each player's library, then you may cast any number of spells from
// among those cards without paying their mana costs.
import { castSpell, chooseItems, defineCard, exile, isLand, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Etali, Primal Storm',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const topos = c.g.apnap().map((p) => c.g.state.zones.library[p][0]).filter((id): id is ObjId => id !== undefined);
        const exiladas = (yield* exile(c.g, topos)).filter((id): id is ObjId => id !== null && id !== undefined);
        // ruling 4: você escolhe a ordem; cada mágica vai para a pilha e resolve depois desta habilidade (ruling 2)
        const recusadas = new Set<ObjId>();
        for (;;) {
          const cands = exiladas.filter((id) => !recusadas.has(id) && c.g.state.objects[id]?.zone === 'exile' && !isLand(c.g, id));
          if (!cands.length) break;
          const [esc] = yield* chooseItems(c.g, c.you, 'Etali: conjurar uma das cartas exiladas sem pagar o custo de mana?',
            [{ id: 'parar', label: 'Não conjurar mais nenhuma' }, ...cands.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
          if (esc === 'parar') break;
          const id = Number(esc);
          // ruling 1: X = 0; ruling 3: sem custos alternativos, mas os adicionais obrigatórios são pagos
          const r = yield* castSpell(c.g, c.you, id, { key: 'free', label: 'sem pagar o custo de mana', zone: 'exile', free: true, duringResolution: true });
          if (r === null) recusadas.add(id);
        }
      }, { text: 'Sempre que Etali ataca, exile a carta do topo do grimório de cada jogador; depois você pode conjurar quantas mágicas quiser dentre essas cartas sem pagar os custos de mana delas.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — conjurada sem pagar o custo de mana, X é 0',
    2: 'teste: ao atacar, exila o topo de cada grimório e conjura de graça a mágica de um oponente; o terreno fica no exílio',
    3: 'regra geral: CR 118.9a — sem pagar o custo de mana não se usa custo alternativo; os adicionais são pagos (motor/stack.ts castSpell)',
    4: 'regra geral: CR 608.2g — as mágicas vão para a pilha durante a resolução, na ordem escolhida, e resolvem depois',
    5: 'teste: ao atacar, exila o topo de cada grimório e conjura de graça a mágica de um oponente; o terreno fica no exílio',
    6: 'regra geral: CR 508.1 — os atacantes já foram declarados; quem entra depois não ataca',
    7: 'regra geral: CR 800.4a — quem sai da partida leva consigo o que é dele (motor/sba.ts)',
  },
});
