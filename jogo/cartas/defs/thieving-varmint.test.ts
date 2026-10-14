import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Thieving Varmint';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('a mana paga uma mágica de outro dono; não paga uma sua', () => {
    // a Prismatic Lens de Bruno foi exilada por Gonti; Ana tem a dela na mão
    const tg = setup({ battlefield: [[N, { name: 'Gonti, Canny Acquisitor' }], []], hand: [['Prismatic Lens'], []], library: [ilhas, ['Prismatic Lens', ...ilhas]] });
    const v = tg.bf(N);
    expect(hasKw(tg.g, v, 'deathtouch')).toBe(true);
    expect(hasKw(tg.g, v, 'lifelink')).toBe(true);
    tg.attack([['Gonti, Canny Acquisitor', 1]]).passTo('main2', 0);
    // a sua Prismatic Lens não pode ser paga com a mana do Varmint
    const minha = tg.find('Prismatic Lens', 'hand', 0)!;
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.split(':').includes(String(minha)))).toBe(false);
    const lente = tg.state.zones.exile.find((id) => tg.state.objects[id].def === 'Prismatic Lens')!;
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(lente)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Prismatic Lens')].owner).toBe(1);
    // pagou 1 de vida
    expect(tg.life(0)).toBe(39);
  });
});
