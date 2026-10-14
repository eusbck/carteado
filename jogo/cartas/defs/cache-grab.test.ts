import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Cache Grab';

describe(NOME, () => {
  it('moe quatro, devolve uma carta de permanente à mão; devolvendo um Squirrel, cria uma Food', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[NOME], []], library: [['Island', 'Squirrel Sovereign', 'Lightning Bolt', 'Forest', 'Plains'], []] });
    tg.choose('Cache Grab', ['Squirrel Sovereign']).cast(NOME).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Squirrel Sovereign']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Cache Grab', 'Forest', 'Island', 'Lightning Bolt']);
    expect(tg.all('Food').length).toBe(1);
  });

  it('sem Squirrel, sem Food', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[NOME], []], library: [['Island', 'Island', 'Island', 'Island'], []] });
    tg.choose('Cache Grab', ['Island']).cast(NOME).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.all('Food').length).toBe(0);
  });

  it('controlando um Squirrel, cria a Food mesmo sem devolver nada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', { name: 'Squirrel', token: true }], []], hand: [[NOME], []], library: [['Lightning Bolt'], []] });
    tg.cast(NOME).resolve();
    expect(tg.all('Food').length).toBe(1);
  });
});
