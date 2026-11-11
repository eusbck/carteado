import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Arid Mesa';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Mountain ou Plains (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Plateau', 'Mountain', 'Plains'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mountain ou Plains')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Plateau')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(['Mountain', 'Plains', 'Plateau']);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Plateau')].tapped).toBe(false);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Mountain', 'Plains']);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Mountain'], []] });
    tg.choose('Mountain ou Plains', ['Mountain']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Mountain')).not.toBeNull();
  });
});
