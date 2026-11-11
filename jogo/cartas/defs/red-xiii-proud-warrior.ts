// Red XIII, Proud Warrior
// Vigilance, trample
// Other modified creatures you control have vigilance and trample. (Equipment, Auras you control, and counters are
// modifications.)
// Cosmo Memory — When Red XIII enters, return target Aura or Equipment card from your graveyard to your hand.
import { and, anthem, defineCard, etb, is, keywords, moveObjects, or, t, tgt } from '../../motor/api.ts';
import { modificada } from '../vingadores.ts';

export default defineCard({
  name: 'Red XIII, Proud Warrior',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'trample'),
      // CR 700.9 (rulings 1-3): marcador de qualquer tipo, Equipamento de qualquer controlador ou Aura do controlador da criatura
      anthem(and(is.yours, is.creature, is.other, (c, id) => modificada(c.g, id)), () => [{ k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'trample' }], 'As outras criaturas modificadas que você controla têm vigilância e atropelar.'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', or(is.subtype('Aura'), is.subtype('Equipment')), 'carta de Aura ou de Equipamento alvo do seu cemitério', 'you')],
        text: 'Memória do Cosmo — Quando Red XIII entra, devolva a carta de Aura ou de Equipamento alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: CR 700.9: a criatura equipada é modificada, seja quem for o controlador do Equipamento',
    2: 'teste: CR 700.9: a Aura de outro jogador não modifica a sua criatura',
    3: 'teste: CR 700.9: qualquer marcador, de quem for, modifica a criatura',
  },
});
