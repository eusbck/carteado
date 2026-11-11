// Red XIII, Proud Warrior
// Vigilance, trample
// Other modified creatures you control have vigilance and trample. (Equipment, Auras you control, and counters are
// modifications.)
// Cosmo Memory — When Red XIII enters, return target Aura or Equipment card from your graveyard to your hand.
import { and, anthem, chars, defineCard, etb, is, keywords, moveObjects, t, tgt } from '../../motor/api.ts';
import { modificada } from '../vingadores.ts';

export default defineCard({
  name: 'Red XIII, Proud Warrior',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'trample'),
      anthem(and(is.creature, is.yours, is.other, (c, id) => modificada(c.g, id)),
        () => [{ k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'trample' }],
        'As outras criaturas modificadas que você controla têm vigilância e atropelar.'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => { const s = chars(c.g, id).subtypes; return s.includes('Aura') || s.includes('Equipment'); }, 'carta de Aura ou Equipamento alvo do seu cemitério', 'you')],
        text: 'Memória do Cosmo — Quando Red XIII entra, devolva a carta de Aura ou Equipamento alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1 e 3: equipada (por quem for) ou com marcador conta como modificada',
    2: 'regra geral: CR 700.9 — Aura de outro jogador não modifica sua criatura (cartas/vingadores.ts modificada)',
    3: 'teste: ruling 1 e 3: equipada (por quem for) ou com marcador conta como modificada',
  },
});
