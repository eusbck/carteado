import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Speaker of the Heavens';
const podeAtivar = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith('act:'));

describe(N, () => {
  it('vigilância e vínculo com a vida; com 7 de vida a mais que o total inicial, {T} cria um Angel 4/4 com voar', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(true);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
    expect(podeAtivar(tg)).toBe(false);
    tg.state.players[0].life = 47;
    tg.refresh();
    tg.activate(N).resolveAll();
    const anjo = tg.bf('Angel');
    expect(tg.pt(anjo)).toEqual([4, 4]);
    expect(hasKw(tg.g, anjo, 'flying')).toBe(true);
  });

  it('só como feitiço', () => {
    const tg = setup({ active: 1, battlefield: [[N], []] });
    tg.state.players[0].life = 50;
    tg.refresh();
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(podeAtivar(tg)).toBe(false);
  });
});