// Parallel Lives — If an effect would create one or more tokens under your control, it creates twice that many instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Parallel Lives',
  faces: [{
    abilities: [staticAbility({
      rules: {
        tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
          label: 'Parallel Lives: o dobro das fichas',
          *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((x) => ({ ...x }))] }; },
        }),
      },
      text: 'Se um efeito fosse criar uma ou mais fichas sob o seu controle, ele cria o dobro dessas fichas em vez disso.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 616.1 — com dois efeitos assim, cada um dobra (quatro vezes)',
    2: 'regra geral: CR 111.1 — copiar uma mágica de permanente não cria ficha por efeito; não dobra',
  },
});
