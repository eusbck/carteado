import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Necron Deathmark';

describe(N, () => {
  it('lampejo; ao entrar destrói até uma criatura alvo e o jogador alvo tritura três cartas', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), ['Serra Angel']], hand: [[N], []], library: [['Island'], Array(4).fill('Island')] });
    // o texto da habilidade aparece nas duas perguntas: responde pelo que é oferecido
    for (const nome of ['Serra Angel', 'Bruno']) tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === nome) : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flash')).toBe(true);
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.names(1, 'graveyard')).toHaveLength(4);
  });
});