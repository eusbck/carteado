import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Stella Lee, Wild Card';
const podeJogar = (tg: ReturnType<typeof setup>, nome: string) => tg.actionIds().some((a) => a.startsWith('play:') && tg.state.objects[Number(a.split(':')[1])]?.def === nome);

describe(N, () => {
  it('a segunda mágica do turno exila a carta do topo, que pode ser jogada até o fim do seu próximo turno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Opt', 'Opt'], []], library: [['Plains', 'Mountain', 'Swamp', 'Forest'], []] });
    tg.cast('Opt').resolveAll();
    // a primeira mágica não dispara
    expect(tg.names(0, 'exile')).toEqual([]);
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Mountain']);
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Swamp']);
    tg.play('Mountain');
    expect(tg.find('Mountain')).not.toBeNull();
  });

  it('terreno exilado só pode ser jogado como terreno, na fase principal', () => {
    const tg = setup({
      battlefield: [[N, 'Island', 'Island'], []], hand: [['Opt', 'Opt'], []],
      library: [['Plains', 'Mountain', 'Swamp', 'Forest', 'Forest', 'Forest', 'Forest'], ['Plains', 'Plains', 'Plains', 'Plains']],
    });
    tg.cast('Opt').resolveAll();
    tg.cast('Opt').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Mountain']);
    tg.passTo('end');
    expect(podeJogar(tg, 'Mountain')).toBe(false);
    // no seu próximo turno ainda pode
    tg.passTo('main1', 0);
    expect(podeJogar(tg, 'Mountain')).toBe(true);
    // depois dele, não mais
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(podeJogar(tg, 'Mountain')).toBe(false);
  });

  it('com três mágicas no turno, copia uma instantânea sua com novos alvos; antes disso, não ativa', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Opt', 'Opt', 'Opt'], []], library: [['Plains', 'Mountain', 'Swamp', 'Forest', 'Forest', 'Forest'], []] });
    const ativa = () => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(N)}:`));
    tg.cast('Opt').resolveAll();
    tg.cast('Opt');
    // duas mágicas no turno: ainda não ativa
    expect(ativa()).toBe(false);
    tg.resolveAll();
    tg.cast('Opt');
    tg.choose('mágica instantânea ou de feitiço alvo que você controla', ['Opt']).activate(N);
    expect(tg.state.turnStats[0].spellsCast).toBe(3);
    tg.resolve();
    // a cópia está na pilha acima da Opt
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(1);
    const mao = tg.names(0, 'hand').length;
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao + 2);
    // a cópia não é conjurada: não conta como mágica do turno
    expect(tg.state.turnStats[0].spellsCast).toBe(3);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
