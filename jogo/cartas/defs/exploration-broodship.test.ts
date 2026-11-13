import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Exploration Broodship';
const doCemiterio = (tg: ReturnType<typeof setup>, nome: string) =>
  tg.actionIds().find((a) => a.startsWith('cast:') && a.includes(':perm:broodship') && a.split(':').includes(String(tg.find(nome, 'graveyard'))));

describe(N, () => {
  it('com 3+, joga um terreno adicional; sem 8, não é criatura nem conjura do cemitério', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 3 } }, 'Forest'], []], hand: [['Forest', 'Forest'], []], graveyard: [['Sol Ring'], []] });
    expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    expect(doCemiterio(tg, 'Sol Ring')).toBeUndefined();
    tg.play('Forest').play('Forest');
    expect(tg.all('Forest').length).toBe(3);
  });
  it('com 8+, conjura uma mágica de permanente do cemitério pagando o custo e sacrificando um terreno, uma vez por turno', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 8 } }, 'Forest', 'Forest', 'Swamp'], []], graveyard: [['Sol Ring', 'Elvish Mystic', 'Mountain'], []] });
    const b = tg.bf(N);
    expect(isCreature(tg.g, b)).toBe(true);
    expect(hasKw(tg.g, b, 'flying')).toBe(true);
    expect(tg.pt(b)).toEqual([4, 4]);
    // terreno não se conjura
    expect(doCemiterio(tg, 'Mountain')).toBeUndefined();
    const acao = doCemiterio(tg, 'Sol Ring');
    expect(acao).toBeDefined();
    tg.choose('Sacrifique', ['Swamp']);
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    tg.resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Swamp')).toBeNull();
    // uma vez por turno
    expect(doCemiterio(tg, 'Elvish Mystic')).toBeUndefined();
  });
});
