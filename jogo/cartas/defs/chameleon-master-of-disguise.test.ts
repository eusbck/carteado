import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Chameleon, Master of Disguise';
const ilhas = (n: number) => Array(n).fill('Island');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('pode entrar como cópia de uma criatura que você controla, mantendo o próprio nome', () => {
    const tg = setup({ battlefield: [[...ilhas(4), 'Zetalpa, Primal Dawn'], ['Indomitable Ancients']], hand: [[N], []], library: [forests, forests] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('entrar como cópia')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Zetalpa, Primal Dawn')!.id] };
    });
    tg.cast(N).resolveAll();
    // só as suas criaturas; a do oponente não
    expect(opcoes).toEqual(['Não copiar', 'Zetalpa, Primal Dawn']);
    const id = tg.bf(N);
    expect(chars(tg.g, id).name).toBe(N);
    expect(tg.pt(id)).toEqual([4, 8]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    // com nome diferente, a regra da lenda não se aplica: a Zetalpa original continua no campo
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
  });

  it('sem copiar, entra como ele mesmo, 2/3', () => {
    const tg = setup({ battlefield: [[...ilhas(4), 'Zetalpa, Primal Dawn'], []], hand: [[N], []], library: [forests, forests] });
    tg.choose('entrar como cópia', ['Não copiar']).cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(chars(tg.g, tg.bf(N)).subtypes).toEqual(expect.arrayContaining(['Human', 'Shapeshifter', 'Villain']));
  });

  it('CR 702.187b: descartado neste turno, pode ser conjurado do cemitério por {2}{U}, no tempo de uma criatura', () => {
    const tg = setup({ battlefield: [ilhas(3), []], hand: [[N], []], library: [forests, forests] });
    expect(tg.canCast(N)).toBe(false);
    tg.run(discard(tg.g, 0, 1));
    tg.cast(N, 'mayhem').resolveAll();
    expect(tg.find(N)).not.toBeNull();
    // descartado no turno do oponente, não dá
    const dele = setup({ active: 1, battlefield: [ilhas(3), []], hand: [[N], []], library: [forests, forests] });
    dele.run(discard(dele.g, 0, 1));
    expect(dele.canCast(N)).toBe(false);
  });
});
