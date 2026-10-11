import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cyclonic Rift';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('devolve o permanente não terreno alvo que você não controla para a mão do dono', () => {
    const tg = setup({ battlefield: [[...ilhas(2), 'Elvish Mystic'], ['Indomitable Ancients', 'Sol Ring', 'Forest']], hand: [[N], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('que você não controla')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.cast(N).resolveAll();
    // nem terrenos nem os seus permanentes podem ser alvo
    expect(alvos.sort()).toEqual(['Indomitable Ancients', 'Sol Ring']);
    expect(tg.names(1, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('CR 702.96b: com a sobrecarga, devolve cada permanente não terreno que você não controla, sem alvos', () => {
    const tg = setup({ players: 3, battlefield: [[...ilhas(7), 'Elvish Mystic'], ['Indomitable Ancients', 'Sol Ring', 'Forest'], ['Wall of Omens']], hand: [[N], [], []] });
    let pediuAlvo = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('alvo')) pediuAlvo = true; return null; });
    tg.cast(N, 'overload').resolveAll();
    expect(pediuAlvo).toBe(false);
    expect(tg.names(1, 'hand').sort()).toEqual(['Indomitable Ancients', 'Sol Ring']);
    expect(tg.names(2, 'hand')).toEqual(['Wall of Omens']);
    // os terrenos deles e os seus permanentes ficam
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('sem mana para a sobrecarga, só o custo normal aparece', () => {
    const tg = setup({ battlefield: [ilhas(2), ['Sol Ring']], hand: [[N], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':overload'))).toBe(false);
    expect(tg.canCast(N)).toBe(true);
  });
});
