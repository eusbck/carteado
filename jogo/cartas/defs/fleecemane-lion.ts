// Fleecemane Lion
// {3}{G}{W}: Monstrosity 1. (If this creature isn't monstrous, put a +1/+1 counter on it and it becomes monstrous.)
// As long as this creature is monstrous, it has hexproof and indestructible.
import { defineCard, monstrosity, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Fleecemane Lion',
  faces: [{
    abilities: [
      // rulings 1-2 (CR 701.37): fica monstruosa uma vez só; é uma marca da permanente, não uma habilidade
      monstrosity('{3}{G}{W}', 1),
      // a lista nunca volta vazia para a própria fonte: o motor descobre a camada chamando isto (camada 6)
      selfGets((_c, o) => (o.data.monstrous ? [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }] : [{ k: 'loseKeyword', kw: 'nenhuma' }]),
        'Enquanto esta criatura for monstruosa, ela tem resistência a magia e indestrutível.'),
    ],
  }],
  rulings: {
    1: 'teste: monstruosa, tem resistência a magia e indestrutível; a monstruosidade não funciona duas vezes',
    2: 'regra geral: CR 701.37b — ser monstruosa é uma marca da permanente, não uma habilidade (objeto.data.monstrous)',
    3: 'não se aplica: Fleecemane Lion não tem gatilho de "quando fica monstruosa"',
  },
});