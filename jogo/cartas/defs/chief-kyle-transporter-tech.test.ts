import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Chief Kyle, Transporter Tech';

describe(N, () => {
  it('jogando um terreno, exila outra criatura sua, que volta no início da próxima etapa final (e dispara de novo ao entrar)', () => {
    const tg = setup({ battlefield: [[N, 'Wall of Omens'], []], hand: [['Plains'], []], library: [['Island', 'Island'], []] });
    tg.choose('outra criatura alvo', ['Wall of Omens']);
    tg.play('Plains').resolveAll();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield')).not.toBeNull();
    // o Wall of Omens entrou de novo e comprou uma carta
    expect(tg.state.zones.hand[0].length).toBe(1);
  });
});
