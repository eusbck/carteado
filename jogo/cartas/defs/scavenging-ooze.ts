// Scavenging Ooze
// {G}: Exile target card from a graveyard. If it was a creature card, put a +1/+1 counter on this creature and you gain
// 1 life.
import { activated, addCounters, defineCard, exile, gainLife, isCreature, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Scavenging Ooze',
  faces: [{
    abilities: [
      activated('{G}', function* (c) {
        // ruling 1 (CR 608.2b): com o alvo ilegal, a habilidade não resolve: nem marcador nem vida
        const id = tgt(c);
        if (id === null) return;
        const eraCriatura = isCreature(c.g, id);
        yield* exile(c.g, [id]);
        if (!eraCriatura) return;
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        gainLife(c.g, c.you, 1, c.source);
      }, { targets: [t.card('graveyard', undefined, 'carta alvo num cemitério', 'any')], text: '{G}: Exile a carta alvo de um cemitério. Se era uma carta de criatura, coloque um marcador +1/+1 nesta criatura e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: duas ativações no mesmo alvo: só a primeira faz efeito',
  },
});
