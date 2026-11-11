import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Verdant Catacombs';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Swamp ou Forest (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains', 'Bayou', 'Swamp', 'Forest'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Swamp ou Forest')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Bayou')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(['Bayou', 'Forest', 'Swamp']);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Bayou')].tapped).toBe(false);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Plains', 'Swamp']);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Swamp'], []] });
    tg.choose('Swamp ou Forest', ['Swamp']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Swamp')).not.toBeNull();
  });
});
