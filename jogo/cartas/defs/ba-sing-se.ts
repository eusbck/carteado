// Ba Sing Se
// This land enters tapped unless you control a basic land.
// {T}: Add {G}.
// {2}{G}, {T}: Earthbend 2. Activate only as a sorcery. (Target land you control becomes a 0/0 creature with haste
// that's still a land. Put two +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)
import { activated, defineCard, earthbend, is, land, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Ba Sing Se',
  faces: [{
    abilities: [
      land.tappedUnlessBasics(1),
      mana('G'),
      activated('{2}{G}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* earthbend(c, id, 2);
      }, { targets: [t.land(is.yours, 'terreno alvo que você controla')], timing: 'sorcery', text: '{2}{G}, {T}: Dobre a terra 2. Ative somente como feitiço.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 701.66a: volta virado ao morrer ou ser exilado, mas não ao ir para a mão',
    2: 'teste: dobra a terra 2 sem mudar a cor nem as habilidades de mana do terreno',
    3: 'teste: CR 614.12: um terreno básico que entra junto não permite entrar desvirado',
    4: 'teste: CR 608.2b: o alvo ilegal impede a resolução da habilidade',
    5: 'teste: dobra a terra 2 sem mudar a cor nem as habilidades de mana do terreno',
    6: 'teste: dobra a terra 2 sem mudar a cor nem as habilidades de mana do terreno',
    7: 'teste: pode dobrar novamente um terreno que já é criatura',
  },
});
