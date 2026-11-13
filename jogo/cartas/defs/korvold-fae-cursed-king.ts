// Korvold, Fae-Cursed King
// Flying
// Whenever Korvold enters or attacks, sacrifice another permanent.
// Whenever you sacrifice a permanent, put a +1/+1 counter on Korvold and draw a card.
import { addCounters, defineCard, draw, eachSacrifices, keyword, on, triggered } from '../../motor/api.ts';

function* sacrificaOutro(c: Parameters<Parameters<typeof triggered>[1]>[0]) {
  // ruling 1: sem outro permanente, não acontece nada
  yield* eachSacrifices(c, [c.you], (id) => id !== c.source, 1, 'outro permanente');
}

export default defineCard({
  name: 'Korvold, Fae-Cursed King',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfEnters(), sacrificaOutro, { text: 'Sempre que Korvold entra ou ataca, sacrifique outro permanente.' }),
      triggered(on.selfAttacks(), sacrificaOutro, { text: 'Sempre que Korvold entra ou ataca, sacrifique outro permanente.' }),
      // ruling 2: a regra da lenda não é sacrifício; ruling 5: sacrificando Korvold, ainda compra
      triggered(on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        yield* draw(c.g, c.you, 1);
      }, { zones: ['battlefield'], text: 'Sempre que você sacrifica um permanente, coloque um marcador +1/+1 em Korvold e compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem outro permanente, não sacrifica nada',
    2: 'regra geral: CR 704.5j — ir para o cemitério pela regra da lenda não é sacrificar (motor/sba.ts)',
    3: 'regra geral: CR 701.21a — a habilidade só dispara quando algo manda sacrificar (motor/actions.ts sacrifice)',
    4: 'teste: sacrificar como custo dispara; o gatilho resolve antes da habilidade',
    5: 'teste: sacrificando Korvold, compra uma carta sem pôr marcador',
  },
});
