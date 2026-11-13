// Colossal Clone Master
// Strange new worlds — You may have this creature enter as a copy of any creature on the battlefield, except it isn't
// legendary and it has "This creature's power and toughness are each equal to the number of differently named lands
// you control."
import { allCreatures, defineAbility, defineCard, entersAsCopy, selfGets } from '../../motor/api.ts';
import { terrenosComNomesDiferentes } from '../startrek.ts';

// CR 604.3, 613.4a: a habilidade que define força e resistência (camada 7a) passa a fazer parte da cópia (CR 707.9b)
const PT = defineAbility('Colossal Clone Master:pt', selfGets((c) => {
  const n = terrenosComNomesDiferentes(c.g, c.you);
  return [{ k: 'setPT', p: n, t: n }];
}, 'A força e a resistência desta criatura são iguais ao número de terrenos com nomes diferentes que você controla.', { cda: true }));

export default defineCard({
  name: 'Colossal Clone Master',
  faces: [{
    abilities: [
      entersAsCopy({
        label: 'Colossal Clone Master', what: 'uma criatura no campo',
        text: 'Strange new worlds — Você pode fazer esta criatura entrar como uma cópia de qualquer criatura no campo, exceto que ela não é lendária e tem "A força e a resistência desta criatura são iguais ao número de terrenos com nomes diferentes que você controla."',
        candidates: (c) => allCreatures(c.g),
        except: () => ({ legendary: false, addAbilities: [PT.id!] }),
      }),
    ],
  }],
  rulings: {},
});
