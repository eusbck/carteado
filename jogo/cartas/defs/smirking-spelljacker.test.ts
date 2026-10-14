import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Smirking Spelljacker';

describe(N, () => {
  it('exila a mágica de um oponente; ao atacar, conjura a carta exilada de graça; depois ela não está mais exilada com a criatura', () => {
    const tg = setup({
      active: 1, battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], ['Island', 'Island', 'Swamp']],
      hand: [[N], ['Baleful Strix']],
    });
    tg.cast('Baleful Strix');
    tg.pass();
    // Ana responde com lampejo
    expect(tg.pending?.player).toBe(0);
    tg.choose('mágica alvo que um oponente controla', ['Baleful Strix']).cast(N).resolveAll();
    const strix = tg.find('Baleful Strix', 'exile')!;
    expect(strix).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].linked.spelljacker).toEqual([strix]);
    // no turno de Ana, ataca e conjura o Strix de Bruno de graça
    tg.passTo('main1', 0);
    tg.choose('escolha uma mágica para conjurar', ['Baleful Strix']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf('Baleful Strix')].controller).toBe(0);
    expect(tg.state.objects[tg.bf(N)].linked.spelljacker?.filter((id) => tg.state.objects[id]?.zone === 'exile') ?? []).toEqual([]);
  });

  it('não mira mágica sua', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Island', 'Swamp'], []], hand: [[N, 'Baleful Strix'], []] });
    tg.cast('Baleful Strix');
    let pediuAlvo = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('mágica alvo') ? ((pediuAlvo = true), { kind: 'select', ids: [] }) : null));
    tg.cast(N).resolveAll();
    expect(pediuAlvo).toBe(false);
    expect(tg.find('Baleful Strix')).not.toBeNull();
  });
});
