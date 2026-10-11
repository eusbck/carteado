import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Collective Effort';
const DESTRUIR = 'Destrua a criatura alvo com força 4 ou mais';
const ENCANTAMENTO = 'Destrua o encantamento alvo';
const MARCADORES = 'Coloque um marcador +1/+1 em cada criatura que o jogador alvo controla';
const planicies = ['Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('um modo só não cobra a escalada', () => {
    const tg = setup({ battlefield: [[...planicies, 'Elvish Mystic'], ['Lathliss, Dragon Queen', 'Indomitable Ancients']], hand: [[N], []] });
    let alvos: string[] = [];
    tg.choose('modo', [DESTRUIR]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('força 4 ou mais')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Lathliss, Dragon Queen')!.id] };
    });
    tg.cast(N).resolveAll();
    // só a criatura com força 4 ou mais pode ser alvo
    expect(alvos).toEqual(['Lathliss, Dragon Queen']);
    expect(tg.find('Lathliss, Dragon Queen')).toBeNull();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
  });

  it('CR 702.120a: com três modos, vira duas criaturas (mesmo com enjoo) e faz os três efeitos em ordem', () => {
    const tg = setup({
      battlefield: [[...planicies, { name: 'Elvish Mystic', ready: false }, { name: 'Silver Myr', ready: false }, 'Wall of Omens'], ['Lathliss, Dragon Queen', 'Stensia Masquerade']],
      hand: [[N], []],
    });
    tg.choose('modo', [DESTRUIR, ENCANTAMENTO, MARCADORES]);
    tg.choose('força 4 ou mais', ['Lathliss, Dragon Queen']).choose('encantamento alvo', ['Stensia Masquerade']).choose('jogador alvo', ['Ana']);
    tg.cast(N).resolveAll();
    expect(tg.find('Lathliss, Dragon Queen')).toBeNull();
    expect(tg.find('Stensia Masquerade')).toBeNull();
    const minhas = ['Elvish Mystic', 'Silver Myr', 'Wall of Omens'].map((n) => tg.state.objects[tg.bf(n)]);
    expect(minhas.every((o) => o.counters['+1/+1'] === 1)).toBe(true);
    // dois modos além do primeiro: duas criaturas viradas
    expect(minhas.filter((o) => o.tapped)).toHaveLength(2);
  });

  it('sem criaturas desviradas suficientes, não dá para escolher os três modos', () => {
    const tg = setup({ battlefield: [[...planicies, 'Elvish Mystic'], ['Lathliss, Dragon Queen', 'Stensia Masquerade']], hand: [[N], []] });
    tg.choose('modo', [DESTRUIR, ENCANTAMENTO, MARCADORES]);
    tg.choose('força 4 ou mais', ['Lathliss, Dragon Queen']).choose('encantamento alvo', ['Stensia Masquerade']).choose('jogador alvo', ['Ana']);
    // com uma criatura só, o custo de dois modos extras não pode ser pago: a conjuração é desfeita
    try { tg.cast(N); } catch { /* a ação pode ser recusada na escolha ou no pagamento */ }
    tg.settle();
    expect(tg.find('Lathliss, Dragon Queen')).not.toBeNull();
    expect(tg.find('Stensia Masquerade')).not.toBeNull();
  });
});
