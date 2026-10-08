// Demolition Field
// {T}: Add {C}.
// {2}, {T}, Sacrifice this land: Destroy target nonbasic land an opponent controls. That land's controller may
// search their library for a basic land card, put it onto the battlefield, then shuffle. You may search your
// library for a basic land card, put it onto the battlefield, then shuffle.
import { activated, and, controllerOf, defineCard, destroy, is, mana, maySearchBasicToBattlefield, not, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Demolition Field',
  faces: [{
    abilities: [
      mana('C'),
      activated('{2}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const who = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        // ruling 1: procura mesmo que o terreno não tenha sido destruído
        yield* maySearchBasicToBattlefield(c, who, false);
        yield* maySearchBasicToBattlefield(c, c.you, false);
      }, { targets: [t.land(and(not(is.basic), is.opponents), 'terreno não básico alvo que um oponente controla')], text: '{2}, {T}, Sacrifique este terreno: Destrua o terreno não básico alvo que um oponente controla. O controlador dele pode procurar um terreno básico e colocá-lo no campo; depois você também pode.' }),
    ],
  }],
  rulings: {
    1: 'teste: os dois jogadores podem procurar um básico, que entra desvirado',
    2: 'regra geral: CR 608.2b — com o alvo ilegal a habilidade não resolve e ninguém procura',
  },
});
