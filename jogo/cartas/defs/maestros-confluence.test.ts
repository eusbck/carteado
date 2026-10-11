import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Maestros Confluence';
const terrenos = ['Island', 'Swamp', 'Mountain', 'Island', 'Swamp', 'Mountain'];
const VOLTAR = 'Devolva a carta de instantânea ou feitiço monocolorida alvo do seu cemitério para a sua mão';
const ENFRAQUECER = 'A criatura alvo recebe -3/-3 até o fim do turno';
const INCITAR = 'Incite cada criatura que o jogador alvo controla';
const modos = (tg: ReturnType<typeof setup>, ...ms: string[]) => { for (const m of ms) tg.choose('escolha o modo', [m]); };

describe(N, () => {
  it('um de cada: devolve uma instantânea monocolorida, dá -3/-3 e incita as criaturas do jogador alvo', () => {
    const tg = setup({
      players: 3, hand: [[N], [], []],
      battlefield: [terrenos, ['Elvish Mystic', 'Indomitable Ancients'], []],
      graveyard: [['Preordain', 'Maestros Charm', 'Elvish Mystic'], [], []],
    });
    let cartas: string[] = [];
    modos(tg, VOLTAR, ENFRAQUECER, INCITAR);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('monocolorida alvo')) return null;
      cartas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Preordain')!.id] };
    });
    tg.choose('criatura alvo', ['Elvish Mystic']).choose('jogador alvo', ['Bruno']);
    tg.cast(N).resolveAll();
    // só a carta de uma cor: nem o Maestros Charm (três cores) nem a criatura
    expect(cartas).toEqual(['Preordain']);
    expect(tg.names(0, 'hand')).toEqual(['Preordain']);
    expect(tg.find('Elvish Mystic', 'battlefield', 1)).toBeNull();
    // a criatura que sobrou está incitada: no turno de Bruno ela é obrigada a atacar, e não pode atacar você
    let exigida = false;
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      const id = tg.bf('Indomitable Ancients');
      exigida = !!d.candidates.find((x) => x.obj === id)?.required?.length;
      return { kind: 'attackers', attacks: [[id, { kind: 'player', id: 2 }]] };
    });
    tg.passTo('main2', 1);
    expect(exigida).toBe(true);
    expect([tg.life(0), tg.life(2)]).toEqual([40, 38]);
  });

  it('o mesmo modo três vezes: -3/-3 em três alvos, ou três vezes no mesmo', () => {
    const tg = setup({ battlefield: [terrenos, ['Indomitable Ancients', 'Elvish Mystic']], hand: [[N], []] });
    modos(tg, ENFRAQUECER, ENFRAQUECER, ENFRAQUECER);
    tg.choose('criatura alvo', ['Indomitable Ancients']).choose('criatura alvo', ['Indomitable Ancients']).choose('criatura alvo', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    // 2/10 com -9/-9: 1 de resistência
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-7, 1]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });
});
