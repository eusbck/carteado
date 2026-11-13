import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Daze';

describe(NOME, () => {
  it('devolvendo uma Island, anula a mágica de quem não paga {1}', () => {
    const tg = setup({ battlefield: [['Island'], ['Swamp']], hand: [[NOME], ['Dark Ritual']], active: 1 });
    tg.cast('Dark Ritual');
    tg.pass();
    tg.yes('Pagar {1}', false);
    tg.choose('mágica alvo', ['Dark Ritual']).choose('Devolva', ['Island']).cast(NOME, 'daze');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    tg.resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Dark Ritual']);
  });

  it('quem paga {1} não tem a mágica anulada', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Swamp', 'Swamp']], hand: [[NOME], ['Dark Ritual']], active: 1 });
    tg.cast('Dark Ritual');
    tg.pass();
    tg.yes('Pagar {1}', true);
    tg.choose('mágica alvo', ['Dark Ritual']).cast(NOME).resolve();
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toEqual(['Dark Ritual']);
  });
});
