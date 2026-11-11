import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Gilgamesh, Master-at-Arms';
const topo = ['Shadowspear', 'Island', 'Basilisk Collar', 'Plains', 'Swamp', 'Forest', 'Wall of Omens'];

describe(N, () => {
  it('ao entrar, põe quantos Equipamentos quiser do topo no campo e pode anexar um a um Samurai; o resto vai para o fundo', () => {
    const tg = setup({ battlefield: [[], []], library: [topo, []] });
    tg.choose('quantas cartas de Equipamento', ['Shadowspear', 'Basilisk Collar'])
      .choose('anexar um dos Equipamentos', ['Basilisk Collar'])
      .choose('escolha o Samurai', [N]);
    enterCard(tg, N, 0);
    tg.resolveAll();
    const g = tg.bf(N);
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(g);
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
    expect(tg.names(0, 'library')[0]).toBe('Wall of Omens');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Forest', 'Island', 'Plains', 'Swamp']);
  });

  it('também dispara ao atacar; anexar é opcional', () => {
    const tg = setup({ battlefield: [[N], []], library: [topo, []] });
    tg.choose('quantas cartas de Equipamento', ['Shadowspear']).choose('anexar um dos Equipamentos', []);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
    expect(tg.names(0, 'library').length).toBe(6);
  });

  it('sem Equipamento colocado, o gatilho reflexivo não acontece', () => {
    const tg = setup({ battlefield: [[N], []], library: [topo, []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('anexar')) perguntou = true; return null; });
    tg.choose('quantas cartas de Equipamento', []);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(perguntou).toBe(false);
    expect(tg.find('Shadowspear', 'battlefield')).toBeNull();
    expect(tg.names(0, 'library').length).toBe(7);
    expect(tg.names(0, 'library')[0]).toBe('Wall of Omens');
  });

  it('um Equipamento que não pode ser anexado ao Samurai continua desanexado', () => {
    const tg = setup({ battlefield: [[], []], library: [topo, []] });
    tg.choose('quantas cartas de Equipamento', ['Shadowspear'])
      .choose('anexar um dos Equipamentos', ['Shadowspear'])
      .choose('escolha o Samurai', [N]);
    const g = enterCard(tg, N, 0)!;
    // proteção contra artefatos: não pode ser equipado (CR 702.16d)
    untilEndOfTurn({ g: tg.g, you: 0, source: g } as never, [g], [{ k: 'addKeyword', kw: 'protection', param: 'type:Artifact' }]);
    tg.refresh().resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
  });
});
