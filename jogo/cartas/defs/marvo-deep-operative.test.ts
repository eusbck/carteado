import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Marvo, Deep Operative';
const ilhas = Array(6).fill('Island');

describe(N, () => {
  it('CR 701.30: atacando, entra em confronto com o defensor; vencendo, você compra e conjura de graça uma mágica de valor 8 ou menos', () => {
    // Indomitable Ancients (4) contra Island (0); Zetalpa tem valor de mana 8
    const tg = setup({ battlefield: [[N], []], hand: [['Zetalpa, Primal Dawn'], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 8]);
    tg.yes('Confronto', false);
    tg.choose('Marvo', ['Zetalpa, Primal Dawn']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Zetalpa, Primal Dawn', 'battlefield')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Indomitable Ancients']);
  });

  it('mágica de valor de mana 9 não pode ser conjurada assim', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Void Winnower'], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    tg.yes('Confronto', false);
    // a carta comprada (Indomitable Ancients, 4) é oferecida; Void Winnower (9), não
    tg.script.push((d) => { const t = JSON.stringify(d); if (t.includes('Marvo: você pode conjurar') && t.includes('Void Winnower')) throw new Error('não devia oferecer'); return null; });
    tg.choose('Marvo', []);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand').sort()).toEqual(['Indomitable Ancients', 'Void Winnower']);
  });

  it('perdendo ou empatando o confronto, nada acontece', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Zetalpa, Primal Dawn'], []], library: [ilhas, ['Indomitable Ancients', ...ilhas]] });
    tg.yes('Confronto', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
    const empate = setup({ battlefield: [[N], []], hand: [['Zetalpa, Primal Dawn'], []], library: [ilhas, ilhas] });
    empate.yes('Confronto', false);
    empate.attack([[N, 1]]).passTo('main2', 0);
    expect(empate.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
  });
});
