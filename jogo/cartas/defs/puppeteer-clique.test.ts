import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Puppeteer Clique';
const pantanos = Array(5).fill('Swamp');

describe(N, () => {
  it('traz uma criatura do cemitério de um oponente com ímpeto e a exila no início da sua próxima etapa final', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []], graveyard: [['Elvish Mystic'], ['Indomitable Ancients', 'Sol Ring']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('cemitério de um oponente')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.cast(N).resolveAll();
    // só a carta de criatura do oponente: nem o artefato dele nem a sua criatura
    expect(alvos).toEqual(['Indomitable Ancients']);
    const id = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[id].controller).toBe(0);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    // ataca no mesmo turno e é exilada na sua etapa final
    tg.attack([['Indomitable Ancients', 1]]).passTo('end', 0);
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
  });

  it('persistir — volta com um marcador -1/-1 e a habilidade de entrar dispara de novo; com o marcador, não volta', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [[], ['Indomitable Ancients']] });
    tg.choose('cemitério de um oponente', ['Indomitable Ancients']);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    const volta = tg.bf(N);
    expect(tg.state.objects[volta].counters['-1/-1']).toBe(1);
    expect(tg.pt(volta)).toEqual([2, 1]);
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    tg.run(destroy(tg.g, [volta]));
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('sem carta de criatura no cemitério dos oponentes, entra sem fazer nada', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
  });
});
