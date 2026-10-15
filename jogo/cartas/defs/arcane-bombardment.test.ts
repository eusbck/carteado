import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Arcane Bombardment';
const CONJURAR = 'escolha uma mágica para conjurar';

describe(N, () => {
  it('a primeira instantânea do turno exila uma carta do cemitério e conjura a cópia; a segunda não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Opt', 'Opt'], []], graveyard: [['Serum Visions', 'Forest'], []], library: [Array(6).fill('Plains'), []] });
    tg.choose(CONJURAR, ['Serum Visions']).cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'exile')).toEqual(['Serum Visions']);
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(1);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    tg.cast('Opt');
    expect(tg.state.zones.stack).toHaveLength(1);
  });

  it('no turno seguinte, copia todas as cartas exiladas com ele', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Opt', 'Opt'], []], graveyard: [['Serum Visions'], []], library: [Array(10).fill('Plains'), Array(4).fill('Plains')] });
    tg.choose(CONJURAR, ['Não conjurar']).cast('Opt').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Serum Visions']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes(CONJURAR)) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [''] };
    });
    tg.cast('Opt').resolve();
    // a Opt do turno anterior estava no cemitério e foi exilada agora: as duas são copiadas
    expect(oferecidas.sort()).toEqual(['Não conjurar', 'Opt', 'Serum Visions'].sort());
  });
});
