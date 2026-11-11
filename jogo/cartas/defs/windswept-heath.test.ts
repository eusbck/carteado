import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Windswept Heath';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Forest ou Plains (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Savannah', 'Forest', 'Plains'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Forest ou Plains')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Savannah')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(['Forest', 'Plains', 'Savannah']);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Savannah')].tapped).toBe(false);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Island', 'Plains']);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Forest'], []] });
    tg.choose('Forest ou Plains', ['Forest']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Forest')).not.toBeNull();
  });
});
