// Gilgamesh, Master-at-Arms
// Whenever Gilgamesh enters or attacks, look at the top six cards of your library. You may put any number of
// Equipment cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order.
// When you put one or more Equipment onto the battlefield this way, you may attach one of them to a Samurai you
// control.
import { attach, chooseItems, creaturesOf, defineAbility, defineCard, isSubtype, nameOf, objItem, on, putOntoBattlefield, reflexive, triggered } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ChoiceItem, ObjId } from '../../motor/types.ts';

// CR 603.12: gatilho reflexivo "quando você colocar um ou mais Equipamentos no campo desta forma"
const ANEXA = defineAbility('Gilgamesh, Master-at-Arms:anexa', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const s = c.g.state;
  const eqs = ((c.event.equipamentos ?? []) as ObjId[]).filter((id) => s.objects[id]?.zone === 'battlefield');
  const samurais = creaturesOf(c.g, c.you).filter((id) => isSubtype(c.g, id, 'Samurai'));
  if (!eqs.length || !samurais.length) return;
  const [eq] = yield* chooseItems(c.g, c.you, 'Gilgamesh: você pode anexar um dos Equipamentos a um Samurai que você controla', eqs.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
  if (eq === undefined) return;
  const [sam] = yield* chooseItems(c.g, c.you, `Gilgamesh: escolha o Samurai que recebe ${nameOf(c.g, Number(eq))}`, samurais.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
  // ruling 1: se o Equipamento não pode ser anexado a essa criatura, nada acontece (CR 301.5c)
  if (sam !== undefined) attach(c.g, Number(eq), Number(sam));
}, { text: 'Quando você colocar um ou mais Equipamentos no campo desta forma, você pode anexar um deles a um Samurai que você controla.' }));

function* arsenal(c: Ctx) {
  const s = c.g.state;
  const topo = s.zones.library[c.you].slice(0, 6);
  if (!topo.length) return;
  const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !isSubtype(c.g, id, 'Equipment') }));
  const escolhidas = itens.some((i) => !i.disabled)
    ? (yield* chooseItems(c.g, c.you, 'Gilgamesh: escolha quantas cartas de Equipamento quiser para colocar no campo', itens, 0, itens.filter((i) => !i.disabled).length)).map(Number)
    : [];
  const novos = escolhidas.length
    ? (yield* putOntoBattlefield(c.g, escolhidas.map((id) => ({ id, controller: c.you })), 'effect')).filter((x): x is ObjId => x !== null && x !== undefined)
    : [];
  // o resto vai para o fundo em ordem aleatória
  const resto = shuffle(s.rng, topo.filter((id) => s.objects[id]?.zone === 'library'));
  s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
  c.g.bump();
  if (novos.length) reflexive(c, ANEXA.id!, {}, { equipamentos: novos });
}

const TEXTO = 'Sempre que Gilgamesh entra ou ataca, olhe as seis cartas do topo do seu grimório. Você pode colocar quantas cartas de Equipamento quiser dentre elas no campo de batalha. Coloque o resto no fundo do seu grimório em ordem aleatória. Quando você colocar um ou mais Equipamentos no campo desta forma, você pode anexar um deles a um Samurai que você controla.';

export default defineCard({
  name: 'Gilgamesh, Master-at-Arms',
  faces: [{
    abilities: [
      triggered(on.selfEnters(), arsenal, { text: TEXTO }),
      triggered(on.selfAttacks(), arsenal, { text: TEXTO }),
    ],
  }],
  rulings: {
    1: 'teste: um Equipamento que não pode ser anexado ao Samurai continua desanexado',
    2: 'regra geral: CR 603.3b — gatilhos que disparam juntos vão para a pilha na ordem que o controlador escolher (motor/triggers.ts)',
  },
});
