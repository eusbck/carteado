import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Spinerock Tyrant', () => {
  it('a cópia pode mirar outra criatura; o dano das duas mágicas vira marcadores -1/-1', () => {
    const tg = setup({
      battlefield: [['Spinerock Tyrant', 'Mountain', 'Mountain'], ['Archfiend of Depravity', 'Glissa Sunslayer']], hand: [['Abrade'], []],
    });
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']).choose('criatura alvo', ['Archfiend of Depravity']);
    tg.yes('copiar Abrade').yes('novos alvos').choose('criatura alvo', ['Glissa Sunslayer']);
    tg.cast('Abrade').resolveAll();
    const a = tg.bf('Archfiend of Depravity');
    expect(tg.state.objects[a].counters['-1/-1']).toBe(3);
    expect(tg.state.objects[a].damage ?? 0).toBe(0);
    expect(tg.find('Glissa Sunslayer')).toBeNull();
  });
});
