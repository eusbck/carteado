import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Psychic Battle';
const ilhas = Array(6).fill('Island');
// Zetalpa tem valor de mana 8; Island, 0
const caro = ['Zetalpa, Primal Dawn', ...ilhas];
const mesa = (minha: string[], dele: string[]) => setup({
  battlefield: [[N, 'Swamp', 'Swamp', 'Elvish Mystic'], ['Indomitable Ancients', 'Silver Myr']],
  hand: [['Infernal Grasp'], []],
  library: [minha, dele],
});

describe(N, () => {
  it('revelando o maior valor de mana, você pode mudar o alvo da sua mágica', () => {
    const tg = mesa(caro, ilhas);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.yes('Psychic Battle', true);
    tg.choose('Mudar os alvos', ['Silver Myr']);
    tg.cast('Infernal Grasp').resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    // as cartas reveladas continuam no topo
    expect(tg.names(0, 'library')[0]).toBe('Zetalpa, Primal Dawn');
  });

  it('quem revela o maior valor de mana pode mudar o alvo, mesmo de uma mágica de outro jogador', () => {
    const tg = mesa(ilhas, caro);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mudar o alvo ou os alvos')) return null;
      expect(d.player).toBe(1);
      return { kind: 'select', ids: ['yes'] };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mudar os alvos')) return null;
      expect(d.player).toBe(1);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] };
    });
    tg.cast('Infernal Grasp').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    // a mágica continua sendo sua: quem perde 2 de vida é você
    expect(tg.life(0)).toBe(38);
  });

  it('com empate no maior valor de mana, ou recusando, o alvo não muda', () => {
    const empate = mesa(ilhas, ilhas);
    empate.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Mudar o alvo ou os alvos')) throw new Error('não devia perguntar'); return null; });
    empate.choose('criatura alvo', ['Indomitable Ancients']);
    empate.cast('Infernal Grasp').resolveAll();
    expect(empate.find('Indomitable Ancients')).toBeNull();
    const recusa = mesa(caro, ilhas);
    recusa.choose('criatura alvo', ['Indomitable Ancients']);
    recusa.yes('Psychic Battle', false);
    recusa.cast('Infernal Grasp').resolveAll();
    expect(recusa.find('Indomitable Ancients')).toBeNull();
  });

  it('quem está com o grimório vazio não revela nada e não entra na comparação', () => {
    // só o oponente revela (uma Island, valor 0): é dele o maior valor
    const tg = mesa([], ilhas);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    let perguntou: number | null = null;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Mudar o alvo ou os alvos')) return null;
      perguntou = d.player;
      return { kind: 'select', ids: ['no'] };
    });
    tg.cast('Infernal Grasp').resolveAll();
    expect(perguntou).toBe(1);
  });

  it('mudar os alvos por Psychic Battle não dispara Psychic Battle de novo', () => {
    const tg = mesa(caro, ilhas);
    let perguntas = 0;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Mudar o alvo ou os alvos')) perguntas++; return null; });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.yes('Psychic Battle', true);
    tg.choose('Mudar os alvos', ['Silver Myr']);
    tg.cast('Infernal Grasp').resolveAll();
    expect(perguntas).toBe(1);
  });
});
