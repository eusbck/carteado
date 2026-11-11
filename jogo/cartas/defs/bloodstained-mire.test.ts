import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Bloodstained Mire';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Swamp ou Mountain (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains', 'Badlands', 'Swamp', 'Mountain'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Swamp ou Mountain')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Badlands')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(['Badlands', 'Mountain', 'Swamp']);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Badlands')].tapped).toBe(false);
    expect(tg.names(0, 'library').sort()).toEqual(['Mountain', 'Plains', 'Swamp']);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Swamp'], []] });
    tg.choose('Swamp ou Mountain', ['Swamp']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Swamp')).not.toBeNull();
  });
});
