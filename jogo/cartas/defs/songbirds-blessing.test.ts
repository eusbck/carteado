import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Songbirds' Blessing", () => {
  it('a Aura entra sem mirar e escolhe o que encantar; as reveladas vão para o fundo', () => {
    const tg = setup({
      battlefield: [['Wall of Omens', { name: 'Elvish Mystic', ready: true }, { name: "Songbirds' Blessing", attachTo: 'Elvish Mystic' }], ['Island']],
      library: [['Plains', 'Island', 'Spirit Mantle', 'Swamp'], ['Island']],
    });
    tg.yes('pôr Spirit Mantle no campo').choose('vai encantar', ['Wall of Omens']);
    tg.refresh().attack([['Elvish Mystic', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.state.objects[tg.bf('Spirit Mantle')].attachedTo).toBe(tg.bf('Wall of Omens'));
    expect(tg.names(0, 'library')[0]).toBe('Swamp');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Island', 'Plains']);
  });
  it('se não puser no campo, vai para a mão', () => {
    const tg = setup({
      battlefield: [[{ name: 'Elvish Mystic', ready: true }, { name: "Songbirds' Blessing", attachTo: 'Elvish Mystic' }], []],
      library: [['Spirit Mantle', 'Swamp'], ['Island']],
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Songbirds') ? { kind: 'select', ids: ['no'] } : null));
    tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Spirit Mantle']);
  });
});
