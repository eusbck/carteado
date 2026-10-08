import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sanar, Unfinished Genius // Wild Idea', () => {
  it('entra preparado; Wild Idea busca uma instantânea ou feitiço', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), ...Array(3).fill('Mountain')], []], hand: [['Sanar, Unfinished Genius // Wild Idea'], []], library: [['Plains', "Night's Whisper", 'Plains'], []] });
    tg.cast('Sanar, Unfinished Genius').resolve();
    const s = tg.bf('Sanar, Unfinished Genius');
    expect(tg.state.objects[s].prepared).toBe(true);
    tg.choose('instantânea ou feitiço', ["Night's Whisper"]);
    tg.cast('Wild Idea', 'prepared').resolve();
    expect(tg.names(0, 'hand')).toEqual(["Night's Whisper"]);
  });
  it('{T}: Tesouro só depois de conjurar uma instantânea ou feitiço no turno', () => {
    const tg = setup({ battlefield: [[{ name: 'Sanar, Unfinished Genius // Wild Idea', ready: true }, 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Plains', 'Plains'], []] });
    const s = tg.bf('Sanar, Unfinished Genius');
    const ativa = () => tg.actionIds().some((a) => a.startsWith(`act:${s}:`));
    expect(ativa()).toBe(false);
    tg.cast("Night's Whisper").resolve();
    expect(ativa()).toBe(true);
    tg.activate('Sanar, Unfinished Genius').resolve();
    expect(tg.all('Treasure').length).toBe(1);
  });
});
