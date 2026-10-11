import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Marsh Flats';

describe(NOME, () => {
  it('{T}, pague 1 de vida, sacrifique: põe no campo, desvirada, uma carta de Plains ou Swamp (inclusive não básica)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Scrubland', 'Plains', 'Swamp'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Plains ou Swamp')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Scrubland')!.id] };
    });
    tg.activate(NOME).resolve();
    expect(habilitadas).toEqual(["Plains","Scrubland","Swamp"]);
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Scrubland')].tapped).toBe(false);
    expect(tg.names(0, 'library').sort()).toEqual(["Island","Plains","Swamp"]);
  });
  it('não é habilidade de mana: vai para a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Plains'], []] });
    tg.choose('Plains ou Swamp', ['Plains']).activate(NOME);
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.find(NOME)).toBeNull();
    tg.resolve();
    expect(tg.find('Plains')).not.toBeNull();
  });
});
