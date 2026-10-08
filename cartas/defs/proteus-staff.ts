// Proteus Staff
// {2}{U}, {T}: Put target creature on the bottom of its owner's library. That creature's controller reveals cards from
// the top of their library until they reveal a creature card. The player puts that card onto the battlefield and the
// rest on the bottom of their library in any order. Activate only as a sorcery.
import { activated, chooseItems, controllerOf, defineCard, isCreature, moveObjects, nameOf, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Proteus Staff',
  faces: [{
    abilities: [
      activated('{2}{U}, {T}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        // fundo do grimório do dono (o comandante pode ir para a zona de comando, CR 903.9b)
        yield* moveObjects(c.g, [{ id, to: 'library', position: 'bottom' }], 'effect');
        let s = c.g.state;
        if (s.players[quem].left) return;
        // CR 701.20: revela do topo até uma carta de criatura; fichas não são cartas (CR 108.2, 111.1)
        const cartas = s.zones.library[quem].filter((x) => !s.objects[x].isToken);
        const i = cartas.findIndex((x) => isCreature(c.g, x));
        const reveladas = i < 0 ? cartas : cartas.slice(0, i + 1);
        c.g.log(`${s.players[quem].name} revela ${reveladas.map((x) => nameOf(c.g, x)).join(', ') || 'nada (grimório vazio)'}.`, { rule: '701.20' });
        if (i >= 0) yield* putOntoBattlefield(c.g, [{ id: cartas[i], controller: quem }], 'effect');
        // o resto vai para o fundo na ordem que o jogador escolher
        s = c.g.state;
        let resto = reveladas.filter((x) => x !== cartas[i] && s.objects[x]?.zone === 'library');
        if (resto.length > 1) {
          const ordem = yield* chooseItems(c.g, quem, 'Ordene as cartas reveladas para o fundo do grimório: a primeira fica mais acima, a última fica no fundo', resto.map((x) => ({ id: String(x), label: nameOf(c.g, x), obj: x, card: { def: s.objects[x].def } })), resto.length, resto.length, true);
          resto = ordem.map(Number);
          s = c.g.state;
        }
        if (resto.length) {
          s.zones.library[quem] = [...s.zones.library[quem].filter((x) => !resto.includes(x)), ...resto];
          for (const x of resto) s.objects[x].visibleTo = null;
          c.g.bump();
        }
      }, {
        timing: 'sorcery',
        targets: [t.creature()],
        text: '{2}{U}, {T}: Coloque a criatura alvo no fundo do grimório do dono. O controlador dela revela cartas do topo do grimório até revelar uma carta de criatura, coloca essa carta no campo e o resto no fundo do grimório na ordem que quiser. Ative só como um feitiço.',
      }),
    ],
  }],
  rulings: {},
});
