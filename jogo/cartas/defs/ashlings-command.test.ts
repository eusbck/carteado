import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addEffect } from '../../motor/api.ts';

const terrenos = ['Island', 'Island', 'Island', 'Mountain', 'Mountain'];

describe("Ashling's Command", () => {
  it('cópia de ficha copia a ficha original e não copia marcadores; o jogador alvo cria dois Tesouros', () => {
    const tg = setup({ battlefield: [[...terrenos, { name: 'Elemental 4/4', token: true, counters: { '+1/+1': 2 } }], []] , hand: [["Ashling's Command"], []] });
    tg.choose('modo', ['Crie uma ficha que é cópia do Elemental alvo que você controla', 'O jogador alvo cria duas fichas de Tesouro']);
    tg.choose('Elemental alvo', ['Elemental']).choose('cria os Tesouros', ['Ana']);
    tg.cast("Ashling's Command").resolve();
    const els = tg.all('Elemental');
    expect(els.length).toBe(2);
    expect(els.map((id) => tg.pt(id)).sort()).toEqual([[4, 4], [6, 6]]);
    expect(tg.all('Treasure').length).toBe(2);
  });
  it('copia o que o Elemental estiver copiando; 2 de dano a cada criatura do jogador alvo', () => {
    const tg = setup({ battlefield: [[...terrenos, { name: 'Elemental 1/1', token: true }], ['Elvish Mystic', 'Wall of Omens']], hand: [["Ashling's Command"], []] });
    // o Elemental 1/1 está copiando um Elemental 3/3 com voar
    addEffect(tg.g, { source: -1, sourceDef: '', controller: 0, duration: { kind: 'permanent' }, affected: [tg.bf('Elemental')], mods: [{ k: 'copy', of: { def: 'Elemental 3/3', face: 0 } }] });
    tg.refresh();
    tg.choose('modo', ['Crie uma ficha que é cópia do Elemental alvo que você controla', 'Causa 2 de dano a cada criatura que o jogador alvo controla']);
    tg.choose('Elemental alvo', ['Elemental']).choose('criaturas sofrem dano', ['Bruno']);
    tg.cast("Ashling's Command").resolve();
    expect(tg.all('Elemental').map((id) => tg.pt(id))).toEqual([[3, 3], [3, 3]]);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(2);
  });
});
