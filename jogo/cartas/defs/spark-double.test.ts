import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Spark Double';
const ilhas = Array(4).fill('Island');

describe(N, () => {
  it('entra como cópia de uma criatura lendária sua, sem ser lendária e com um marcador +1/+1 a mais', () => {
    const tg = setup({ battlefield: [[...ilhas, 'The Frightful Four'], ['Indomitable Ancients']], hand: [[N], []] });
    const original = tg.bf('The Frightful Four');
    tg.choose('entrar como cópia', [original]).cast(N).resolveAll();
    const copias = tg.all('The Frightful Four');
    expect(copias).toHaveLength(2);
    const copia = copias.find((id) => id !== original)!;
    expect(chars(tg.g, copia).supertypes).not.toContain('Legendary');
    expect(chars(tg.g, original).supertypes).toContain('Legendary');
    expect(tg.state.objects[copia].counters['+1/+1']).toBe(1);
    expect(tg.pt(copia)).toEqual([5, 5]);
  });

  it('só as suas criaturas podem ser copiadas; sem copiar, é 0/0 e morre', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    expect(() => tg.choose('entrar como cópia', ['Indomitable Ancients']).cast(N).resolveAll()).toThrow();
    const sem = setup({ battlefield: [[...ilhas, 'Elvish Mystic'], []], hand: [[N], []] });
    sem.choose('entrar como cópia', ['Não copiar']).cast(N).resolveAll();
    expect(sem.names(0, 'graveyard')).toEqual([N]);
  });
});
