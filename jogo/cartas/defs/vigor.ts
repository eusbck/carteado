// Vigor
// Trample
// If damage would be dealt to another creature you control, prevent that damage. Put a +1/+1 counter on that creature
// for each 1 damage prevented this way.
// When Vigor is put into a graveyard from anywhere, shuffle it into its owner's library.
import { addCounters, controllerOf, defineCard, isCreature, keyword, moveObjects, on, shuffleLibrary, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vigor',
  faces: [{
    abilities: [
      keyword('trample'),
      staticAbility({
        rules: {
          // CR 615.5: o dano é prevenido inteiro e vira marcadores +1/+1 na criatura
          preventsSomeDamage: (c, alvo, _fonte, quantidade) => {
            if (alvo.kind !== 'obj' || alvo.id === c.source || !c.g.state.objects[alvo.id] || !isCreature(c.g, alvo.id) || controllerOf(c.g, alvo.id) !== c.you) return 0;
            addCounters(c.g, { kind: 'obj', id: alvo.id }, '+1/+1', quantidade, c.you);
            return quantidade;
          },
        },
        text: 'Se dano fosse ser causado a outra criatura que você controla, previna esse dano. Coloque um marcador +1/+1 nessa criatura para cada 1 de dano prevenido assim.',
      }),
      // rulings 2 e 4: de qualquer zona, e dispara do cemitério; ruling 1: se já saiu do cemitério, fica onde está
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'graveyard' && e.obj === c.source), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'graveyard') return;
        const dono = o.owner;
        yield* moveObjects(c.g, [{ id: c.source, to: 'library' }], 'shuffle');
        shuffleLibrary(c.g, dono);
      }, { zones: ['graveyard'], text: 'Quando Vigor é colocado num cemitério vindo de qualquer lugar, embaralhe-o no grimório do dono.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — se a carta já saiu do cemitério, o gatilho não a acha e ela fica onde está (cartas/defs/vigor.ts)',
    2: 'teste: indo para o cemitério, é embaralhado no grimório do dono',
    3: 'regra geral: CR 603.10 — o gatilho é do cemitério: vale a carta como está lá (cartas/defs/vigor.ts, zones: graveyard)',
    4: 'regra geral: CR 603.6 — não é habilidade de sair do campo: dispara da zona para onde a carta foi (cartas/defs/vigor.ts)',
  },
});