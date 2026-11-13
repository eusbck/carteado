import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Scalding Tarn';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Island ou Mountain (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains', 'Coastal Peak', 'Island', 'Mountain'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Island ou Mountain')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Coastal Peak')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(["Coastal Peak","Island","Mountain"]);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'library').sort()).toEqual(["Island","Mountain","Plains"]);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island'], []] });
    tg.choose('Island ou Mountain', ['Island']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Island')).not.toBeNull();
  });
});
