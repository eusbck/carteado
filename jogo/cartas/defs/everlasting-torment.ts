// Everlasting Torment
// Players can't gain life.
// Damage can't be prevented.
// All damage is dealt as though its source had wither.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Everlasting Torment',
  faces: [{
    abilities: [staticAbility({
      rules: {
        // rulings 1-2, 5-6, 8: ninguém ganha vida (CR 119.7)
        cantGainLife: () => true,
        // ruling 7: nenhum dano é prevenido, nem por proteção; ruling 3: substituições e redirecionamentos seguem valendo
        damageCantBePrevented: () => true,
        // ruling 4: todo dano a criaturas vira marcadores -1/-1
        damageAsWither: () => true,
      },
      text: 'Os jogadores não podem ganhar vida. O dano não pode ser prevenido. Todo dano é causado como se a fonte tivesse murchar.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 119.7 — custo que inclui ganhar vida não pode ser pago',
    2: 'regra geral: CR 119.7 — substituições de ganho de vida não fazem nada',
    3: 'regra geral: CR 615 — redirecionar e substituir dano continuam funcionando',
    4: 'teste: dano de qualquer fonte vira marcadores',
    5: 'regra geral: CR 119.5 — fixar a vida acima não ganha a diferença',
    6: 'regra geral: CR 119.7 — substituir por ganhar vida não faz nada',
    7: 'teste: proteção não previne o dano',
    8: 'teste: o ganho de vida não acontece',
  },
});
