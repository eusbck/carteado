import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Forge Anew';
const ativaveis = (tg: ReturnType<typeof setup>, nome: string) => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(nome)}:`));

describe(N, () => {
  it('ao entrar, devolve uma carta de Equipamento do seu cemitério ao campo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[N], []], graveyard: [['Shadowspear', 'Llanowar Elves'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Equipamento alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Shadowspear']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Shadowspear')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
  });

  it('durante o seu turno, equipar como instantânea (no combate e com a pilha ocupada); no turno do oponente, não', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Swiftfoot Boots', 'Indomitable Ancients', 'Plains', 'Plains', 'Plains'], []], hand: [['Swiftfoot Boots'], []] });
    tg.passTo('beginCombat', 0);
    expect(ativaveis(tg, 'Shadowspear')).toBe(true);
    tg.activate('Shadowspear', 'Equipar');
    // com a habilidade na pilha, ainda dá para equipar outro
    expect(ativaveis(tg, 'Swiftfoot Boots')).toBe(true);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    tg.passTo('upkeep', 1);
    while (tg.pending?.player !== 0) tg.pass();
    expect(ativaveis(tg, 'Swiftfoot Boots')).toBe(false);
  });

  it('a primeira habilidade de equipar de cada um dos seus turnos custa {0}', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Swiftfoot Boots', 'Indomitable Ancients', 'Plains'], []] });
    tg.activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    tg.activate('Swiftfoot Boots', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(ativaveis(tg, 'Shadowspear')).toBe(false);
  });

  it('reconfigurar não é equipar: não fica instantâneo nem de graça; equipar com restrição fica', () => {
    const tg = setup({ battlefield: [[N, 'Lion Sash', 'Wrecking Ball Arm', 'Zetalpa, Primal Dawn', 'Plains'], []] });
    // reconfigurar {2} com uma mana só: não fica de graça (a de {W} não tem alvo no cemitério)
    expect(ativaveis(tg, 'Lion Sash')).toBe(false);
    tg.choose('criatura lendária alvo', ['Zetalpa, Primal Dawn']).activate('Wrecking Ball Arm', 'Equipar criatura lendária').resolveAll();
    expect(tg.state.objects[tg.bf('Wrecking Ball Arm')].attachedTo).toBe(tg.bf('Zetalpa, Primal Dawn'));
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    // no combate, reconfigurar não aparece mesmo com mana
    const tg2 = setup({ battlefield: [[N, 'Lion Sash', 'Zetalpa, Primal Dawn', 'Plains', 'Plains', 'Plains'], []] });
    expect(ativaveis(tg2, 'Lion Sash')).toBe(true);
    tg2.passTo('beginCombat', 0);
    expect(ativaveis(tg2, 'Lion Sash')).toBe(false);
  });
});
