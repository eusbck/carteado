// Disallow
// Counter target spell, activated ability, or triggered ability. (Mana abilities can't be targeted.)
import { counter, defineCard, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Disallow',
  faces: [{
    spell: {
      // CR 115.5: a própria mágica não pode ser alvo; habilidades de mana nunca estão na pilha (CR 605.3b)
      targets: [{ what: 'stackObject', label: 'mágica, habilidade ativada ou habilidade desencadeada alvo' }],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* counter(c.g, id);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: texto sobre a história (sem efeito no jogo)',
    2: 'teste: anula uma habilidade ativada (equipar) e o efeito não acontece',
    3: 'teste: anula uma habilidade desencadeada',
    4: 'regra geral: CR 603.7 — gatilho atrasado anulado não dispara de novo (motor/efeitos.ts delayed)',
    5: 'regra geral: CR 605.3b — habilidades de mana não vão para a pilha, então não podem ser alvo',
    6: 'regra geral: CR 614.1c — substituições "ao entrar" não usam a pilha, então não podem ser alvo',
  },
});
