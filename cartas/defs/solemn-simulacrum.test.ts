import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Solemn Simulacrum', () => {
  it('ao entrar, pode buscar um terreno básico para o campo virado', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Plains', 'Plains'], []], hand: [['Solemn Simulacrum'], []], library: [['Swamp'], []] });
    tg.yes('terreno básico', true).choose('Procure uma carta', ['Swamp']).cast('Solemn Simulacrum').resolve().resolve();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });
  it('ao morrer, pode comprar uma carta', () => {
    const tg = setup({ battlefield: [['Solemn Simulacrum', 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []], library: [['Island'], []] });
    tg.yes('comprar', true).choose('criatura alvo', ['Solemn Simulacrum']).cast('Infernal Grasp').resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
