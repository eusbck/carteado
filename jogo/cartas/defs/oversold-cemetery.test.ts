import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

const ate = (tg: ReturnType<typeof setup>) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');

describe('Oversold Cemetery', () => {
  it('com quatro cartas de criatura no cemitério, pode devolver a carta de criatura alvo', () => {
    const tg = setup({
      step: 'end', active: 1, battlefield: [['Oversold Cemetery'], []],
      graveyard: [['Wall of Omens', 'Elvish Mystic', 'Undead Augur', 'Midnight Reaper', 'Island'], []], library: [['Island'], ['Island']],
    });
    tg.choose('carta de criatura alvo', ['Midnight Reaper']).yes('Oversold Cemetery', true);
    ate(tg).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Midnight Reaper']);
  });
  it('CR 603.4: com três cartas de criatura (mais terrenos), não dispara', () => {
    const tg = setup({
      step: 'end', active: 1, battlefield: [['Oversold Cemetery'], []],
      graveyard: [['Wall of Omens', 'Elvish Mystic', 'Undead Augur', 'Island', 'Swamp'], []], library: [['Island'], ['Island']],
    });
    ate(tg);
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('CR 603.4: com menos de quatro ao resolver, não faz nada', () => {
    const tg = setup({
      step: 'end', active: 1, battlefield: [['Oversold Cemetery'], []],
      graveyard: [['Wall of Omens', 'Elvish Mystic', 'Undead Augur', 'Midnight Reaper'], []], library: [['Island'], ['Island']],
    });
    tg.choose('carta de criatura alvo', ['Midnight Reaper']).yes('Oversold Cemetery', true);
    ate(tg);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.run(exile(tg.g, [tg.find('Wall of Omens', 'graveyard')!]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.find('Midnight Reaper', 'graveyard')).not.toBeNull();
  });
  it('é opcional: pode escolher não devolver', () => {
    const tg = setup({
      step: 'end', active: 1, battlefield: [['Oversold Cemetery'], []],
      graveyard: [['Wall of Omens', 'Elvish Mystic', 'Undead Augur', 'Midnight Reaper'], []], library: [['Island'], ['Island']],
    });
    tg.yes('Oversold Cemetery', false);
    ate(tg).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
