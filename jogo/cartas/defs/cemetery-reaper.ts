// Cemetery Reaper
// Other Zombie creatures you control get +1/+1.
// {2}{B}, {T}: Exile target creature card from a graveyard. Create a 2/2 black Zombie creature token.
import { activated, and, anthem, createTokens, defineCard, exile, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cemetery Reaper',
  faces: [{
    abilities: [
      // ruling 1: todas as outras criaturas Zombie que você controla, não só as fichas desta habilidade
      anthem(and(is.creature, is.subtype('Zombie'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas Zombie que você controla recebem +1/+1.'),
      // ruling 2: exilar é parte do efeito; se o alvo saiu do cemitério, a habilidade não resolve (CR 608.2b)
      activated('{2}{B}, {T}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        yield* exile(c.g, [id]);
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1);
      }, {
        // ruling 3: qualquer carta com o tipo criatura
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo num cemitério', 'any')],
        text: '{2}{B}, {T}: Exile a carta de criatura alvo de um cemitério. Crie uma ficha de criatura Zombie preta 2/2.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: as outras criaturas Zombie que você controla recebem +1/+1, inclusive as fichas',
    2: 'teste: CR 608.2b: se a carta saiu do cemitério, não resolve e não cria a ficha',
    3: 'teste: exila carta de criatura artefato do cemitério de um oponente',
  },
});
