// Eiganjo, Seat of the Empire
// {T}: Add {W}.
// Channel — {2}{W}, Discard this card: It deals 4 damage to target attacking or blocking creature. This ability costs {1}
// less to activate for each legendary creature you control.
import { activated, and, cost, creaturesOf, dealDamage, defineCard, isAttacking, isLegendary, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Eiganjo, Seat of the Empire',
  faces: [{
    abilities: [
      mana('W'),
      // Canalizar (CR 207.2c): habilidade ativada da mão; ruling 1: descartar faz parte do custo; ruling 2: precisa de alvo
      activated([...cost('{2}{W}'), { k: 'discardSelf' }], function* (c) {
        const id = tgt(c);
        if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 4, combat: false }]);
      }, {
        zones: ['hand'],
        targets: [t.creature((c, id) => isAttacking(c.g, id) || !!c.g.state.combat?.blockers.some((b) => b.id === id), 'criatura atacante ou bloqueadora alvo')],
        selfCost: (c) => ({ reduce: creaturesOf(c.g, c.you).filter((id) => isLegendary(c.g, id)).length }),
        text: 'Canalizar — {2}{W}, Descarte esta carta: Ela causa 4 de dano à criatura atacante ou bloqueadora alvo. Esta habilidade custa {1} a menos para ativar para cada criatura lendária que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: canalizar descarta a carta como custo e causa 4 de dano a uma atacante ou bloqueadora; custa {1} a menos por criatura lendária sua',
    2: 'regra geral: CR 602.2b — sem alvo legal, a habilidade não pode ser ativada só para descartar a carta (motor/stack.ts)',
  },
});