// Dionus, Elvish Archdruid
// Elves you control have "Whenever this creature becomes tapped during your turn, untap it and put a +1/+1 counter on
// it. This ability triggers only once each turn."
import { addCounters, and, anthem, defineAbility, defineCard, is, on, triggered, untap } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';

/**
 * A habilidade concedida tem um id por Dionus (ruling 4: com dois Dionus, cada Elfo tem duas instâncias, e cada uma
 * dispara uma vez por turno; ruling 5: um Dionus novo concede uma habilidade nova). O "só uma vez por turno" fica no
 * Elfo, pela chave do id (motor/triggers.ts oncePerTurn).
 */
function concedida(dionus: number): string {
  const id = `Dionus, Elvish Archdruid:concede:${dionus}`;
  if (!registry.abilities.has(id)) {
    defineAbility(id, triggered(on.custom((e, c) => e.type === 'tap' && e.obj === c.source && c.g.state.turn.active === c.you), function* (c) {
      // ruling 3: resolve mesmo que o Dionus tenha saído
      const o = c.g.state.objects[c.source];
      if (o?.zone !== 'battlefield') return;
      untap(c.g, c.source);
      addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
    }, { oncePerTurn: true, text: 'Sempre que esta criatura é virada durante o seu turno, desvire-a e coloque um marcador +1/+1 nela. Esta habilidade só dispara uma vez por turno.' }));
  }
  return id;
}

export default defineCard({
  name: 'Dionus, Elvish Archdruid',
  faces: [{
    abilities: [
      // ruling 1: inclusive o próprio Dionus (é Elfo)
      anthem(and(is.yours, is.subtype('Elf')), (c) => [{ k: 'addAbility', id: concedida(c.source) }],
        'Os Elfos que você controla têm "Sempre que esta criatura é virada durante o seu turno, desvire-a e coloque um marcador +1/+1 nela. Esta habilidade só dispara uma vez por turno."'),
    ],
  }],
  rulings: {
    1: 'teste: o próprio Dionus e os Elfos desviram e ganham um marcador ao atacar no seu turno, uma vez por turno',
    2: 'regra geral: CR 701.26a — entrar virado não é "ser virado" (motor/actions.ts putOntoBattlefield não emite o evento tap)',
    3: 'regra geral: CR 113.7a — a habilidade na pilha resolve mesmo que a fonte saia (motor/stack.ts)',
    4: 'regra geral: CR 113.2c — com dois Dionus, cada Elfo tem duas instâncias, com ids diferentes (concedida por Dionus)',
    5: 'regra geral: CR 400.7 — um Dionus novo é outro objeto e concede outra habilidade (id por Dionus)',
  },
});
