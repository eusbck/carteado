import { describe, expect, it } from 'vitest';
import { controllerOf, tap } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Grishnákh, Brash Instigator';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('reúne Orcs 2 e rouba até o fim do turno uma criatura não lendária de força até a do Army', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients', 'Knollspine Dragon']], library: [lib, lib] });
    const anciao = tg.bf('Indomitable Ancients');
    tap(tg.g, anciao);
    tg.choose('criatura não lendária alvo', ['Indomitable Ancients']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([2, 2]);
    expect(controllerOf(tg.g, anciao)).toBe(0);
    expect(tg.state.objects[anciao].tapped).toBe(false);
    expect(hasKw(tg.g, anciao, 'haste')).toBe(true);
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, anciao)).toBe(1);
  });

  it('criatura com força maior que a do Army não é alvo', () => {
    const tg = setup({ battlefield: [[], ['Knollspine Dragon']], library: [lib, lib] });
    tg.choose('criatura não lendária alvo', ['Knollspine Dragon']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Knollspine Dragon'))).toBe(1);
  });
});
