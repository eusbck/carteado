import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Karmic Guide', () => {
  it('o eco dispara na primeira manutenção sob seu controle, não na seguinte', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Karmic Guide'], []], graveyard: [['Wall of Omens'], []],
      library: [['Island', 'Island', 'Island', 'Island'], ['Island', 'Island']],
    });
    tg.choose('carta de criatura alvo', ['Wall of Omens']);
    tg.cast('Karmic Guide').resolve().resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    let perguntas = 0;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('eco') ? (perguntas++, { kind: 'select', ids: ['yes'] }) : null));
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(perguntas).toBe(1);
    expect(tg.find('Karmic Guide')).not.toBeNull();
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('eco') ? (perguntas++, { kind: 'select', ids: ['yes'] }) : null));
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.number > 3 && x.state.turn.step === 'draw');
    expect(perguntas).toBe(1);
    expect(tg.find('Karmic Guide')).not.toBeNull();
  });
  it('sem pagar o eco, sacrifica', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Karmic Guide'], []], library: [['Island'], ['Island']] });
    tg.state.objects[tg.bf('Karmic Guide')].controlledSince = tg.state.turn.number;
    tg.yes('eco', false);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Karmic Guide']);
  });
});
