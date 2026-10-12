// Big Mother Mouser
// This creature enters with two +1/+1 counters on it.
// Whenever this creature attacks, double the number of +1/+1 counters on it.
// When this creature dies, create a number of 1/1 colorless Robot artifact creature tokens equal to the number of +1/+1
// counters on this creature.
import { createTokens, defineCard, entersWithCounters, on, triggered } from '../../motor/api.ts';
import { dobraMarcadores } from '../tartarugas.ts';

export default defineCard({
  name: 'Big Mother Mouser',
  faces: [{
    abilities: [
      entersWithCounters('+1/+1', () => 2),
      // ruling 1: dobrar é pôr tantos marcadores quantos já tem (CR 701.10e)
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') dobraMarcadores(c.g, c.source, '+1/+1', c.you);
      }, { text: 'Sempre que esta criatura ataca, dobre o número de marcadores +1/+1 nela.' }),
      // ruling 2: os marcadores de quando ela esteve no campo pela última vez
      triggered(on.selfDies(), function* (c) {
        const n = c.g.state.lki[c.source]?.obj.counters['+1/+1'] ?? 0;
        if (n > 0) yield* createTokens(c.g, c.you, 'Robot', n);
      }, { text: 'Quando esta criatura morre, crie um número de fichas de criatura artefato Robot 1/1 incolores igual ao número de marcadores +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: entra com dois marcadores; atacando dobra; morrendo cria um Robot 1/1 para cada marcador +1/+1',
    2: 'teste: morrendo por marcadores -1/-1, contam os marcadores +1/+1 que ela tinha',
  },
});