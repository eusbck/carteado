// Parhelion II
// Flying, first strike, vigilance
// Whenever Parhelion II attacks, create two 4/4 white Angel creature tokens with flying and vigilance that are attacking.
// Crew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineCard, keywords, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { escolheAtacado } from '../viloes.ts';

export default defineCard({
  name: 'Parhelion II',
  faces: [{
    abilities: [
      ...keywords('flying', 'first strike', 'vigilance'),
      // CR 508.4: entram atacando sem terem sido declaradas atacantes (ruling 2); você escolhe quem cada uma ataca
      // (ruling 1; o motor oferece os oponentes, não os planeswalkers)
      triggered(on.selfAttacks(), function* (c) {
        for (let i = 0; i < 2; i++) {
          const alvo = yield* escolheAtacado(c, `Parhelion II (Angel ${i + 1} de 2)`);
          yield* putOntoBattlefield(c.g, [{ controller: c.you, token: { def: 'Angel vigilância' }, attacking: alvo ?? undefined }], 'token');
        }
      }, { text: 'Sempre que Parhelion II ataca, crie duas fichas de criatura Angel brancas 4/4 com voar e vigilância que estão atacando.' }),
      crew(4),
    ],
  }],
  rulings: {
    1: 'teste: ao atacar, cria duas Angels 4/4 atacando, que causam dano',
    2: 'regra geral: CR 508.4 — as fichas entram atacando sem terem sido declaradas atacantes (motor/actions.ts putOntoBattlefield)',
  },
});
