import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Invisible Force Field';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('até quatro permanentes alvo que você controla ganham indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Indomitable Ancients', 'Sol Ring', 'Elvish Mystic'], ['Wall of Omens']], hand: [[N], []], library: [forests, forests] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('que você controla')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Indomitable Ancients' || i.label === 'Sol Ring').map((i) => i.id) };
    });
    tg.cast(N).resolveAll();
    // os permanentes do oponente não podem ser alvo
    expect(alvos).not.toContain('Wall of Omens');
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Sol Ring'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'indestructible')).toBe(false);
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients'), tg.bf('Elvish Mystic')]));
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
  });

  it('CR 702.88a: ricochete — na sua próxima manutenção, conjura do exílio sem pagar', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Indomitable Ancients'], []], hand: [[N], []], library: [forests, forests] });
    tg.choose('que você controla', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    tg.yes('Ricochete', true).choose('que você controla', ['Indomitable Ancients']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(true);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('recusando o ricochete, a carta fica exilada', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Indomitable Ancients'], []], hand: [[N], []], library: [forests, forests] });
    tg.choose('que você controla', ['Indomitable Ancients']).cast(N).resolveAll();
    tg.yes('Ricochete', false);
    tg.passTo('main1', 0);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.canCast(N)).toBe(false);
  });
});
