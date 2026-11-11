// Substituições de entrar novas (motor/actions.ts putOntoBattlefield):
// - enterReplacement (motor/defs.ts): substituição de OUTRO permanente sobre como algo entra que pede escolha (motim
//   concedido por Rhythm of the Wild; CR 614.1c, 614.12, 702.136a);
// - EnterEvent.instead: "em vez de entrar, vai para [zona]" (Mox Diamond; CR 614.1c): o objeto nunca entra e não dispara
//   gatilhos de entrar.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { hasKw, putOntoBattlefield } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';

describe('Substituições de entrar (CR 614.1c, 614.12)', () => {
  it('enterReplacement: a escolha é feita conforme o permanente entra, sem pilha; com ímpeto, fica com ele', () => {
    const tg = setup({ battlefield: [['Rhythm of the Wild'], []], hand: [['Elvish Mystic', 'Llanowar Elves'], []] });
    tg.choose('Motim (Elvish Mystic)', ['Entrar com um marcador +1/+1']).choose('Motim (Llanowar Elves)', ['Ganhar ímpeto']);
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: tg.find('Elvish Mystic', 'hand')!, controller: 0 }, { id: tg.find('Llanowar Elves', 'hand')!, controller: 0 }], 'effect'));
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(1);
    expect(hasKw(tg.g, tg.bf('Llanowar Elves'), 'haste')).toBe(true);
    expect(tg.state.zones.stack.length).toBe(0);
  });

  it('enterReplacement não vale para quem já está no campo nem para criaturas do oponente', () => {
    const tg = setup({ battlefield: [['Rhythm of the Wild', 'Elvish Mystic'], []], hand: [[], ['Llanowar Elves']] });
    let perguntou = false;
    tg.script.push((d) => { if (d.prompt.startsWith('Motim')) perguntou = true; return null; });
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: tg.find('Llanowar Elves', 'hand', 1)!, controller: 1 }], 'effect'));
    expect(perguntou).toBe(false);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('EnterEvent.instead: o objeto vai para a outra zona sem entrar e sem disparar "quando entra"', () => {
    // sem terreno para descartar, Mox Diamond vai para o cemitério e não conta como tendo entrado
    const tg = setup({ battlefield: [[], []], hand: [['Mox Diamond'], []] });
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: tg.find('Mox Diamond', 'hand')!, controller: 0 }], 'effect'));
    expect(tg.find('Mox Diamond', 'graveyard', 0)).not.toBeNull();
    expect(tg.state.zones.battlefield).toEqual([]);
    expect(tg.state.enteredThisTurn?.objs ?? []).toEqual([]);
  });
});
