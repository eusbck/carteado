// Captain Kirk, Boldly Going
// Vigilance
// Spacecraft creatures you control get +3/+3.
// Whenever Captain Kirk enters or attacks, search your library and/or graveyard for a basic land card or a card named
// Starship Enterprise, reveal it, and put it into your hand. If you search your library this way, shuffle.
import { anthem, chars, chooseOne, controllerOf, defineCard, isCreature, isLand, keyword, moveObjects, nameOf, on, searchLibrary, shuffleLibrary, triggered } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import type { ChoiceItem, ObjId } from '../../motor/types.ts';
import { jog, obj, reg } from '../../motor/registro.ts';

const serve = (c: Ctx, id: ObjId): boolean => (isLand(c.g, id) && chars(c.g, id).supertypes.includes('Basic')) || nameOf(c.g, id) === 'Starship Enterprise';

function* busca(c: Ctx): Gen<void> {
  const s = c.g.state;
  const doCemiterio = s.zones.graveyard[c.you].filter((id) => serve(c, id));
  const GRIMORIO = 'grimorio';
  // CR 701.23: procurar no grimório e/ou no cemitério; acha uma carta só
  const itens: ChoiceItem[] = [
    { id: GRIMORIO, label: 'Procurar no grimório' },
    ...doCemiterio.map((id) => ({ id: String(id), label: `${nameOf(c.g, id)} (cemitério)`, obj: id, card: { def: s.objects[id].def } })),
  ];
  const esc = doCemiterio.length ? yield* chooseOne(c.g, c.you, 'Captain Kirk: pegue um terreno básico ou Starship Enterprise do cemitério, ou procure no grimório', itens) : GRIMORIO;
  let carta: ObjId | null = null;
  if (esc === GRIMORIO) {
    const achou = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => serve(c, id), prompt: 'Procure uma carta de terreno básico ou uma carta chamada Starship Enterprise' });
    carta = achou[0] ?? null;
  } else carta = Number(esc);
  if (carta !== null) {
    reg(c.g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${obj(carta)}.`;
    yield* moveObjects(c.g, [{ id: carta, to: 'hand' }], 'search');
  }
  if (esc === GRIMORIO) shuffleLibrary(c.g, c.you);
}

const TEXTO = 'Sempre que Captain Kirk entra ou ataca, procure no seu grimório e/ou no seu cemitério uma carta de terreno básico ou uma carta chamada Starship Enterprise, revele-a e coloque-a na sua mão. Se você procurar no grimório desta forma, embaralhe.';

export default defineCard({
  name: 'Captain Kirk, Boldly Going',
  faces: [{
    abilities: [
      keyword('vigilance'),
      anthem((c, id) => isCreature(c.g, id) && controllerOf(c.g, id) === c.you && chars(c.g, id).subtypes.includes('Spacecraft'),
        () => [{ k: 'pt', p: 3, t: 3 }], 'As criaturas Spacecraft que você controla recebem +3/+3.'),
      triggered(on.selfEnters(), busca, { text: TEXTO }),
      triggered(on.selfAttacks(), busca, { text: TEXTO }),
    ],
  }],
  rulings: {},
});
