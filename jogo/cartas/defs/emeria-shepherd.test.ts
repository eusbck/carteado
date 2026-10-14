import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Emeria Shepherd';

describe(N, () => {
  it('jogando uma Plains, pode devolver a carta ao campo; só cartas de permanente não terreno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Plains'], []], graveyard: [['Segovian Angel', 'Day of Judgment', 'Forest'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.choose('Emeria Shepherd: o que fazer', ['Devolver Segovian Angel ao campo']);
    tg.play('Plains');
    tg.resolveAll();
    expect(opcoes).toEqual(['Segovian Angel']);
    expect(tg.find('Segovian Angel')).not.toBeNull();
  });

  it('jogar um terreno ou pô-lo no campo por efeito faz disparar; sem ser Plains, só para a mão', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Rampant Growth'], []], library: [['Island', ...Array(5).fill('Swamp')], []], graveyard: [['Segovian Angel'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Emeria Shepherd: o que fazer')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.choose('Procure uma carta de terreno básico', ['Island']);
    tg.cast('Rampant Growth').resolveAll();
    expect(opcoes).toEqual(['Devolver Segovian Angel para a mão', 'Não devolver']);
    expect(tg.names(0, 'hand')).toEqual(['Segovian Angel']);
  });
});
