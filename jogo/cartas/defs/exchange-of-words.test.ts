import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Exchange of Words';
const Z = 'Zetalpa, Primal Dawn';
const A = 'Indomitable Ancients';
const ilhas = ['Island', 'Island', 'Island'];
const palavras = ['flying', 'double strike', 'vigilance', 'trample', 'indestructible'];
const troca = (tg: ReturnType<typeof setup>, x: string, y: string) => tg.choose('primeira criatura alvo', [x]).choose('segunda criatura alvo', [y]).cast(N);

describe(N, () => {
  it('cada criatura perde o próprio texto de regras e fica com o da outra', () => {
    const tg = setup({ battlefield: [[...ilhas, Z], [A]], hand: [[N], []] });
    troca(tg, Z, A).resolveAll();
    const z = tg.bf(Z);
    const a = tg.bf(A);
    expect(chars(tg.g, z).abilities).toEqual([]);
    for (const kw of palavras) expect(hasKw(tg.g, a, kw)).toBe(true);
    // só a caixa de texto: nome, tipos, força e resistência continuam
    expect(tg.pt(z)).toEqual([4, 8]);
    expect(tg.pt(a)).toEqual([2, 10]);
    expect(chars(tg.g, a).subtypes).not.toContain('Dinosaur');
  });

  it('a habilidade concedida por uma Aura continua na criatura em que a Aura está', () => {
    // Basilisk Collar dá toque mortífero e vínculo com a vida à criatura equipada
    const tg = setup({ battlefield: [[...ilhas, Z, A, { name: 'Basilisk Collar', attachTo: A }], []], hand: [[N], []] });
    troca(tg, Z, A).resolveAll();
    expect(hasKw(tg.g, tg.bf(A), 'deathtouch')).toBe(true);
    expect(hasKw(tg.g, tg.bf(A), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf(Z), 'deathtouch')).toBe(false);
    expect(hasKw(tg.g, tg.bf(Z), 'flying')).toBe(false);
  });

  it('as habilidades desencadeadas vão junto com o texto e disparam uma vez só', () => {
    // Fatespinner: no início da manutenção de cada oponente, ele escolhe o que pula
    const tg = setup({ battlefield: [[...ilhas, 'Fatespinner', A], []], hand: [[N], []] });
    troca(tg, 'Fatespinner', A).resolveAll();
    expect(chars(tg.g, tg.bf('Fatespinner')).abilities).toEqual([]);
    let perguntas = 0;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Fatespinner: escolha')) perguntas++; return null; });
    tg.passTo('main1', 1);
    expect(perguntas).toBe(1);
  });

  it('a troca acaba quando Exchange of Words sai do campo, e não quando uma das criaturas sai', () => {
    const tg = setup({ battlefield: [[...ilhas, Z], [A]], hand: [[N], []] });
    troca(tg, Z, A).resolveAll();
    removeCard(tg, tg.bf(A));
    expect(hasKw(tg.g, tg.bf(Z), 'flying')).toBe(false);
    removeCard(tg, tg.bf(N));
    for (const kw of palavras) expect(hasKw(tg.g, tg.bf(Z), kw)).toBe(true);
  });

  it('se Exchange of Words sai do campo antes de o gatilho resolver, nada é trocado', () => {
    const tg = setup({ battlefield: [[...ilhas, Z], [A]], hand: [[N], []] });
    troca(tg, Z, A).resolve();
    expect(tg.state.zones.stack).toHaveLength(1);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(hasKw(tg.g, tg.bf(Z), 'flying')).toBe(true);
    expect(chars(tg.g, tg.bf(A)).abilities).toEqual([]);
  });
});
