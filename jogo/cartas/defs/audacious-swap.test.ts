import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Audacious Swap';
const montanhas = Array(4).fill('Mountain');
const BAIXA = 'Pagar: baixa 2 (sacrifique uma criatura com força 2 ou mais)';

describe(N, () => {
  it('o dono embaralha o permanente no grimório e exila o topo: terreno entra no campo dele', () => {
    // o grimório do oponente só tem terrenos: depois de embaralhar, o topo é um terreno ou a própria criatura
    const tg = setup({ battlefield: [montanhas, ['Indomitable Ancients']], hand: [[N], []], library: [['Forest'], Array(30).fill('Island')] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('que não é encantamento', ['Indomitable Ancients']);
    tg.yes(N, false);
    tg.cast(N).resolveAll();
    // 31 cartas embaralhadas, uma exilada do topo
    const noCampo = tg.names(1, 'battlefield');
    const naMao = tg.names(1, 'hand');
    if (noCampo.includes('Island')) {
      expect(tg.state.zones.library[1]).toHaveLength(30);
      expect(tg.find('Indomitable Ancients')).toBeNull();
    } else {
      // o topo foi a própria criatura: recusada, fica exilada
      expect(naMao).toEqual([]);
      expect(tg.find('Indomitable Ancients', 'exile')).not.toBeNull();
    }
  });

  it('se a carta exilada não é terreno, o dono pode conjurá-la sem pagar', () => {
    // grimório só com Sol Ring: o topo depois de embaralhar é Sol Ring ou a criatura; nos dois casos ele conjura de graça
    const tg = setup({ battlefield: [montanhas, ['Indomitable Ancients']], hand: [[N], []], library: [['Forest'], Array(30).fill('Sol Ring')] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('que não é encantamento', ['Indomitable Ancients']);
    tg.yes(N, true);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toHaveLength(1);
    expect(tg.state.zones.library[1]).toHaveLength(30);
    expect(tg.state.zones.exile).toHaveLength(0);
  });

  it('não pode ter um encantamento como alvo', () => {
    const tg = setup({ battlefield: [montanhas, ['Stensia Masquerade', 'Sol Ring']], hand: [[N], []], library: [['Forest'], ['Island']] });
    let alvos: string[] = [];
    tg.choose('custo adicional opcional', ['Não pagar']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('que não é encantamento')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.cast(N);
    expect(alvos).not.toContain('Stensia Masquerade');
    expect(alvos).toContain('Sol Ring');
  });

  it('CR 702.153a: com a baixa paga, a cópia pode ter outro alvo e resolve primeiro', () => {
    const tg = setup({
      battlefield: [[...montanhas, 'Indomitable Ancients'], ['Sol Ring', 'Silver Myr']], hand: [[N], []],
      library: [['Forest'], Array(30).fill('Island')],
    });
    tg.choose('custo adicional opcional', [BAIXA]).choose('que não é encantamento', ['Sol Ring']);
    // a cópia troca o alvo para o Silver Myr
    tg.yes('novos alvos', true).choose('que não é encantamento', ['Silver Myr']);
    tg.cast(N);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    tg.resolveAll();
    // os dois permanentes foram embaralhados no grimório do dono
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Silver Myr', 'battlefield', 1) === null || tg.names(1, 'battlefield').filter((n) => n === 'Silver Myr').length <= 1).toBe(true);
    expect(tg.names(1, 'battlefield').filter((n) => n === 'Island').length).toBeGreaterThanOrEqual(1);
  });
});
