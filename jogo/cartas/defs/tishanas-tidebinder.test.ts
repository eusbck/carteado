import { describe, expect, it } from 'vitest';
import { chars, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';
import type { Decision } from '../../motor/types.ts';

const N = "Tishana's Tidebinder";
const tresIlhas = ['Island', 'Island', 'Island'];
/** responde a pergunta do alvo do Tidebinder com a primeira habilidade oferecida */
const primeiraHabilidade = (d: Decision) => (d.kind === 'select' && d.prompt.includes('até uma habilidade ativada') && d.items.length ? { kind: 'select' as const, ids: [d.items[0].id] } : null);

describe(N, () => {
  it('anula o gatilho de uma criatura e ela perde todas as habilidades enquanto o Tidebinder estiver no campo', () => {
    const tg = setup({ active: 1, battlefield: [tresIlhas, ['Island', 'Island', 'Island']], hand: [[N], ['Spellseeker']], library: [[], ['Opt', 'Forest']] });
    tg.cast('Spellseeker').resolve();
    // o gatilho de entrar do Spellseeker está na pilha
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.pass();
    tg.script.push(primeiraHabilidade);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual([]);
    const seeker = tg.bf('Spellseeker');
    expect(chars(tg.g, seeker).abilities).toEqual([]);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    expect(chars(tg.g, seeker).abilities.length).toBeGreaterThan(0);
  });
  it('a fonte que não é artefato, criatura nem planeswalker (um terreno) não perde as habilidades', () => {
    const tg = setup({ active: 1, battlefield: [tresIlhas, ['Ipnu Rivulet', 'Island', 'Island']], hand: [[N], []], library: [['Opt', 'Opt', 'Opt', 'Opt'], []] });
    tg.choose('jogador alvo', ['Ana']).choose('Desert', ['Ipnu Rivulet']).activate('Ipnu Rivulet', 'mói');
    tg.pass();
    tg.script.push(primeiraHabilidade);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')).toHaveLength(4);
  });
  it('se o Tidebinder sai do campo antes de resolver, a habilidade é anulada mas a fonte não perde nada', () => {
    const tg = setup({ active: 1, battlefield: [tresIlhas, ['Island', 'Island', 'Island']], hand: [[N], ['Spellseeker']], library: [[], ['Opt', 'Forest']] });
    tg.cast('Spellseeker').resolve().pass();
    tg.script.push(primeiraHabilidade);
    tg.cast(N).resolve();
    // o gatilho do Tidebinder está na pilha, acima do gatilho do Spellseeker
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(chars(tg.g, tg.bf('Spellseeker')).abilities.length).toBeGreaterThan(0);
  });
});
