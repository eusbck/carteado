import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bathe in Light';
const cor = (tg: ReturnType<typeof setup>, c: string) => tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('proteção contra qual cor') ? { kind: 'select', ids: [c] } : null));
const protegida = (tg: ReturnType<typeof setup>, nome: string) => kwParams(tg.g, tg.bf(nome), 'protection');

describe(N, () => {
  it('a criatura alvo e as que compartilham uma cor com ela ganham proteção contra a cor escolhida', () => {
    // Indomitable Ancients e Serra Angel são brancas; Oros é branco, preto e vermelho; Elvish Mystic é verde
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Indomitable Ancients', 'Elvish Mystic'], ['Serra Angel', 'Oros, the Avenger']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    cor(tg, 'R');
    tg.cast(N).resolveAll();
    for (const nome of ['Indomitable Ancients', 'Serra Angel', 'Oros, the Avenger']) expect(protegida(tg, nome)).toEqual(['color:R']);
    expect(protegida(tg, 'Elvish Mystic')).toEqual([]);
    tg.passTo('upkeep', 1);
    expect(protegida(tg, 'Serra Angel')).toEqual([]);
  });

  it('mirando uma criatura incolor, só ela é afetada', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Silver Myr'], ['Serra Angel']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Silver Myr']);
    cor(tg, 'B');
    tg.cast(N).resolveAll();
    expect(protegida(tg, 'Silver Myr')).toEqual(['color:B']);
    expect(protegida(tg, 'Serra Angel')).toEqual([]);
  });
});