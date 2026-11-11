import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Janice Rand, Essential Aide';

describe(N, () => {
  it('quando o seu comandante ataca, ganha um marcador e o primeiro terreno revelado entra virado; o resto vai para o fundo', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Indomitable Ancients', commander: true }, 'Elvish Mystic'], []],
      library: [['Sol Ring', 'Wall of Omens', 'Forest', 'Island'], []],
    });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.names(0, 'library')[0]).toBe('Island');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Sol Ring', 'Wall of Omens']);
  });
  it('uma criatura que não é comandante atacando não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []], library: [['Forest'], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'library')).toEqual(['Forest']);
  });
});
