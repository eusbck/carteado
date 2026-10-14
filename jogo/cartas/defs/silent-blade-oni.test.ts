import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Silent-Blade Oni';

describe(N, () => {
  it('a mágica de permanente entra sob o seu controle; a instantânea vai para o cemitério do dono', () => {
    const tg = setup({ battlefield: [[N], []], hand: [[], ['Baleful Strix', 'Forest', 'Siphon Insight']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Silent-Blade Oni')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Baleful Strix')!.id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    // o terreno não é oferecido
    expect(opcoes).toEqual(['Não conjurar', 'Baleful Strix', 'Siphon Insight']);
    expect(tg.state.objects[tg.bf('Baleful Strix')].controller).toBe(0);
    expect(tg.state.objects[tg.bf('Baleful Strix')].owner).toBe(1);
    expect(tg.life(1)).toBe(34);
  });

  it('a instantânea conjurada assim vai para o cemitério do dono', () => {
    const tg = setup({ battlefield: [[N], []], hand: [[], ['Siphon Insight']] });
    tg.choose('Silent-Blade Oni', ['Siphon Insight']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'graveyard')).toEqual(['Siphon Insight']);
    // Siphon Insight, conjurada por Ana, mira Bruno: uma carta do grimório dele foi exilada
    expect(tg.state.zones.exile).toHaveLength(1);
  });
});
