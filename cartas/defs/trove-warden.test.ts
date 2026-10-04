import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Trove Warden', () => {
  it('dispara jogando terreno: exila; ao morrer, as exiladas voltam ao campo', () => {
    const tg = setup({ battlefield: [['Trove Warden', 'Swamp', 'Swamp'], []], hand: [['Plains', 'Infernal Grasp'], []], graveyard: [['Wall of Omens', 'Zetalpa, Primal Dawn'], []], library: [['Island'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 3')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.play('Plains').resolve();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    tg.choose('criatura alvo', ['Trove Warden']).cast('Infernal Grasp').resolve().resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
