import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sword of Hearth and Home';

describe(N, () => {
  it('exila uma criatura sua, busca um terreno básico e as duas cartas entram juntas no campo', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', { name: 'Flayed One', tapped: true }], []], library: [['Island', 'Swamp', 'Sol Ring', 'Island'], ['Island']] });
    attach(tg.g, tg.bf(N), tg.bf('Serra Angel'));
    tg.refresh();
    const antigo = tg.bf('Flayed One');
    tg.script.push((d) => { const i = d.kind === 'select' && d.prompt.includes('de que você é dono') ? d.items.find((x) => x.label === 'Flayed One') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.script.push((d) => { const i = d.kind === 'select' && d.prompt.includes('terreno básico') ? d.items.find((x) => x.label === 'Swamp') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.attack([['Serra Angel', 1]]).passTo('main2', 0).resolveAll();
    // voltou como objeto novo, desvirado, e o gatilho de entrar dele triturou três cartas
    expect(tg.bf('Flayed One')).not.toBe(antigo);
    expect(tg.state.objects[tg.bf('Flayed One')].tapped).toBe(false);
    expect(tg.find('Swamp')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toHaveLength(3);
  });
});