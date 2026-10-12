import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { isLand, nameOf } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dowsing Dagger // Lost Vale';

describe(N, () => {
  it('ao entrar, o oponente alvo cria duas Plants 0/2 com defensor', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('oponente alvo') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.all('Plant')).toHaveLength(2);
    expect(tg.state.objects[tg.all('Plant')[0]].controller).toBe(1);
    expect(tg.pt(tg.all('Plant')[0])).toEqual([0, 2]);
  });

  it('no dano de combate a um jogador pode transformar em Lost Vale, que entra desvirado e gera três manas de uma cor', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel'], []] });
    const adaga = tg.bf(N);
    attach(tg.g, adaga, tg.bf('Serra Angel'));
    tg.refresh();
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([6, 5]);
    tg.yes('Dowsing Dagger', true).attack([['Serra Angel', 1]]).passTo('main2', 0);
    expect(nameOf(tg.g, adaga)).toBe('Lost Vale');
    expect(isLand(tg.g, adaga)).toBe(true);
    expect(tg.state.objects[adaga].tapped).toBe(false);
    expect(tg.state.objects[adaga].attachedTo).toBeNull();
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === adaga)).toHaveLength(5);
    expect(tg.pt(tg.bf('Serra Angel'))).toEqual([4, 4]);
  });
});