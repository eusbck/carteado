// Mistveil Plains — Land — Plains
// ({T}: Add {W}.)
// This land enters tapped.
// {W}, {T}: Put target card from your graveyard on the bottom of your library. Activate only if you control
// two or more white permanents.
import { activated, chars, controlledBy, defineCard, land, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mistveil Plains',
  faces: [{
    abilities: [
      land.tapped(),
      activated('{W}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'library', position: 'bottom' }], 'bottom');
      }, {
        targets: [t.card('graveyard', undefined, 'carta alvo do seu cemitério')],
        condition: (c) => controlledBy(c.g, c.you, (id) => chars(c.g, id).colors.includes('W')).length >= 2,
        text: '{W}, {T}: Ponha a carta alvo do seu cemitério no fundo do seu grimório. Ative só se você controla dois ou mais permanentes brancos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 602.1b — a condição só é checada ao ativar',
    2: 'teste: terrenos são incolores e não contam como permanentes brancos',
  },
});
