import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const vigia = (alvo: string) => (d: { kind: string; prompt: string; items?: { id: string; label: string }[] }) => (d.kind === 'arrange' && d.prompt.includes(alvo)
  ? { kind: 'arrange' as const, order: d.items!.map((i) => i.id), placement: Object.fromEntries(d.items!.map((i, k) => [i.id, k === 0 ? 'graveyard' : 'top'])) }
  : null);

describe('Otherworldly Gaze', () => {
  it('vigia 3 da mão', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Otherworldly Gaze'], []], library: [['Forest', 'Plains', 'Swamp', 'Island'], []] });
    tg.script.push(vigia('Vigiar 3') as never);
    tg.cast('Otherworldly Gaze').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest', 'Otherworldly Gaze']);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp', 'Island']);
  });

  it('conjurada do cemitério pela retrospectiva {1}{U} sem ter sido conjurada antes, e depois exilada', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], graveyard: [['Otherworldly Gaze'], []], library: [['Forest', 'Plains', 'Swamp'], []] });
    tg.cast('Otherworldly Gaze', 'flashback').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Otherworldly Gaze']);
    expect(tg.all('Island').every((x) => tg.state.objects[x].tapped)).toBe(true);
  });
});
