import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Extravagant Replication';

describe(N, () => {
  it('na sua manutenção, cria uma ficha que é cópia de outro permanente não terreno seu', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Sol Ring', 'Island'], ['Indomitable Ancients']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('outro permanente não terreno alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.passTo('main1', 0);
    // nem ela mesma, nem o terreno, nem o permanente do oponente
    expect(alvos).toEqual(['Sol Ring']);
    const aneis = tg.all('Sol Ring');
    expect(aneis).toHaveLength(2);
    expect(aneis.filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
  });

  it('não dispara na manutenção do oponente', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    tg.passTo('main1', 1);
    expect(tg.all('Sol Ring')).toHaveLength(1);
  });
});
