import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Abstract Performance', () => {
  it('o oponente escolhe sem ver a pilha virada para baixo; da outra, uma mágica de graça e o resto na mão', () => {
    const tg = setup({
      battlefield: [[...Array(6).fill('Island')], []], hand: [['Abstract Performance'], []],
      library: [['Plains', 'Plains', 'Plains', 'Plains', "Night's Whisper", 'Swamp', 'Swamp', 'Island', 'Mountain', 'Mountain'], []],
    });
    let rotulos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.player === 1 && d.prompt.includes('pilha') ? (rotulos = d.items.map((i) => i.label), { kind: 'select', ids: ['fechada'] }) : null));
    tg.choose('escolha uma mágica', ["Night's Whisper"]).yes('Conjurar');
    tg.cast('Abstract Performance').resolveAll();
    expect(rotulos[0]).toBe('Pilha virada para baixo (4 cartas)');
    expect(rotulos[1]).toContain("Night's Whisper");
    expect(tg.names(0, 'graveyard').filter((n) => n === 'Plains').length).toBe(4);
    // Night's Whisper foi conjurado (compra 2: Mountain, Mountain) e o resto foi para a mão
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Mountain', 'Mountain', 'Swamp', 'Swamp']);
  });
});
