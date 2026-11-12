import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Nine-Lives Familiar';

describe(NOME, () => {
  it('conjurada, entra com oito marcadores de renascimento e volta com um a menos na próxima etapa final', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.cast(NOME).resolve();
    const id = tg.bf(NOME);
    expect(tg.state.objects[id].counters.revival).toBe(8);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.find(NOME)).toBeNull();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].counters.revival).toBe(7);
  });

  it('sem marcador de renascimento, não volta', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find(NOME)).toBeNull();
  });
});
