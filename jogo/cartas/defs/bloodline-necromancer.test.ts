import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bloodline Necromancer';

describe(N, () => {
  it('vínculo com a vida; ao entrar, devolve um Vampire ou Wizard do seu cemitério para o campo', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Vampire Nighthawk', 'Elvish Mystic'], []] });
    tg.choose('Vampire ou Wizard alvo', ['Vampire Nighthawk']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 2]);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
    expect(tg.find('Vampire Nighthawk')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
  });

  it('criatura de outro tipo não é alvo', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Elvish Mystic'], []] });
    tg.choose('Vampire ou Wizard alvo', ['Elvish Mystic']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
  });
});
