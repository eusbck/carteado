import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bloodsoaked Champion';
const ativavel = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith('act:'));

describe(N, () => {
  it('não pode bloquear', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Indomitable Ancients']], library: [['Island'], ['Island']] });
    let podia = false;
    tg.script.push((d) => { if (d.kind === 'blockers') podia = d.candidates.length > 0; return null; });
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2');
    expect(podia).toBe(false);
    expect(tg.life(0)).toBe(38);
  });

  it('depois de atacar com qualquer criatura, volta do cemitério para o campo por {1}{B}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Indomitable Ancients'], []], graveyard: [[N], []], library: [['Island'], ['Island']] });
    // sem ter atacado, não pode
    expect(ativavel(tg)).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    expect(ativavel(tg)).toBe(true);
    tg.activate(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    expect(tg.all('Swamp').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('ele mesmo atacou e morreu: o próprio ataque vale para a incursão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', N], []], library: [['Island'], ['Island']] });
    tg.attack([[N, 1]]).passTo('main2');
    tg.run(destroy(tg.g, [tg.bf(N)]));
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.activate(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });

  it('no turno seguinte, sem atacar de novo, não pode', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Indomitable Ancients'], []], graveyard: [[N], []], library: [Array(5).fill('Island'), Array(5).fill('Island')] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(ativavel(tg)).toBe(false);
  });
});
