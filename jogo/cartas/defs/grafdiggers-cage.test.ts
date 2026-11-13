import { describe, expect, it } from 'vitest';
import { manifest, putOntoBattlefield } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "Grafdigger's Cage";

describe(N, () => {
  it('carta de criatura do cemitério não entra no campo; carta que não é de criatura entra', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Spellseeker', 'Sol Ring'], []] });
    const criatura = tg.find('Spellseeker', 'graveyard', 0)!;
    const anel = tg.find('Sol Ring', 'graveyard', 0)!;
    tg.run(putOntoBattlefield(tg.g, [{ id: criatura, controller: 0 }, { id: anel, controller: 0 }], 'effect'));
    expect(tg.find('Spellseeker')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it('carta de criatura do grimório também não entra; da mão entra', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Elvish Mystic'], []], library: [['Spellseeker'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Spellseeker', 'library', 0)!, controller: 0 }], 'effect'));
    expect(tg.find('Spellseeker')).toBeNull();
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Elvish Mystic', 'hand', 0)!, controller: 0 }], 'effect'));
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
  it('manifestar do grimório não acontece', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Opt'], []] });
    expect(tg.run(manifest(tg.g, 0))).toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Opt']);
  });
  it('ninguém conjura mágicas do cemitério (retrospectiva)', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [['Deep Analysis'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':flashback'))).toBe(false);
  });
});
