import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Baral's Expertise";
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('devolve até três artefatos e criaturas e conjura de graça uma das devolvidas', () => {
    const tg = setup({ battlefield: [[...ilhas(5), 'Wall of Omens'], ['Indomitable Ancients', 'Sol Ring', 'Plains']], hand: [[N], []], library: [['Island'], []] });
    tg.choose('artefato e/ou criatura alvo', ['Indomitable Ancients', 'Sol Ring', 'Wall of Omens']);
    tg.choose('valor de mana 4 ou menos', ['Wall of Omens']);
    tg.cast(N).resolve();
    expect(tg.names(1, 'hand').sort()).toEqual(['Indomitable Ancients', 'Sol Ring']);
    expect(tg.find('Plains')).not.toBeNull();
    // o Wall of Omens foi conjurado de graça: está na pilha, e as Ilhas pagaram só a Expertise
    expect(tg.find('Wall of Omens', 'stack')).not.toBeNull();
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });

  it('terreno não é oferecido', () => {
    const tg = setup({ battlefield: [ilhas(5), []], hand: [[N, 'Forest', 'Opt'], []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 4 ou menos')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [] };
    });
    tg.cast(N).resolveAll();
    expect(oferecidas).toEqual(['Opt']);
  });
});
