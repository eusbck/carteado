import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const ONDU = 'Ondu Spiritdancer';
const planicies = Array(8).fill('Plains');

describe(ONDU, () => {
  it('cria a cópia uma vez por turno; o encantamento seguinte do turno não dispara', () => {
    const tg = setup({ battlefield: [[ONDU, ...planicies], []], hand: [['Ghostly Prison', 'Sphere of Safety'], []] });
    tg.yes('Ondu Spiritdancer: criar', true);
    tg.cast('Ghostly Prison').resolve();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    const prisoes = tg.all('Ghostly Prison');
    expect(prisoes).toHaveLength(2);
    expect(prisoes.filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
    expect(tg.state.zones.stack).toHaveLength(0);
    tg.cast('Sphere of Safety').resolve();
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.all('Sphere of Safety')).toHaveLength(1);
  });

  it('com dois gatilhos na pilha, só um cria a cópia', () => {
    const tg = setup({ battlefield: [[ONDU], []], graveyard: [['Ghostly Prison', 'Sphere of Safety'], []] });
    const ids = [tg.find('Ghostly Prison', 'graveyard', 0)!, tg.find('Sphere of Safety', 'graveyard', 0)!];
    runEffect(tg, putOntoBattlefield(tg.g, ids.map((id) => ({ id, controller: 0 })), 'effect'));
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
  });
});
