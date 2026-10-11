import { describe, expect, it } from 'vitest';
import { destroy, exile } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Syrix, Carrier of the Flame';
const F = 'Rekindling Phoenix';
const terrenos = ['Swamp', 'Mountain', 'Swamp', 'Mountain'];

describe(N, () => {
  it('se uma carta de criatura saiu do seu cemitério no turno, na etapa final a Phoenix alvo causa dano igual à força dela', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Elvish Mystic', 'Sol Ring'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flying') && hasKw(tg.g, tg.bf(N), 'haste')).toBe(true);
    tg.run(exile(tg.g, [tg.find('Elvish Mystic', 'graveyard', 0)!]));
    tg.choose('Phoenix alvo', [N]).choose('qualquer alvo', ['Bruno']);
    tg.passTo('upkeep', 1);
    expect(tg.life(1)).toBe(37);
  });

  it('se só saiu uma carta que não é de criatura, não dispara', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Sol Ring'], []] });
    tg.run(exile(tg.g, [tg.find('Sol Ring', 'graveyard', 0)!]));
    tg.passTo('upkeep', 1);
    expect(tg.life(1)).toBe(40);
  });

  it('no cemitério, quando outra Phoenix sua morre, pode ser conjurada na hora pagando o custo', () => {
    const tg = setup({ active: 1, battlefield: [[...terrenos, F], []], graveyard: [[N], []] });
    tg.yes('Syrix', true);
    tg.run(destroy(tg.g, [tg.bf(F)]));
    tg.resolveAll();
    // conjurada no turno do oponente, durante a resolução do gatilho, com os quatro terrenos virados
    expect(tg.find(N)).not.toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(4);
  });

  it('morrendo junto com a outra Phoenix, não dispara', () => {
    const tg = setup({ battlefield: [[...terrenos, N, F], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Syrix')) perguntou = true; return null; });
    tg.run(destroy(tg.g, [tg.bf(N), tg.bf(F)]));
    tg.resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
