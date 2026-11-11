// Gilgamesh, Master-at-Arms
// Whenever Gilgamesh enters or attacks, look at the top six cards of your library. You may put any number of
// Equipment cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order.
// When you put one or more Equipment onto the battlefield this way, you may attach one of them to a Samurai you
// control.
import { attach, chars, chooseItems, controlledBy, defineAbility, defineCard, isCreature, moveObjects, nameOf, objItem, on, putOntoBattlefield, reflexive, triggered } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';
import { shuffle } from '../../motor/rng.ts';

const ANEXA = defineAbility('Gilgamesh, Master-at-Arms:anexa', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const postos = ((c.data.postos as number[]) ?? []).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  const samurais = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && chars(c.g, id).subtypes.includes('Samurai'));
  if (!postos.length || !samurais.length) return;
  const [eq] = yield* chooseItems(c.g, c.you, 'Anexe um dos Equipamentos a um Samurai (opcional)', postos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
  if (eq === undefined) return;
  const [sam] = yield* chooseItems(c.g, c.you, 'Escolha o Samurai', samurais.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
  if (sam !== undefined) attach(c.g, Number(eq), Number(sam)); // ruling 1: só se puder anexar
}, { text: 'Quando você coloca um ou mais Equipamentos no campo assim, você pode anexar um deles a um Samurai que você controla.' }));

const efeito: EffectFn = function* (c) {
  const s = c.g.state;
  const topo = s.zones.library[c.you].slice(0, 6);
  if (!topo.length) return;
  const eqs = topo.filter((id) => chars(c.g, id).subtypes.includes('Equipment'));
  const esc = eqs.length ? yield* chooseItems(c.g, c.you, 'Coloque no campo qualquer número de Equipamentos', eqs.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def } })), 0, eqs.length) : [];
  const ids = esc.map(Number);
  const postos = ids.length ? (yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect')).filter((x): x is number => x !== null && x !== undefined) : [];
  const resto = shuffle(s.rng, topo.filter((id) => !ids.includes(id) && s.objects[id]?.zone === 'library'));
  if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
  if (postos.length) reflexive(c, ANEXA.id!, { postos }); // CR 603.12
};

export default defineCard({
  name: 'Gilgamesh, Master-at-Arms',
  faces: [{
    abilities: [
      triggered(on.selfEnters(), efeito, { text: 'Sempre que Gilgamesh entra ou ataca, olhe as seis cartas do topo do seu grimório. Você pode colocar no campo qualquer número de cartas de Equipamento entre elas. Coloque o resto no fundo do seu grimório em ordem aleatória.' }),
      triggered(on.selfAttacks(), efeito, { text: 'Sempre que Gilgamesh ataca, olhe as seis cartas do topo do seu grimório e coloque no campo qualquer número de Equipamentos entre elas; o resto vai para o fundo em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.3b — não dá para anexar um Equipamento que não pode ir para aquela criatura (motor/actions.ts attach)',
    2: 'não se aplica: nenhum Equipamento com seleção de classe (job select) nos decks junto de Gilgamesh',
  },
});
