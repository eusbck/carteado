import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Demolition Field', () => {
  it('os dois jogadores podem procurar um básico, que entra desvirado', () => {
    const tg = setup({ battlefield: [['Demolition Field', 'Sol Ring'], ['Command Tower']], library: [['Plains'], ['Forest']] });
    tg.choose('terreno não básico', ['Command Tower']);
    tg.yes('Procurar um terreno básico', true).choose('terreno básico', ['Forest']);
    tg.yes('Procurar um terreno básico', true).choose('terreno básico', ['Plains']);
    tg.activate('Demolition Field', 'Destrua').resolve();
    expect(tg.find('Command Tower')).toBeNull();
    expect(tg.state.objects[tg.bf('Forest', 1)].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Plains', 0)].tapped).toBe(false);
  });
  it('não pode mirar terreno básico', () => {
    const tg = setup({ battlefield: [['Demolition Field', 'Sol Ring'], ['Forest']] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
