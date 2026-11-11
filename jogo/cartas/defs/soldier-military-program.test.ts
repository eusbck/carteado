import { describe, expect, it } from 'vitest';
import { createTokens, gainControl } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'SOLDIER Military Program';
const FICHA = 'Crie uma ficha de criatura Soldier 1/1 branca';
const MARCADOR = 'Coloque um marcador +1/+1 em cada um de até dois Soldiers que você controla';

type TG = ReturnType<typeof setup>;
const soldados = (tg: TG) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Soldier');
const marcadores = (tg: TG) => soldados(tg).map((id) => tg.state.objects[id].counters['+1/+1'] ?? 0).sort();

/** guarda o máximo de modos oferecido na pergunta do gatilho */
function espiaMaximo(tg: TG): { max?: number } {
  const visto: { max?: number } = {};
  tg.script.push((d) => {
    if (!d.prompt.includes('modo')) return null;
    visto.max = (d as { max?: number }).max;
    return null;
  });
  return visto;
}

describe(N, () => {
  it('sem comandante, escolhe só um modo: cria a ficha de Soldier', () => {
    const tg = setup({ battlefield: [[N], []] });
    const visto = espiaMaximo(tg);
    tg.choose('modo', [FICHA]).passTo('main2', 0);
    expect(visto.max).toBe(1);
    expect(soldados(tg)).toHaveLength(1);
    expect(marcadores(tg)).toEqual([0]);
  });

  it('sem comandante, o segundo modo põe marcador em até dois Soldiers escolhidos na resolução', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 3));
    tg.choose('modo', [MARCADOR]);
    tg.script.push((d) => (d.prompt.includes('até dois Soldiers') && 'items' in d ? { kind: 'select', ids: (d as { items: { id: string }[] }).items.slice(0, 2).map((i) => i.id) } : null));
    tg.passTo('main2', 0);
    expect(soldados(tg)).toHaveLength(3);
    expect(marcadores(tg)).toEqual([0, 1, 1]);
  });

  it('controlando um comandante, escolhe os dois modos: cria a ficha e depois põe marcadores (no máximo dois modos, mesmo com dois comandantes)', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', commander: true }, { name: 'Elvish Mystic', commander: true }], []] });
    const visto = espiaMaximo(tg);
    tg.choose('modo', [FICHA, MARCADOR]).passTo('main2', 0);
    expect(visto.max).toBe(2);
    // a ficha criada pelo primeiro modo já está lá quando o segundo resolve
    expect(soldados(tg)).toHaveLength(1);
    expect(marcadores(tg)).toEqual([1]);
  });

  it('o comandante de outro jogador sob o seu controle também libera os dois modos', () => {
    const tg = setup({ battlefield: [[N], [{ name: 'Silver Myr', commander: true }]] });
    gainControl(tg.g, tg.bf('Silver Myr'), 0, { kind: 'permanent' }, tg.bf(N));
    tg.refresh();
    const visto = espiaMaximo(tg);
    tg.choose('modo', [FICHA, MARCADOR]).passTo('main2', 0);
    expect(visto.max).toBe(2);
    expect(marcadores(tg)).toEqual([1]);
  });

  it('não dispara no combate do oponente', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.choose('modo', [FICHA]).passTo('main2', 0);
    expect(soldados(tg)).toHaveLength(1);
    tg.passTo('main2', 1);
    expect(soldados(tg)).toHaveLength(1);
  });
});
