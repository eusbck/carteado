// Ghalta and Mavren
// Trample
// Whenever you attack, choose one —
// • Create a tapped and attacking X/X green Dinosaur creature token with trample, where X is the greatest power among
//   other attacking creatures.
// • Create X 1/1 white Vampire creature tokens with lifelink, where X is the number of other attacking creatures.
import { createTokens, defineCard, keyword, modal, on, power, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';
import { escolheAtacado } from '../viloes.ts';

// ruling 1: X é visto na resolução
const outrasAtacantes = (c: Ctx): ObjId[] => (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && a.id !== c.source && c.g.state.objects[a.id]?.zone === 'battlefield').map((a) => a.id);

export default defineCard({
  name: 'Ghalta and Mavren',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.youAttack(), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          {
            text: 'Crie uma ficha de criatura Dinosaur X/X verde com atropelar, virada e atacando, onde X é a maior força entre as outras criaturas atacantes',
            *effect(c) {
              // ruling 2: sem outras atacantes, a ficha é 0/0
              const x = Math.max(0, ...outrasAtacantes(c).map((id) => power(c.g, id)));
              // rulings 3-4: entra atacando sem ter sido declarada; você escolhe quem ela ataca
              const alvo = yield* escolheAtacado(c, 'Ghalta and Mavren');
              yield* putOntoBattlefield(c.g, [{ controller: c.you, token: { copyOf: { def: 'Dinosaur X/X', face: 0, except: { power: x, toughness: x } } }, tapped: true, attacking: alvo ?? undefined }], 'token');
            },
          },
          {
            text: 'Crie X fichas de criatura Vampire 1/1 brancas com vínculo com a vida, onde X é o número de outras criaturas atacantes',
            *effect(c) {
              // ruling 5: sem outras atacantes, nenhuma ficha
              const x = outrasAtacantes(c).length;
              if (x > 0) yield* createTokens(c.g, c.you, 'Vampire 1/1 branca', x);
            },
          },
        ]),
        text: 'Sempre que você ataca, escolha um — crie uma ficha de criatura Dinosaur X/X verde com atropelar, virada e atacando, onde X é a maior força entre as outras criaturas atacantes; ou crie X fichas de criatura Vampire 1/1 brancas com vínculo com a vida, onde X é o número de outras criaturas atacantes.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: primeiro modo: um Dinosaur X/X virado e atacando, com X igual à maior força entre as outras atacantes',
    2: 'teste: sem outras atacantes, o Dinosaur é 0/0 e morre, e o segundo modo não cria Vampires',
    3: 'regra geral: CR 508.4 — a ficha entra atacando sem ter sido declarada atacante (motor/actions.ts putOntoBattlefield)',
    4: 'regra geral: CR 508.4 — você escolhe quem a ficha ataca (cartas/viloes.ts escolheAtacado)',
    5: 'teste: sem outras atacantes, o Dinosaur é 0/0 e morre, e o segundo modo não cria Vampires',
  },
});