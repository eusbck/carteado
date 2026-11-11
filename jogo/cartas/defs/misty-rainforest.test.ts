import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Misty Rainforest';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Forest ou Island (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains', 'Rain-Slicked Copse', 'Island', 'Forest'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Forest ou Island')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Rain-Slicked Copse')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(["Forest","Island","Rain-Slicked Copse"]);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'library').sort()).toEqual(["Forest","Island","Plains"]);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island'], []] });
    tg.choose('Forest ou Island', ['Island']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Island')).not.toBeNull();
  });
});
