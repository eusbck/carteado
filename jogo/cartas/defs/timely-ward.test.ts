import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const planicies = ['Plains', 'Plains', 'Plains'];

describe('Timely Ward', () => {
  it('a criatura encantada tem indestrutível; no tempo de feitiço, encanta qualquer criatura', () => {
    const tg = setup({ battlefield: [[...planicies, 'Wall of Omens'], []], hand: [['Timely Ward'], []] });
    tg.choose('criatura', ['Wall of Omens']).cast('Timely Ward').resolve();
    const wall = tg.bf('Wall of Omens');
    expect(tg.state.objects[tg.bf('Timely Ward')].attachedTo).toBe(wall);
    expect(hasKw(tg.g, wall, 'indestructible')).toBe(true);
  });

  it('no turno do oponente, pode ser conjurada como se tivesse lampejo, mas só mirando um comandante', () => {
    const tg = setup({
      active: 1,
      battlefield: [[...planicies, 'Wall of Omens'], [{ name: 'Zetalpa, Primal Dawn', commander: true }]],
      hand: [['Timely Ward'], []],
    });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    let oferecidos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criatura') ? (oferecidos = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.cast('Timely Ward', 'timely-ward');
    expect(oferecidos).toEqual(['Zetalpa, Primal Dawn']);
    tg.resolve();
    expect(tg.state.objects[tg.bf('Timely Ward')].attachedTo).toBe(tg.bf('Zetalpa, Primal Dawn'));
  });

  it('sem comandante no campo, não pode ser conjurada fora do tempo de feitiço', () => {
    const tg = setup({ active: 1, battlefield: [[...planicies, 'Wall of Omens'], ['Zetalpa, Primal Dawn']], hand: [['Timely Ward'], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast('Timely Ward')).toBe(false);
  });
});
