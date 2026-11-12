import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wirewood Symbiote', () => {
  it('devolve um Elfo como custo e desvira a criatura alvo; só uma vez por turno', () => {
    const tg = setup({ battlefield: [['Wirewood Symbiote', 'Llanowar Elves', { name: 'Elvish Mystic', tapped: true }], []] });
    tg.choose('Devolva', ['Llanowar Elves']).choose('criatura alvo', ['Elvish Mystic']).activate('Wirewood Symbiote').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Llanowar Elves']);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes(String(tg.bf('Wirewood Symbiote'))))).toBe(false);
  });
});
