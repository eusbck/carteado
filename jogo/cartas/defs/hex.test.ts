import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const pantanos = Array(6).fill('Swamp');
const seis = ['Elvish Mystic', 'Silver Myr', 'Wall of Omens', 'Indomitable Ancients', 'Lathliss, Dragon Queen', 'Rapacious Dragon'];

describe('Hex', () => {
  it('precisa de seis criaturas diferentes como alvo; as que continuam legais são destruídas', () => {
    const cinco = setup({ battlefield: [pantanos, seis.slice(0, 5)], hand: [['Hex'], []] });
    expect(cinco.canCast('Hex')).toBe(false);

    const tg = setup({ battlefield: [[...pantanos, 'Elvish Mystic'], seis], hand: [['Hex'], []] });
    expect(tg.canCast('Hex')).toBe(true);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('seis criaturas alvo')) return null;
      // as seis do oponente (a sua também poderia ser alvo)
      return { kind: 'select', ids: d.items.filter((i) => !i.disabled && i.obj !== undefined && tg.state.objects[i.obj].controller === 1).map((i) => i.id) };
    });
    tg.cast('Hex');
    // uma delas sai em resposta: as outras cinco ainda são destruídas
    tg.run(exile(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toHaveLength(5);
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
  });
});
