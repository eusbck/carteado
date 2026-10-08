// Lord of the Undead
// Other Zombie creatures get +1/+1.
// {1}{B}, {T}: Return target Zombie card from your graveyard to your hand.
import { activated, and, anthem, defineCard, is, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Lord of the Undead',
  faces: [{
    abilities: [
      // ruling 1: todas as outras criaturas Zombie, de qualquer jogador (dois Lords se dão +1/+1)
      anthem(and(is.creature, is.subtype('Zombie'), is.other), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas Zombie recebem +1/+1.'),
      activated('{1}{B}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.subtype('Zombie'), 'carta de Zombie alvo no seu cemitério')],
        text: '{1}{B}, {T}: Devolva a carta de Zombie alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: { 1: 'teste: dois Lords dão +1/+1 um ao outro; Zombies dos oponentes também recebem' },
});
