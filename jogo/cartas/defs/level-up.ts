// Level Up
// Enchant creature
// When this Aura enters, put a +1/+1 counter on enchanted creature.
// Enchanted creature has "Whenever this creature attacks, double the number of +1/+1 counters on it. Then if it has
// power 10 or greater, draw a card."
import { addCounters, attachedGets, defineAbility, defineCard, draw, etb, on, power, t, triggered } from '../../motor/api.ts';
import { dobraMarcadores } from '../tartarugas.ts';

const ATACA = defineAbility('Level Up:ataca', triggered(on.selfAttacks(), function* (c) {
  if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
  // ruling 1: dobrar é pôr tantos marcadores quantos já tem (CR 701.10e)
  dobraMarcadores(c.g, c.source, '+1/+1', c.you);
  if (power(c.g, c.source) >= 10) yield* draw(c.g, c.you, 1);
}, { text: 'Sempre que esta criatura ataca, dobre o número de marcadores +1/+1 nela. Depois, se ela tiver força 10 ou mais, compre uma carta.' }));

export default defineCard({
  name: 'Level Up',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      etb(function* (c) {
        const id = c.g.state.objects[c.source]?.attachedTo ?? null;
        if (id !== null && c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Quando esta Aura entra, coloque um marcador +1/+1 na criatura encantada.' }),
      attachedGets(() => [{ k: 'addAbility', id: ATACA.id! }], 'A criatura encantada tem "Sempre que esta criatura ataca, dobre o número de marcadores +1/+1 nela. Depois, se ela tiver força 10 ou mais, compre uma carta."'),
    ],
  }],
  rulings: { 1: 'teste: põe um marcador ao entrar; quando a criatura encantada ataca, dobra os marcadores e compra com força 10 ou mais' },
});