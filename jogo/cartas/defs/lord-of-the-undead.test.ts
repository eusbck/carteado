import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Lord of the Undead', () => {
  it('dois Lords dão +1/+1 um ao outro; Zombies dos oponentes também recebem', () => {
    const tg = setup({ battlefield: [['Lord of the Undead', 'Lord of the Undead', 'Wall of Omens'], [{ name: 'Zombie 2/2', token: true }]] });
    const [a, b] = tg.all('Lord of the Undead');
    expect(tg.pt(a)).toEqual([3, 3]);
    expect(tg.pt(b)).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Zombie 2/2'))).toEqual([4, 4]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('sozinho, não se dá +1/+1', () => {
    const tg = setup({ battlefield: [['Lord of the Undead'], []] });
    expect(tg.pt(tg.bf('Lord of the Undead'))).toEqual([2, 2]);
  });
  it('{1}{B}, {T}: devolve a carta de Zombie alvo do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Lord of the Undead', 'Swamp', 'Swamp'], []], graveyard: [['Wall of Omens', "Stitcher's Supplier"], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de Zombie alvo')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === "Stitcher's Supplier")!.id] };
    });
    tg.activate('Lord of the Undead').resolve();
    expect(opcoes).toEqual(["Stitcher's Supplier"]);
    expect(tg.names(0, 'hand')).toEqual(["Stitcher's Supplier"]);
    expect(tg.state.objects[tg.bf('Lord of the Undead')].tapped).toBe(true);
  });
});
