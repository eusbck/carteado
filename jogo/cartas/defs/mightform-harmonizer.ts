// Mightform Harmonizer
// Landfall — Whenever a land you control enters, double the power of target creature you control until end of turn.
// Warp {2}{G} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next
// end step, then you may cast it from exile on a later turn.)
import { defineCard, is, on, power, staticAbility, t, tgt, triggered, untilEndOfTurn, warpPermission } from '../../motor/api.ts';

const DOBRA = warpPermission('{2}{G}');

export default defineCard({
  name: 'Mightform Harmonizer',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // rulings 1-2 (CR 701.10b-c): recebe +X/+0, X = a força atual (negativa: -X/-0)
        const x = power(c.g, id);
        if (x !== 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: x, t: 0 }]);
      }, {
        targets: [t.creature((c, id) => is.yours(c, id), 'criatura alvo que você controla')],
        text: 'Aterragem — Sempre que um terreno que você controla entra, dobre a força da criatura alvo que você controla até o fim do turno.',
      }),
      // dobra (CR 702.185a): custo alternativo da mão; o exílio e a permissão de conjurar depois ficam no motor
      staticAbility({
        zones: ['hand'],
        rules: {
          mayPlayFrom: (c, jogador, carta) => (carta === c.source && jogador === c.you && c.g.state.objects[carta]?.zone === 'hand' ? DOBRA : null),
        },
        text: 'Dobra {2}{G} (você pode conjurar esta carta da sua mão pelo custo de dobra. Exile esta criatura no início da próxima etapa final; depois você pode conjurá-la do exílio num turno posterior.)',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.10b-c — dobrar a força dá +X/+0 com X = a força (negativa, -X/-0)',
    2: 'teste: dobra a força da criatura alvo até o fim do turno',
  },
});
