import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Valorous Stance';

describe(N, () => {
  it('primeiro modo: a criatura alvo ganha indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Silver Myr'], []], hand: [[N], []] });
    tg.choose('escolha', ['A criatura alvo ganha indestrutível até o fim do turno']).choose('criatura alvo', ['Silver Myr']);
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'indestructible')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'indestructible')).toBe(false);
  });

  it('segundo modo: destrói a criatura alvo com resistência 4 ou maior', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Silver Myr', 'Indomitable Ancients']], hand: [[N], []] });
    tg.choose('escolha', ['Destrua a criatura alvo com resistência 4 ou maior']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('resistência 4 ou maior')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Indomitable Ancients']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});