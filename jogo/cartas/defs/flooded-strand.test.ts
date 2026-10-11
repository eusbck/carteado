import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Flooded Strand';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Plains ou Island (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Swamp', 'Tundra', 'Plains', 'Island'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Plains ou Island')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Tundra')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(["Island","Plains","Tundra"]);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Tundra')].tapped).toBe(false);
    expect(tg.names(0, 'library').sort()).toEqual(["Island","Plains","Swamp"]);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains'], []] });
    tg.choose('Plains ou Island', ['Plains']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Plains')).not.toBeNull();
  });
});
