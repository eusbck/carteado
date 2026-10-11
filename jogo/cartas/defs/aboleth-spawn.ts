// Aboleth Spawn
// Flash
// Ward {2}
// Probing Telepathy — Whenever a creature entering under an opponent's control causes a triggered ability of that
// creature to trigger, you may copy that ability. You may choose new targets for the copy.
import { copyStackAbility, defineCard, isCreature, keyword, lkiChars, on, triggered, ward, yesNo } from '../../motor/api.ts';
import { triggerLabel } from '../../motor/stack.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Aboleth Spawn',
  faces: [{
    abilities: [
      keyword('flash'),
      ...ward('{2}'),
      // ruling 3: dispara quando a habilidade da criatura vai para a pilha; por isso fica sempre acima dela e a cópia
      // resolve antes. Ruling 4: só as habilidades da própria criatura que entrou, disparadas pela entrada dela
      triggered(on.custom((e, c) => {
        if (e.type !== 'triggerOnStack' || !c.g.isOpponent(c.you, e.controller)) return false;
        const ev = c.g.state.objects[e.obj]?.stack?.event as { type?: string; to?: string; obj?: ObjId } | undefined;
        if (!ev || ev.type !== 'zone' || ev.to !== 'battlefield' || ev.obj !== e.source) return false;
        const criatura = c.g.state.objects[e.source] ? isCreature(c.g, e.source) : !!lkiChars(c.g, e.source)?.types.includes('Creature');
        return criatura ? { habilidade: e.obj } : false;
      }), function* (c) {
        const hab = c.event.habilidade as ObjId;
        const st = c.g.state.objects[hab]?.stack;
        // a habilidade já saiu da pilha (anulada, por exemplo): não há o que copiar
        if (!st || c.g.state.objects[hab].zone !== 'stack') return;
        if (!(yield* yesNo(c.g, c.you, `Aboleth Spawn: copiar a habilidade de ${triggerLabel(c.g, st.abilityId!, st.source!)}? (você pode escolher novos alvos)`))) return;
        // rulings 5-6: os mesmos modos e alvos, a menos que você escolha alvos novos
        yield* copyStackAbility(c.g, hab, c.you, { newTargets: true });
      }, { text: 'Telepatia Sondadora — Sempre que uma criatura que entra sob o controle de um oponente faz uma habilidade desencadeada dela disparar, você pode copiar essa habilidade. Você pode escolher novos alvos para a cópia.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.1 — habilidade desencadeada é a que começa com "quando", "sempre que" ou "no"; o motor só põe essas na pilha como gatilho',
    2: 'regra geral: CR 614.1c — "entra com", "ao entrar" e "entra como" são efeitos de substituição, não gatilhos: não vão para a pilha (motor/dsl.ts)',
    3: 'teste: copia a habilidade de entrar da criatura do oponente, e a cópia resolve primeiro',
    4: 'teste: habilidade de outra permanente que dispara com a entrada da criatura não é copiada',
    5: 'regra geral: CR 707.10c — a cópia tem os mesmos alvos, a menos que você escolha novos (motor/stack.ts copyStackAbility)',
    6: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copyStackAbility)',
  },
});
