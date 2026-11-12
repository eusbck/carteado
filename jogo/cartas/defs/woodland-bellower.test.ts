import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Woodland Bellower', () => {
  it('coloca no campo uma criatura verde não lendária de valor 3 ou menos; lendárias e caras não aparecem', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []],
      hand: [['Woodland Bellower'], []],
      library: [['Ezuri, Renegade Leader', 'Woodland Bellower', 'Elvish Archdruid'], []],
    });
    let opcoes: string[] = [];
    tg.yes('Woodland Bellower', true);
    tg.script.push((d) => {
      if (d.kind === 'select' && d.prompt.includes('procure uma carta de criatura verde')) {
        opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
        const it = d.items.find((i) => i.label.includes('Elvish Archdruid'))!;
        return { kind: 'select', ids: [it.id] };
      }
      return null;
    });
    tg.cast('Woodland Bellower').resolve();
    tg.resolveAll();
    expect(tg.find('Elvish Archdruid')).not.toBeNull();
    expect(opcoes.some((l) => l.includes('Ezuri'))).toBe(false);
    expect(opcoes.some((l) => l.includes('Woodland'))).toBe(false);
  });
});
