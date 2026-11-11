import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const MOX = 'Mox Diamond';

describe(MOX, () => {
  it('descartando uma carta de terreno, entra no campo', () => {
    const tg = setup({ battlefield: [[], []], hand: [[MOX, 'Forest', 'Sol Ring'], []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Descarte')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(MOX).resolve();
    expect(oferecidas).toEqual(['Forest']);
    expect(tg.find(MOX, 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });

  it('sem descartar um terreno, vai para o cemitério sem entrar e não dispara nada', () => {
    // Wall of Omens não interessa; o que importa: nenhum gatilho de "artefato entra" (Up the Beanstalk não, é outro)
    const tg = setup({ battlefield: [[], []], hand: [[MOX, 'Forest'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Descarte') ? { kind: 'select', ids: [] } : null));
    tg.cast(MOX).resolve();
    expect(tg.find(MOX, 'battlefield', 0)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([MOX]);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.state.zones.stack.length).toBe(0);
  });

  it('sem terreno na mão, vai para o cemitério', () => {
    const tg = setup({ battlefield: [[], []], hand: [[MOX], []] });
    tg.cast(MOX).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([MOX]);
  });
});
