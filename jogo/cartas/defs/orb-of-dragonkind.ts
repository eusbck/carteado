// Orb of Dragonkind
// {1}, {T}: Add two mana in any combination of colors. Spend this mana only to cast Dragon spells or activate abilities
// of Dragons.
// {R}, {T}, Sacrifice this artifact: Look at the top seven cards of your library. You may reveal a Dragon card from
// among them and put it into your hand. Put the rest on the bottom of your library in a random order.
import { activated, chars, chooseItems, defineCard, defineFn, mana, moveObjects, nameOf, objItem, type G } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ManaType } from '../../motor/types.ts';

// CR 106.6: mana com restrição de gasto — só mágicas de Dragon ou habilidades ativadas de Dragons
const SO_DRAGOES = 'Orb of Dragonkind:dragoes';
defineFn(SO_DRAGOES, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.obj === undefined) return false;
  if (purpose.kind === 'spell') return chars(g, purpose.obj).subtypes.includes('Dragon');
  if (purpose.kind !== 'ability') return false;
  // a habilidade na pilha aponta para a fonte; antes de ir para a pilha, o próprio objeto é a fonte
  const o = g.state.objects[purpose.obj];
  const fonte = o?.stack?.kind === 'activated' && o.stack.source !== undefined ? o.stack.source : purpose.obj;
  return !!g.state.objects[fonte] && chars(g, fonte).subtypes.includes('Dragon');
});

export default defineCard({
  name: 'Orb of Dragonkind',
  faces: [{
    abilities: [
      // '*' = cor escolhida ao ativar, uma por mana (CR 106.1a, "qualquer combinação de cores")
      mana(() => [Array<ManaType>(2).fill('*' as ManaType)], {
        cost: '{1}, {T}', restriction: SO_DRAGOES,
        text: '{1}, {T}: Adicione duas manas em qualquer combinação de cores. Gaste essa mana só para conjurar mágicas de Dragon ou ativar habilidades de Dragons.',
      }),
      activated('{R}, {T}, Sacrifice this artifact', function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 7);
        if (!topo.length) return;
        // ruling 1: carta de Dragon é a que tem o tipo de criatura Dragon, não a que tem "Dragon" no nome
        const itens = topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def }, disabled: !chars(c.g, id).subtypes.includes('Dragon') }));
        const esc = yield* chooseItems(c.g, c.you, 'Orb of Dragonkind: você pode revelar uma carta de Dragon entre as sete do topo e pô-la na mão', itens, 0, 1);
        const escolhida = esc.length ? Number(esc[0]) : null;
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
        }
        const resto = shuffle(s.rng, topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: '{R}, {T}, Sacrifique este artefato: Olhe as sete cartas do topo do seu grimório. Você pode revelar uma carta de Dragon dentre elas e colocá-la na sua mão. Coloque o resto no fundo do seu grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'teste: olha sete cartas, só uma carta de Dragon pode ir para a mão e o resto vai para o fundo',
  },
});
