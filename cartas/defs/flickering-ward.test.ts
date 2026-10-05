import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Flickering Ward', () => {
  it('protegida de branco, outras Auras brancas caem, esta fica; {W}: volta à mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], []], hand: [['Flickering Ward'], []] });
    tg.choose('criatura', ['Wall of Omens']).choose('escolha uma cor', ['branco']);
    tg.cast('Flickering Ward').resolve();
    expect(tg.find('Flickering Ward')).not.toBeNull();
    expect(tg.find('Angelic Gift')).toBeNull();
    tg.activate('Flickering Ward').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Flickering Ward']);
  });
});
