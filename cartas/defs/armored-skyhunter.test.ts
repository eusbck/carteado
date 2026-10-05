import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Armored Skyhunter', () => {
  it('ao atacar, põe um Equipamento do topo no campo e pode anexá-lo; o resto vai para o fundo', () => {
    const tg = setup({ battlefield: [['Armored Skyhunter'], []], library: [['Island', 'Swiftfoot Boots', 'Plains', 'Swamp', 'Forest', 'Mountain', 'Wall of Omens'], []] });
    tg.choose('Aura ou um Equipamento', ['Swiftfoot Boots']).choose('Anexar', ['Armored Skyhunter']);
    tg.attack([['Armored Skyhunter', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Swiftfoot Boots')].attachedTo).toBe(tg.bf('Armored Skyhunter'));
    expect(tg.names(0, 'library')[0]).toBe('Wall of Omens');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Forest', 'Island', 'Mountain', 'Plains', 'Swamp']);
  });
  it('Aura é escolhível quando há o que encantar e entra encantando', () => {
    const tg = setup({ battlefield: [[{ name: 'Armored Skyhunter' }], []], library: [['Angelic Gift', 'Island'], []] });
    let desabilitada: boolean | undefined;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Aura ou um Equipamento')) return null;
      const it = d.items.find((i) => i.label === 'Angelic Gift')!;
      desabilitada = it.disabled;
      return { kind: 'select', ids: [it.id] };
    });
    tg.attack([['Armored Skyhunter', 1]]).passTo('declareBlockers');
    expect(desabilitada).toBe(false);
    expect(tg.state.objects[tg.bf('Angelic Gift')].attachedTo).toBe(tg.bf('Armored Skyhunter'));
  });
});
