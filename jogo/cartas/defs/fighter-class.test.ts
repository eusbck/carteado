import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fighter Class';
const nivel = (tg: ReturnType<typeof setup>, n: number) => { tg.state.objects[tg.bf(N)].classLevel = n; tg.refresh(); };
const bloqueios = (tg: ReturnType<typeof setup>) => tg.state.combat!.blockers.map((b) => [tg.state.objects[b.id].def, b.blocking.map((a) => tg.state.objects[a].def)]);

describe(N, () => {
  it('ao entrar procura um Equipamento; no nível 2 equipar custa {2} a menos', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Plains', 'Mountain', 'Plains', 'Mountain', 'Indomitable Ancients'], []], hand: [[N], []],
      library: [['Forest', 'Shadowspear', 'Forest'], Array(40).fill('Forest')],
    });
    tg.choose('Equipamento', ['Shadowspear']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Shadowspear']);
    expect(tg.state.objects[tg.bf(N)].classLevel).toBe(1);
    // nível 2 com as três terras que sobraram
    tg.activate(N, 'Nível 2').resolveAll();
    expect(tg.state.objects[tg.bf(N)].classLevel).toBe(2);
  });

  it('no nível 2, equipar {2} sai de graça e equipar {7} custa {5}', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Wrecking Ball Arm', 'Indomitable Ancients', ...Array(5).fill('Plains')], []] });
    nivel(tg, 2);
    tg.activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(0);
    tg.activate('Wrecking Ball Arm', 'Equipar {7}').resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(5);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([8, 8]);
  });

  it('duas Fighter Class no nível 2 baixam {4}, sem passar de {0}', () => {
    const tg = setup({ battlefield: [[N, N, 'Wrecking Ball Arm', 'Indomitable Ancients', ...Array(3).fill('Plains')], []] });
    for (const id of tg.all(N)) tg.state.objects[id].classLevel = 2;
    tg.refresh();
    tg.activate('Wrecking Ball Arm', 'Equipar {7}').resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(3);
  });

  it('no nível 1 só dá para ganhar o nível 2, e só como feitiço', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Mountain'), ...Array(4).fill('Plains')], []] });
    const ids = () => tg.actionIds().filter((a) => a.startsWith(`act:${tg.bf(N)}:`));
    expect(ids().length).toBe(1);
    tg.passTo('beginCombat', 0);
    expect(ids().length).toBe(0);
    tg.passTo('main2', 0);
    tg.activate(N, 'Nível 2').resolveAll();
    tg.activate(N, 'Nível 3').resolveAll();
    expect(tg.state.objects[tg.bf(N)].classLevel).toBe(3);
  });

  it('no nível 3, a criatura alvo precisa bloquear a atacante; o desconto do nível 2 continua', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Shadowspear'], ['Wall of Omens', 'Serra Angel']] });
    nivel(tg, 3);
    // desconto do nível 2: equipar {2} de graça
    tg.activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    tg.choose('até uma criatura alvo', ['Serra Angel']).attack([['Indomitable Ancients', 1]]);
    // sem bloqueio, a declaração é recusada
    expect(() => tg.block([]).passTo('declareBlockers')).toThrow(/Serra Angel precisa bloquear Indomitable Ancients/);
  });

  it('a resposta padrão (bots) cumpre a exigência', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], ['Wall of Omens', 'Serra Angel']] });
    nivel(tg, 3);
    tg.choose('até uma criatura alvo', ['Serra Angel']).attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    expect(bloqueios(tg)).toEqual([['Serra Angel', ['Indomitable Ancients']]]);
  });

  it('bloquear com outra criatura além da exigida é permitido', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], ['Wall of Omens', 'Serra Angel']] });
    nivel(tg, 3);
    tg.choose('até uma criatura alvo', ['Serra Angel']).attack([['Indomitable Ancients', 1]])
      .block([['Serra Angel', 'Indomitable Ancients'], ['Wall of Omens', 'Indomitable Ancients']]).passTo('declareBlockers');
    expect(bloqueios(tg).length).toBe(2);
  });

  it('virada, ou com custo para bloquear, a criatura alvo não precisa bloquear', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], [{ name: 'Serra Angel', tapped: true }]] });
    nivel(tg, 3);
    tg.choose('até uma criatura alvo', ['Serra Angel']).attack([['Indomitable Ancients', 1]]).block([]).passTo('declareBlockers');
    expect(bloqueios(tg)).toEqual([]);
    // Archangel of Tithes atacando: bloquear custa {1}
    const tg2 = setup({ battlefield: [[N, 'Archangel of Tithes'], ['Serra Angel', 'Plains']] });
    nivel(tg2, 3);
    tg2.choose('até uma criatura alvo', ['Serra Angel']).attack([['Archangel of Tithes', 1]]).block([]).passTo('declareBlockers');
    expect(bloqueios(tg2)).toEqual([]);
  });

  it('duas exigências para a mesma criatura: ela bloqueia uma das atacantes, à escolha do controlador', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Zetalpa, Primal Dawn'], ['Serra Angel']] });
    nivel(tg, 3);
    tg.choose('até uma criatura alvo', ['Serra Angel']).choose('até uma criatura alvo', ['Serra Angel'])
      .attack([['Indomitable Ancients', 1], ['Zetalpa, Primal Dawn', 1]])
      .block([['Serra Angel', 'Zetalpa, Primal Dawn']]).passTo('declareBlockers');
    expect(bloqueios(tg)).toEqual([['Serra Angel', ['Zetalpa, Primal Dawn']]]);
  });

  it('a exigência acaba com o combate', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], ['Serra Angel']] });
    nivel(tg, 3);
    tg.choose('até uma criatura alvo', ['Serra Angel']).attack([['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(tg.state.effects.some((e) => e.mods.some((m) => m.k === 'rule' && m.id === 'rule:blocksIfAble'))).toBe(false);
  });
});
