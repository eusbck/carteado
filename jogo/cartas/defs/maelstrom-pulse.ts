// Maelstrom Pulse
// Destroy target nonland permanent and all other permanents with the same name as that permanent.
import { chars, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Maelstrom Pulse',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        const id = tgt(c);
        // ruling 3: com o alvo ilegal, nada é destruído (a mágica nem resolve)
        if (id === null) return;
        const nome = chars(c.g, id).name;
        // virada para baixo não tem nome (CR 708.2a): não tem "o mesmo nome" que nada
        const mesmos = nome ? c.g.state.zones.battlefield.filter((x) => x !== id && chars(c.g, x).name === nome) : [];
        yield* destroy(c.g, [id, ...mesmos]);
      },
    },
  }],
  rulings: {
    1: 'teste: destrói o alvo e as outras permanentes com o mesmo nome, inclusive fichas (as de Squirrel se chamam Squirrel)',
    2: 'teste: destrói o alvo e as outras permanentes com o mesmo nome, inclusive fichas (as de Squirrel se chamam Squirrel)',
    3: 'teste: alvo indestrutível fica, mas as outras com o mesmo nome são destruídas',
  },
});
