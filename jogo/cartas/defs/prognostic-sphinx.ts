// Prognostic Sphinx
// Flying
// Discard a card: This creature gains hexproof until end of turn. Tap it.
// Whenever this creature attacks, scry 3.
import { activated, defineCard, keyword, lookAndArrange, on, tap, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Prognostic Sphinx',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: dá para ativar mesmo virada
      activated('Discard a card', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'hexproof' }]);
        tap(c.g, c.source);
      }, { text: 'Descarte uma carta: Esta criatura ganha resistência a magia até o fim do turno. Vire-a.' }),
      triggered(on.selfAttacks(), function* (c) {
        yield* lookAndArrange(c.g, c.you, 3, 'scry');
      }, { text: 'Sempre que esta criatura ataca, faça vidência 3.' }),
    ],
  }],
  rulings: {
    1: 'teste: descartar uma carta dá resistência a magia e vira a criatura; dá para ativar com ela já virada',
    2: 'regra geral: CR 701.22a — a vidência põe cada carta no topo ou no fundo (motor/actions.ts lookAndArrange)',
    3: 'regra geral: CR 701.22a — a ordem do topo e do fundo é escolhida (motor/actions.ts lookAndArrange)',
    4: 'teste: ao atacar, faz vidência 3',
    5: 'não se aplica: a habilidade de atacar não tem alvos',
  },
});
