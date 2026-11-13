// Gilgamesh, Master-at-Arms
// Whenever Gilgamesh enters or attacks, look at the top six cards of your library. You may put any number of Equipment
// cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order. When you
// put one or more Equipment onto the battlefield this way, you may attach one of them to a Samurai you control.
import {
  attach, chooseItems, controlledBy, defineAbility, defineCard, isCreature, isSubtype, nameOf, objItem, on, podeEquipar, putOntoBattlefield,
  reflexive, triggered,
} from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ChoiceItem, ObjId } from '../../motor/types.ts';

// "Quando você coloca um ou mais Equipamentos no campo desta forma" (gatilho reflexivo, CR 603.12)
const ANEXAR = defineAbility('Gilgamesh, Master-at-Arms:anexar', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const eqs = ((c.data.equipamentos ?? []) as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  const samurais = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isSubtype(c.g, id, 'Samurai'));
  // ruling 1: só os pares em que o Equipamento pode ser anexado à criatura
  const pares = eqs.flatMap((e) => samurais.filter((s) => podeEquipar(c.g, e, s)).map((s) => ({ e, s })));
  if (!pares.length) return;
  const itens = pares.map((p, i) => ({ id: String(i), label: `${nameOf(c.g, p.e)} em ${nameOf(c.g, p.s)}` }));
  const [esc] = yield* chooseItems(c.g, c.you, 'Gilgamesh: você pode anexar um dos Equipamentos a um Samurai seu', itens, 0, 1);
  if (esc === undefined) return;
  const p = pares[Number(esc)];
  attach(c.g, p.e, p.s);
}, { text: 'Quando você coloca um ou mais Equipamentos no campo desta forma, você pode anexar um deles a um Samurai que você controla.' }));

const OLHAR: EffectFn = function* (c) {
  const s = c.g.state;
  const topo = s.zones.library[c.you].slice(0, 6);
  if (!topo.length) return;
  const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !isSubtype(c.g, id, 'Equipment') }));
  const pick = itens.some((i) => !i.disabled)
    ? yield* chooseItems(c.g, c.you, 'Gilgamesh: coloque no campo quantos Equipamentos quiser', itens, 0, itens.filter((i) => !i.disabled).length)
    : [];
  const escolhidos = pick.map(Number);
  const novos = escolhidos.length ? yield* putOntoBattlefield(c.g, escolhidos.map((id) => ({ id, controller: c.you })), 'effect') : [];
  const resto = shuffle(s.rng, topo.filter((id) => !escolhidos.includes(id) && s.objects[id]?.zone === 'library'));
  s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
  c.g.bump();
  if (novos.length) reflexive(c, ANEXAR.id!, { equipamentos: novos });
};

export default defineCard({
  name: 'Gilgamesh, Master-at-Arms',
  faces: [{
    abilities: [
      triggered(on.selfEnters(), OLHAR, { text: 'Quando Gilgamesh entra, olhe as seis cartas do topo do seu grimório. Você pode colocar no campo quantas cartas de Equipamento quiser dentre elas. Coloque o resto no fundo do seu grimório em ordem aleatória. Quando fizer isso, você pode anexar um deles a um Samurai que você controla.' }),
      triggered(on.selfAttacks(), OLHAR, { text: 'Sempre que Gilgamesh ataca, olhe as seis cartas do topo do seu grimório. Você pode colocar no campo quantas cartas de Equipamento quiser dentre elas. Coloque o resto no fundo do seu grimório em ordem aleatória. Quando fizer isso, você pode anexar um deles a um Samurai que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: põe os Equipamentos escolhidos no campo, o resto vai para o fundo; o gatilho reflexivo anexa um a um Samurai',
    2: 'não se aplica: nenhuma carta dos decks tem seleção de trabalho (job select)',
  },
});
