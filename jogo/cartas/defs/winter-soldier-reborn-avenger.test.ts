import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Winter Soldier, Reborn Avenger';

describe(N, () => {
  it('atacando, devolve ao campo uma criatura do cemitério com valor de mana até a força dele; o Hero entra com um marcador +1/+1 a mais', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Patriot, Shield Wielder', 'Serra Angel', 'Silver Myr'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('força de Winter Soldier')) return null;
      // força 3: o Serra Angel (valor 5) não é alvo
      expect(d.items.map((i) => i.label).sort()).toEqual(['Patriot, Shield Wielder', 'Silver Myr']);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Patriot, Shield Wielder')!.id] };
    });
    tg.attack([[N, 1]]).passTo('declareBlockers', 0);
    expect(tg.pt(tg.bf('Patriot, Shield Wielder'))).toEqual([3, 3]);
  });
});