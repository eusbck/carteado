import { describe, expect, it } from 'vitest';
import { controllerOf, gainControl, untilEndOfTurn } from '../../motor/api.ts';
import { enterCard, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Yuffie, Materia Hunter';

describe(N, () => {
  it('pelo ninjutsu, entra atacando o mesmo jogador que o atacante devolvido e rouba o artefato alvo', () => {
    const tg = setup({ players: 3, battlefield: [['Silver Myr', 'Mountain', 'Mountain'], [], ['Sol Ring']], hand: [[N], []] });
    tg.attack([['Silver Myr', 2]]).passTo('declareBlockers');
    tg.choose('artefato alvo', ['Sol Ring']).activate(N, 'Ninjutsu').resolveAll();
    const id = tg.bf(N);
    const atk = tg.state.combat!.attackers.find((a) => a.id === id && !a.removed)!;
    expect(atk.target).toEqual({ kind: 'player', id: 2 });
    expect(tg.find('Silver Myr', 'hand', 0)).not.toBeNull();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });

  it('rouba um Equipamento do oponente e o anexa a Yuffie; um Equipamento que não pode ser anexado fica onde está', () => {
    const tg = setup({ battlefield: [[], ['Shadowspear']] });
    tg.choose('artefato alvo', ['Shadowspear']).choose('anexar a ela', ['Shadowspear']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Shadowspear'))).toBe(0);
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf(N));
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);

    const tg2 = setup({ battlefield: [['Basilisk Collar'], ['Sol Ring']] });
    tg2.choose('artefato alvo', ['Sol Ring']).choose('anexar a ela', ['Basilisk Collar']);
    const y = enterCard(tg2, N, 0)!;
    untilEndOfTurn({ g: tg2.g, you: 0, source: y } as never, [y], [{ k: 'addKeyword', kw: 'protection', param: 'type:Artifact' }]);
    tg2.refresh().resolveAll();
    expect(tg2.state.objects[tg2.bf('Basilisk Collar')].attachedTo).toBeNull();
  });

  it('o controle acaba quando Yuffie sai do campo', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']] });
    tg.choose('artefato alvo', ['Sol Ring']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
    removeCard(tg, tg.bf(N));
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });

  it('o controle acaba quando você deixa de controlar Yuffie e não volta', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring', 'Mind Stone']] });
    tg.choose('artefato alvo', ['Sol Ring']);
    const y = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
    gainControl(tg.g, y, 1, { kind: 'endOfTurn' }, tg.bf('Mind Stone'));
    tg.refresh().settle();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
    // Yuffie volta no fim do turno; o artefato continua com o dono
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, y)).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });

  it('com o alvo ilegal na resolução, não ganha o controle nem anexa nada', () => {
    const tg = setup({ battlefield: [['Basilisk Collar'], ['Sol Ring']] });
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('anexar a ela')) perguntou = true; return null; });
    tg.choose('artefato alvo', ['Sol Ring']);
    enterCard(tg, N, 0);
    removeCard(tg, tg.bf('Sol Ring'));
    tg.resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBeNull();
  });

  it('se Yuffie sai do campo antes de o gatilho resolver, não ganha o controle', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']] });
    tg.choose('artefato alvo', ['Sol Ring']);
    const y = enterCard(tg, N, 0)!;
    removeCard(tg, y);
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });

  it('não mira artefatos que são criaturas', () => {
    const tg = setup({ battlefield: [[], ['Silver Myr', 'Sol Ring']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato alvo')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(opcoes).not.toContain('Silver Myr');
  });
});
