import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Priest of Fell Rites', () => {
  it('não pode mirar a si mesma; devolve uma criatura', () => {
    const tg = setup({ battlefield: [['Priest of Fell Rites'], []], graveyard: [['Wall of Omens'], []], library: [['Island'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('carta de criatura alvo') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.activate('Priest of Fell Rites').resolveAll();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.life(0)).toBe(37);
  });
  it('desenterrada, é exilada se fosse sair do campo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Swamp', 'Swamp'], []], graveyard: [['Priest of Fell Rites'], []] });
    tg.activate('Priest of Fell Rites', 'Desenterrar').resolve();
    const p = tg.bf('Priest of Fell Rites');
    expect(hasKw(tg.g, p, 'haste')).toBe(true);
    tg.run(destroy(tg.g, [p]));
    expect(tg.names(0, 'exile')).toEqual(['Priest of Fell Rites']);
  });
  it('desenterrada, é exilada no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Swamp', 'Swamp'], []], graveyard: [['Priest of Fell Rites'], []], library: [['Island'], ['Island']] });
    tg.activate('Priest of Fell Rites', 'Desenterrar').resolve();
    tg.passTo('end').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Priest of Fell Rites']);
  });
});
