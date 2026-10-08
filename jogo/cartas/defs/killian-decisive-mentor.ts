// Killian, Decisive Mentor
// Whenever an enchantment you control enters, tap up to one target creature and goad it.
// Whenever one or more creatures that are enchanted by an Aura you control attack, draw a card.
import { controllerOf, defineCard, draw, goad, isSubtype, isType, on, t, tap, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Killian, Decisive Mentor',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.controller === c.you && !!c.g.state.objects[e.obj] && isType(c.g, e.obj, 'Enchantment')), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        tap(c.g, id);
        // rulings 1-5: goad (CR 701.15)
        goad(c.g, id, c.you);
      }, { targets: [upTo(1, t.creature(undefined, 'até uma criatura alvo'))], text: 'Sempre que um encantamento que você controla entra, vire até uma criatura alvo e goade-a.' }),
      triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.some((a) => c.g.state.zones.battlefield.some((x) => c.g.state.objects[x].attachedTo === a.obj && isSubtype(c.g, x, 'Aura') && controllerOf(c.g, x) === c.you))), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma ou mais criaturas encantadas por uma Aura que você controla atacam, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.15b — goad vale em combates adicionais',
    2: 'regra geral: CR 701.15 — goad não é habilidade da criatura',
    3: 'regra geral: CR 701.15b — maior número de exigências cumpridas',
    4: 'teste: a criatura goadada é virada e precisa atacar outro jogador',
    5: 'regra geral: CR 508.1d — virada ou impedida, não ataca; custo não é obrigatório',
  },
});
