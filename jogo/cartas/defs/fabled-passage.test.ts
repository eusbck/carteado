import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Fabled Passage', () => {
  it('com quatro terrenos contando o novo (e não o Passage), o terreno é desvirado', () => {
    const tg = setup({ battlefield: [['Fabled Passage', 'Island', 'Island', 'Island'], []], library: [['Forest'], []] });
    tg.choose('terreno básico', ['Forest']).activate('Fabled Passage').resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });
  it('com menos de quatro, fica virado', () => {
    const tg = setup({ battlefield: [['Fabled Passage', 'Island', 'Island'], []], library: [['Forest'], []] });
    tg.choose('terreno básico', ['Forest']).activate('Fabled Passage').resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
});
