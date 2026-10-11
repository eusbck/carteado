// Bathe in Light
// Radiance — Choose a color. Target creature and each other creature that shares a color with it gain protection from
// the chosen color until end of turn.
import { chooseColor, defineCard, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { radiancia } from '../inferno.ts';

export default defineCard({
  name: 'Bathe in Light',
  faces: [{
    spell: {
      // ruling 6: um alvo só; sem ele, a mágica não resolve
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: a cor escolhida na resolução não tem a ver com as cores compartilhadas
        const cor = yield* chooseColor(c.g, c.you, 'Bathe in Light: proteção contra qual cor?');
        // rulings 2-5: quem compartilha uma cor com o alvo é visto na resolução; o incolor não compartilha cor com ninguém
        untilEndOfTurn(c, radiancia(c.g, id), [{ k: 'addKeyword', kw: 'protection', param: `color:${cor}` }]);
      },
    },
  }],
  rulings: {
    1: 'teste: a criatura alvo e as que compartilham uma cor com ela ganham proteção contra a cor escolhida',
    2: 'teste: a criatura alvo e as que compartilham uma cor com ela ganham proteção contra a cor escolhida',
    3: 'teste: a criatura alvo e as que compartilham uma cor com ela ganham proteção contra a cor escolhida',
    4: 'teste: mirando uma criatura incolor, só ela é afetada',
    5: 'regra geral: CR 608.2h — as cores são vistas na resolução (cartas/inferno.ts radiancia)',
    6: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve (motor/stack.ts)',
  },
});