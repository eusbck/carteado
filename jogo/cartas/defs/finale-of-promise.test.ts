import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Finale of Promise';
const CONJURAR = 'escolha uma carta para conjurar';
const terrenos = (x: number) => ['Mountain', 'Mountain', ...Array(x).fill('Island')];

describe(N, () => {
  it('conjura de graça uma instantânea e um feitiço do cemitério, que vão para o exílio depois', () => {
    const tg = setup({ battlefield: [terrenos(2), []], hand: [[N], []], graveyard: [['Opt', 'Serum Visions', 'Think Twice'], []], library: [['Plains', 'Swamp', 'Forest', 'Island'], []] });
    tg.number('valor de X', 1);
    tg.choose('carta de instantânea alvo', ['Opt']).choose('carta de feitiço alvo', ['Serum Visions']);
    tg.choose(CONJURAR, ['Serum Visions']).choose(CONJURAR, ['Opt']);
    tg.cast(N).resolve();
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toEqual(['Serum Visions', 'Opt']);
    tg.resolveAll();
    expect(tg.names(0, 'exile').sort()).toEqual(['Opt', 'Serum Visions']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Think Twice'].sort());
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('só cartas com valor de mana X ou menos podem ser alvo', () => {
    const tg = setup({ battlefield: [terrenos(1), []], hand: [[N], []], graveyard: [['Opt', 'Think Twice'], []] });
    let oferecidas: string[] = [];
    tg.number('valor de X', 1);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de instantânea alvo')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [] };
    });
    tg.cast(N);
    expect(oferecidas).toEqual(['Opt']);
  });

  it('com X 10 ou mais, conjura as duas e copia cada uma duas vezes; as cópias vão para a pilha na ordem escolhida', () => {
    const tg = setup({ battlefield: [terrenos(10), []], hand: [[N], []], graveyard: [['Opt', 'Serum Visions'], []], library: [Array(12).fill('Plains'), []] });
    tg.number('valor de X', 10);
    tg.choose('carta de instantânea alvo', ['Opt']).choose('carta de feitiço alvo', ['Serum Visions']);
    tg.choose(CONJURAR, ['Opt']).choose(CONJURAR, ['Serum Visions']);
    // ruling 1: a ordem das quatro cópias é do jogador; quando só sobra uma mágica, não pergunta mais
    const ORDEM = 'próxima cópia a ir para a pilha';
    tg.choose(ORDEM, ['Cópia de Serum Visions (2 por pôr)']).choose(ORDEM, ['Cópia de Opt (2 por pôr)']).choose(ORDEM, ['Cópia de Serum Visions (1 por pôr)']);
    tg.cast(N).resolve();
    const pilha = tg.state.zones.stack.map((id) => tg.state.objects[id]);
    expect(pilha.filter((o) => !o.isCopy).map((o) => o.def)).toEqual(['Opt', 'Serum Visions']);
    expect(pilha.filter((o) => o.isCopy).map((o) => o.def)).toEqual(['Serum Visions', 'Opt', 'Serum Visions', 'Opt']);
    tg.resolveAll();
    // seis resoluções: cada uma compra uma carta
    expect(tg.names(0, 'hand')).toHaveLength(6);
  });
});
