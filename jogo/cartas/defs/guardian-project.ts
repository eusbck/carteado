// Guardian Project
// Whenever a nontoken creature you control enters, if it doesn't have the same name as another creature you control or
// a creature card in your graveyard, draw a card.
import { chars, controllerOf, defineCard, draw, isCreature, nameOf, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/** a criatura é a primeira com esse nome? (ruling 4: virada para baixo não tem nome, então não repete nenhum) */
function primeiraDoNome(g: G, p: PlayerId, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.faceDown) return !!o && !!o.faceDown;
  const nome = nameOf(g, id);
  const outras = g.state.zones.battlefield.some((x) => x !== id && !g.state.objects[x].faceDown && controllerOf(g, x) === p && isCreature(g, x) && nameOf(g, x) === nome);
  const noCemiterio = g.state.zones.graveyard[p].some((x) => chars(g, x).types.includes('Creature') && nameOf(g, x) === nome);
  return !outras && !noCemiterio;
}

export default defineCard({
  name: 'Guardian Project',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.to !== 'battlefield' || e.token) return false;
        if (!c.g.state.objects[e.obj] || !isCreature(c.g, e.obj) || controllerOf(c.g, e.obj) !== c.you) return false;
        return { criatura: e.obj };
      }), function* (c) {
        // ruling 1: confere de novo na resolução (CR 603.4); se a criatura saiu do campo, não compra
        if (!primeiraDoNome(c.g, c.you, c.event.criatura as ObjId)) return;
        yield* draw(c.g, c.you, 1);
      }, {
        // CR 603.4: cláusula "se" interveniente, conferida ao disparar
        condition: (c) => primeiraDoNome(c.g, c.you, (c as unknown as { event: { criatura: ObjId } }).event.criatura),
        text: 'Sempre que uma criatura que não é ficha entra sob o seu controle, se ela não tiver o mesmo nome de outra criatura que você controla nem de uma carta de criatura no seu cemitério, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: CR 603.4: com outra criatura de mesmo nome no campo ou no cemitério, não dispara; sendo a primeira, compra',
    2: 'regra geral: CR 603.4 — na resolução, a criatura que foi para o cemitério não está mais no campo e não compra (primeiraDoNome)',
    3: 'regra geral: CR 400.7 — a criatura que volta ao campo é outro objeto; a conferência da resolução olha o objeto que entrou',
    4: 'regra geral: CR 708.2a — virada para baixo não tem nome (primeiraDoNome)',
  },
});
