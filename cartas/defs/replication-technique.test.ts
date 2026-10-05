import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Replication Technique', () => {
  it('o oponente copia escolhendo um permanente dele', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Sol Ring'], ['Wall of Omens']], hand: [['Replication Technique'], []], library: [[], ['Island']] });
    tg.choose('permanente alvo que você controla', ['Sol Ring']);
    tg.yes('Demonstrar', true).yes('novos alvos', false).choose('oponente para também copiar', ['Bruno']);
    tg.yes('novos alvos', true).choose('permanente alvo que você controla', ['Wall of Omens']);
    tg.cast('Replication Technique').resolveAll();
    expect(tg.all('Sol Ring').length).toBe(3);
    expect(tg.all('Wall of Omens').length).toBe(2);
    expect(tg.state.objects[tg.all('Wall of Omens').find((id) => tg.state.objects[id].isToken)!].controller).toBe(1);
  });
});
