import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { forcaResistencia } from '../../testes/padroes.ts';

describe('Memnite', () => {
  it('custa {0} e entra como criatura artefato 1/1', () => {
    expect(forcaResistencia('Memnite')).toEqual([1, 1]);
    const tg = setup({ hand: [['Memnite'], []] });
    tg.cast('Memnite').resolve();
    expect(tg.find('Memnite', 'battlefield')).not.toBeNull();
  });
});
