import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Loyal Retainers';
const pode = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith('act:'));

describe(N, () => {
  it('sacrificada, devolve ao campo uma carta de criatura lendária do seu cemitério', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Zetalpa, Primal Dawn', 'Serra Angel'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Zetalpa, Primal Dawn']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find(N)).toBeNull();
  });

  it('só no seu turno e antes de os atacantes serem declarados', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []], graveyard: [['Zetalpa, Primal Dawn'], []] });
    expect(pode(tg)).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(pode(tg)).toBe(false);
    const outro = setup({ active: 1, battlefield: [[N], []], graveyard: [['Zetalpa, Primal Dawn'], []] });
    outro.pass();
    expect(outro.pending?.player).toBe(0);
    expect(pode(outro)).toBe(false);
  });
});