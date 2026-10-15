// Fear of Sleep Paralysis
// Flying
// Eerie — Whenever this creature or another enchantment you control enters and whenever you fully unlock a Room, tap up
// to one target creature and put a stun counter on it.
// Stun counters can't be removed from permanents your opponents control. (They won't untap if they have stun counters.)
import { addCounters, chars, controllerOf, defineCard, keyword, on, staticAbility, t, tap, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Fear of Sleep Paralysis',
  faces: [{
    abilities: [
      keyword('flying'),
      // Eerie: um gatilho por encantamento que entra (ruling 4) e um por Sala totalmente destrancada (CR 709.5i)
      triggered(on.custom((e, c) => {
        if (e.type === 'zone' && e.to === 'battlefield') {
          if (e.obj === c.source) return true;
          const o = c.g.state.objects[e.obj];
          return !!o && o.zone === 'battlefield' && controllerOf(c.g, e.obj) === c.you && chars(c.g, e.obj).types.includes('Enchantment');
        }
        return e.type === 'unlock' && e.full && e.player === c.you;
      }), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        tap(c.g, id);
        addCounters(c.g, { kind: 'obj', id }, 'stun', 1, c.you);
      }, {
        targets: [upTo(1, t.creature())],
        text: 'Arrepio — Sempre que esta criatura ou outro encantamento que você controla entra e sempre que você destranca uma Sala por inteiro, vire até uma criatura alvo e coloque um marcador de atordoamento nela.',
      }),
      staticAbility({
        rules: { cantRemoveCounters: (c, kind, obj) => kind === 'stun' && c.g.state.objects[obj]?.zone === 'battlefield' && c.g.isOpponent(c.you, controllerOf(c.g, obj)) },
        text: 'Os marcadores de atordoamento não podem ser removidos das permanentes que seus oponentes controlam.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura do oponente com marcador de atordoamento não desvira e o marcador fica',
    2: 'regra geral: o gancho cantRemoveCounters impede tirar o marcador de qualquer jeito (motor/actions.ts removeCounters)',
    3: 'regra geral: desvirar a permanente atordoada não acontece, então o custo {Q} não pode ser pago com ela (motor/actions.ts untap)',
    4: 'teste: entrando junto com outros encantamentos, dispara uma vez por encantamento',
    5: 'teste: destrancar a segunda porta de uma Sala dispara',
  },
});
