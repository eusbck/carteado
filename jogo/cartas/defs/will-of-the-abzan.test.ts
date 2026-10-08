import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Will of the Abzan', () => {
  it('sem comandante, um modo só', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Glissa Sunslayer', 'Elvish Mystic']], hand: [['Will of the Abzan'], []], graveyard: [['Wall of Omens'], []], library: [['Island'], []] });
    let max = 0;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? (max = d.max, { kind: 'select', ids: ['0'] }) : null));
    tg.choose('oponentes alvo', ['Bruno']);
    tg.cast('Will of the Abzan').resolve();
    expect(max).toBe(1);
    expect(tg.find('Glissa Sunslayer')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.life(1)).toBe(37);
  });
  it('o comandante de outro jogador também conta: os dois modos', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', { name: 'Gau, Feral Youth', commander: true }], ['Glissa Sunslayer']], hand: [['Will of the Abzan'], []],
      graveyard: [['Wall of Omens'], []], library: [['Island'], []],
    });
    tg.choose('modo', ['Qualquer número de oponentes alvo sacrifica cada um uma criatura de maior força e perde 3 de vida', 'Devolva a carta de criatura alvo do seu cemitério ao campo']);
    tg.choose('oponentes alvo', ['Bruno']).choose('carta de criatura alvo', ['Wall of Omens']);
    tg.cast('Will of the Abzan').resolveAll();
    expect(tg.find('Glissa Sunslayer')).toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
