import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Hero's Blade";

describe(N, () => {
  it('quando uma criatura lendária sua entra, você pode anexar a lâmina; a equipada recebe +3/+2', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Mountain')], []], hand: [['Tokka & Rahzar, Unsupervised', 'Silver Myr'], []] });
    tg.yes("Hero's Blade", true).cast('Tokka & Rahzar, Unsupervised').resolveAll();
    const tr = tg.bf('Tokka & Rahzar, Unsupervised');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tr);
    expect(tg.pt(tr)).toEqual([6, 5]);
  });

  it('criatura não lendária não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []], hand: [['Silver Myr'], []] });
    tg.script.push((d) => { if ('prompt' in d && String(d.prompt).includes("Hero's Blade")) throw new Error('não devia perguntar'); return null; });
    tg.cast('Silver Myr').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBeNull();
  });
});