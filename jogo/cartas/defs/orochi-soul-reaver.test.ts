import { describe, expect, it } from 'vitest';
import { buildView } from '../../motor/view.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Orochi Soul-Reaver';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('cria um Treasure e manifesta o topo do jogador atingido; só você vê a carta manifestada', () => {
    const tg = setup({ battlefield: [[N, 'Slither Blade'], []], library: [ilhas, ['Baleful Strix', ...ilhas]] });
    tg.attack([[N, 1], ['Slither Blade', 1]]).passTo('main2', 0);
    // um gatilho só para o mesmo jogador
    expect(tg.all('Treasure')).toHaveLength(1);
    const manifestada = tg.state.zones.battlefield.find((id) => tg.state.objects[id].faceDown)!;
    expect(manifestada).toBeDefined();
    expect(tg.state.objects[manifestada].def).toBe('Baleful Strix');
    expect(tg.state.objects[manifestada].owner).toBe(1);
    expect(tg.state.objects[manifestada].controller).toBe(0);
    expect(tg.pt(manifestada)).toEqual([2, 2]);
    const visaoBruno = buildView(tg.g, 1, null).battlefield.find((o) => o.id === manifestada)!;
    expect(visaoBruno.name).toBe('Virada para baixo');
    const visaoAna = buildView(tg.g, 0, null).battlefield.find((o) => o.id === manifestada)!;
    expect(visaoAna.name).not.toBe('Virada para baixo');
  });
});
