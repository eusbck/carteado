import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

const T = 'Tannuk, Steadfast Second';
const dobra = (tg: ReturnType<typeof setup>, nome: string) =>
  tg.actionIds().find((a) => a.startsWith('cast:') && a.includes(':perm:warp') && a.split(':').includes(String(tg.find(nome, 'hand'))));

describe(T, () => {
  it('as suas outras criaturas têm ímpeto', () => {
    const tg = setup({ battlefield: [[T, 'Elvish Mystic'], []] });
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf(T), 'haste')).toBe(false);
  });

  it('cartas de artefato e de criatura vermelha na mão têm dobra {2}{R}; outras não', () => {
    const tg = setup({ battlefield: [[T, 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Dragon Whelp', 'Sol Ring', 'Elvish Mystic'], []] });
    expect(dobra(tg, 'Dragon Whelp')).toBeDefined();
    expect(dobra(tg, 'Sol Ring')).toBeDefined();
    expect(dobra(tg, 'Elvish Mystic')).toBeUndefined();
  });

  it('dobra: exilada no início da próxima etapa final; conjurável do exílio num turno posterior', () => {
    const tg = setup({
      battlefield: [[T, 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []],
      hand: [['Dragon Whelp'], []], library: [Array(5).fill('Island'), Array(5).fill('Island')],
    });
    tg.answer({ kind: 'priority', action: dobra(tg, 'Dragon Whelp')! });
    tg.resolve();
    expect(tg.find('Dragon Whelp', 'battlefield', 0)).not.toBeNull();
    // pagou {2}{R}: três terrenos virados
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(3);
    tg.passTo('end', 0);
    expect(tg.find('Dragon Whelp', 'exile', 0)).not.toBeNull();
    expect(tg.find('Dragon Whelp', 'battlefield', 0)).toBeNull();
    // no próximo turno de Ana, pode conjurá-la do exílio (pelo custo normal)
    tg.passTo('main1', 1).passTo('main1', 0);
    const ex2 = tg.find('Dragon Whelp', 'exile', 0)!;
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${ex2}:`))).toBe(true);
  });
});
