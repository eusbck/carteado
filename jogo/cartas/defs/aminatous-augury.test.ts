import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const AUG = "Aminatou's Augury";
const ilhas = Array(8).fill('Island');

describe(AUG, () => {
  it('coloca um terreno exilado no campo e conjura uma criatura e um artefato sem pagar; a segunda criatura, não', () => {
    const tg = setup({
      battlefield: [ilhas, ['Burnished Hart']], hand: [[AUG], []],
      library: [['Forest', 'Wall of Omens', 'Indomitable Ancients', 'Sol Ring', 'Utter End', 'Swamp', 'Swamp', 'Swamp', 'Plains', 'Plains'], []],
    });
    tg.choose('coloque um terreno exilado no campo', ['Forest']);
    tg.cast(AUG).resolve();
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Plains']);
    const opcoes = (nome: string) => tg.actionIds().filter((a) => a.startsWith('cast:') && a.includes('augury') && a.split(':')[1] === String(tg.find(nome, 'exile')));
    expect(opcoes('Wall of Omens')).toHaveLength(1);
    expect(opcoes('Sol Ring')).toHaveLength(1);
    // Utter End: a instantânea também tem o seu tipo (e um alvo, a Burnished Hart de Bruno)
    expect(opcoes('Utter End')).toHaveLength(1);
    tg.answer({ kind: 'priority', action: opcoes('Wall of Omens')[0] });
    tg.settle();
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(opcoes('Indomitable Ancients')).toHaveLength(0);
    tg.answer({ kind: 'priority', action: opcoes('Sol Ring')[0] });
    tg.settle();
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // nenhuma das Islands foi usada além das oito do Augury
    expect(tg.names(0, 'exile')).toEqual(expect.arrayContaining(['Indomitable Ancients', 'Utter End']));
  });

  it('a criatura artefato pode ser conjurada como artefato, deixando o tipo criatura livre', () => {
    const tg = setup({
      battlefield: [ilhas, []], hand: [[AUG], []],
      library: [['Burnished Hart', 'Wall of Omens', 'Sol Ring', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Plains'], []],
    });
    tg.choose('coloque um terreno exilado no campo', ['Nenhum']);
    tg.cast(AUG).resolve();
    const opcoes = (nome: string) => tg.actionIds().filter((a) => a.startsWith('cast:') && a.includes('augury') && a.split(':')[1] === String(tg.find(nome, 'exile')));
    // duas opções para a criatura artefato: como artefato e como criatura
    expect(opcoes('Burnished Hart')).toHaveLength(2);
    const comoArtefato = tg.pending!.kind === 'priority' ? tg.pending!.actions.find((a) => opcoes('Burnished Hart').includes(a.id) && a.label.includes('como artefato'))! : null;
    tg.answer({ kind: 'priority', action: comoArtefato!.id });
    tg.settle();
    tg.resolveAll();
    expect(tg.find('Burnished Hart')).not.toBeNull();
    expect(opcoes('Sol Ring')).toHaveLength(0);
    expect(opcoes('Wall of Omens')).toHaveLength(1);
  });
});
