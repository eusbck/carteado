import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Calculated Dismissal';
const ND = "Night's Whisper";

describe(N, () => {
  it('com maestria em mágicas, faz vidência 2 mesmo que o controlador pague {3}', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Island', 'Island', 'Island']],
      hand: [[ND], [N]], graveyard: [[], ['Cancel', 'Index']], library: [['Forest', 'Forest', 'Forest'], ['Plains', 'Swamp', 'Island']],
    });
    tg.cast(ND).pass();
    tg.yes('Pagar {3}', true);
    let videncia = false;
    tg.script.push((d) => { if (d.kind === 'arrange' && d.player === 1) { videncia = true; return { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) }; } return null; });
    tg.choose('mágica alvo', [ND]).cast(N).resolve();
    expect(tg.find(ND, 'stack')).not.toBeNull();
    expect(videncia).toBe(true);
    expect(tg.names(1, 'library')).toEqual(['Island', 'Plains', 'Swamp']);
  });
  it('anulando a própria mágica, ela já conta para a maestria em mágicas', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Index', N], []], graveyard: [['Cancel'], []], library: [['Forest', 'Swamp', 'Plains', 'Island', 'Mountain', 'Forest'], []] });
    tg.cast('Index');
    tg.yes('Pagar {3}', false);
    let videncia = false;
    tg.script.push((d) => { if (d.kind === 'arrange') { videncia = true; } return null; });
    tg.choose('mágica alvo', ['Index']).cast(N).resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Cancel', 'Index']);
    expect(videncia).toBe(true);
  });
  it('sem maestria, não faz vidência', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island', 'Island']], hand: [[ND], [N]], library: [[], ['Plains', 'Swamp']] });
    tg.cast(ND).pass();
    tg.yes('Pagar {3}', false);
    let videncia = false;
    tg.script.push((d) => { if (d.kind === 'arrange') { videncia = true; } return null; });
    tg.choose('mágica alvo', [ND]).cast(N).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([ND]);
    expect(videncia).toBe(false);
  });
});
