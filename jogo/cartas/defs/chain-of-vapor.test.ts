import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Chain of Vapor';

describe(NOME, () => {
  it('devolve o permanente; quem o controlava pode sacrificar um terreno para copiar com novo alvo', () => {
    const tg = setup({ battlefield: [['Island', 'Sol Ring'], ['Forest', 'Wall of Omens']], hand: [[NOME], []] });
    tg.choose('permanente não terreno alvo', ['Wall of Omens']).cast(NOME);
    tg.choose('sacrificar um terreno', ['Forest']);
    tg.yes('copiar a mágica', true);
    tg.yes('novos alvos', true);
    tg.choose('permanente não terreno alvo', ['Sol Ring']);
    // Ana não sacrifica a Island: a corrente para
    tg.choose('sacrificar um terreno', ['Não sacrificar']);
    tg.resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(1, 'graveyard')).toEqual(['Forest']);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.find('Island')).not.toBeNull();
  });
});
