// Raphael, the Muscle
// Double all damage that creatures you control with counters on them would deal.
// When Raphael enters, create a Mutagen token.
// Partner—Character select
import { controllerOf, createTokens, defineCard, etb, isCreature, staticAbility } from '../../motor/api.ts';
import { MUTAGEN, SELECAO, temMarcador } from '../tartarugas.ts';

export default defineCard({
  name: 'Raphael, the Muscle',
  faces: [{
    abilities: [
      // CR 701.10g: substituição; a fonte do dano continua a mesma (ruling 11) e o dobro vem depois de dividir (ruling 7)
      staticAbility({
        rules: {
          damageDouble: (c, fonte) => {
            const o = c.g.state.objects[fonte];
            return !!o && o.zone === 'battlefield' && isCreature(c.g, fonte) && controllerOf(c.g, fonte) === c.you && temMarcador(c.g, fonte);
          },
        },
        text: 'Dobre todo o dano que as criaturas que você controla com marcadores causariam.',
      }),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Mutagen', 1); }, { text: 'Quando Raphael entra, crie uma ficha Mutagen.' }),
    ],
  }],
  rulings: {
    1: SELECAO.perder,
    2: 'regra geral: CR 616.1 — quem recebe o dano escolhe a ordem entre o dobro e a prevenção; o motor dobra antes de prevenir (motor/actions.ts dealDamage)',
    3: MUTAGEN.alvos,
    4: SELECAO.separados,
    5: SELECAO.identidade,
    6: SELECAO.controla,
    7: 'regra geral: CR 701.10g — o dano é dividido ou atribuído antes e dobrado quando é causado (motor/actions.ts dealDamage)',
    8: SELECAO.dois,
    9: SELECAO.refere,
    10: MUTAGEN.predefinida,
    11: 'teste: dobra o dano das suas criaturas com marcadores, com a mesma fonte; sem marcador, não dobra',
    12: SELECAO.comecam,
  },
});