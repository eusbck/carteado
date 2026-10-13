// Monta os dois decks da mesa a partir das listas abaixo: acrescenta as skins a proprias/cartas.json e grava
// decks/brasil-lula.json e decks/brasil-bolsonaro.json. Rodar de dentro de jogo/:
//   node proprias/montar.mjs            grava
//   node proprias/montar.mjs --conferir só mostra os problemas
// Depois: node ferramentas/cartas-proprias.ts && node ferramentas/decks.ts gerar

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const conferir = process.argv.includes('--conferir');
const gerado = JSON.parse(readFileSync('gerado/cartas.json', 'utf8')).cartas;
const imagens = JSON.parse(readFileSync('gerado/imagens.json', 'utf8'));
const fonte = JSON.parse(readFileSync('proprias/cartas.json', 'utf8'));

// [nome novo, carta copiada, frase, tipo em português (quando a carta não tem impressão em português), texto idem]
const SKINS = [
  // ---- nos dois decks
  ['Banco Master do Vorcaro', 'Coveted Jewel', '“Rende 140% do CDI. Confia.”'],
  // ---- Lula
  ['Imposto é Amor', 'Smothering Tithe', '“Cada compra do oponente é uma contribuição solidária.”'],
  ['Taxa das Blusinhas', 'Monologue Tax', '“Era só uma blusinha de 30 reais.”'],
  ['Mensalão', 'Black Market Connections', '“Não sabia de nada.”'],
  ['Minha Casa, Minha Vida', 'Land Tax', '“Terreno para quem tem menos terreno.”'],
  ['Triplex do Guarujá', 'Ghostly Prison', '“Não é meu. É de um amigo.”', 'Encantamento', 'As criaturas não podem atacar você, a menos que o controlador delas pague {2} para cada criatura que ele controla que esteja atacando você.'],
  ['Boulos e o MTST', 'Mob Rule', '“Ocupar, resistir, atacar no mesmo turno.”'],
  ['Companheiro É Companheiro', 'Changing Loyalty', '“Mudou de partido, mas continua da base.”', 'Encantamento — Aura', 'Lampejo\nReplicar {2} (Ao conjurar esta mágica, copie-a para cada vez que você pagou o custo de replicar. Você pode escolher novos alvos para as cópias.)\nEncantar criatura\nQuando a criatura encantada morre, devolva-a ao campo de batalha sob o seu controle.'],
  ['Lula Livre', 'Animate Dead', '“A jararaca está viva.”', 'Encantamento — Aura', 'Encantar carta de criatura em um cemitério\nQuando esta Aura entra, devolva a carta de criatura encantada ao campo de batalha sob o seu controle e anexe esta Aura a ela. Quando esta Aura sai do campo de batalha, o controlador daquela criatura a sacrifica.\nA criatura encantada recebe -1/-0.'],
  ['Janones, Tropa do Zap', 'Conspiracy Theorist', '“Fonte: confia.”'],
  ['Zanin, Advogado de Estimação', 'Tomik, Wielder of Law', '“De advogado do réu a ministro, sem escalas.”'],
  ['Gleisi, a Presidenta do Partido', 'Breena, the Demagogue', '“A culpa é da Faria Lima.”'],
  ['Zé Dirceu, o Articulador', 'Tymna the Weaver', '“Voltei. De novo.”'],
  ['Tornozeleira Eletrônica', 'Chains of Custody', '“Sai da cadeia, mas o sinal de GPS fica.”', 'Encantamento — Aura', 'Encantar criatura que você controla\nQuando esta Aura entra, exile a permanente alvo que não seja terreno que um oponente controla até esta Aura sair do campo de batalha.\nA criatura encantada tem resguardo {2}.'],
  ['Tesoureiro do Partido', 'Treasure Nabber', '“Recibo? Que recibo?”'],
  ['Reforma Tributária', 'Syphon Mind', '“Simplificamos: agora todo mundo paga.”'],
  ['Picanha e Cervejinha', 'Phyrexian Arena', '“A promessa era picanha. Veio pé de frango.”'],
  ['Marina Silva, a Sustentável', 'Kor Spiritdancer', '“Cada Aura plantada é uma árvore a menos derrubada.”'],
  ['Sidônio, o Marqueteiro', 'Sram, Senior Edificer', '“O problema não é o governo, é a comunicação.”'],
  ['Nunca Antes na História Deste País', 'Breach the Multiverse', '“Pegue o que quiser. É tudo nosso.”'],
  ['Sítio de Atibaia', 'Reliquary Tower', '“Também não é meu.”'],
  // ---- Bolsonaro
  ['Gripezinha', 'Swords to Plowshares', '“Pelo meu histórico de atleta, nem sentiria.”'],
  ['Zambelli de Arma em Punho', 'Go for the Throat', '“Correu atrás dele no meio da rua. Depois correu para a Itália.”'],
  ['Oito de Janeiro', 'Martial Coup', '“Era só um passeio no domingo.”'],
  ['Mito', 'Angelic Destiny', '“Mito! Mito! Mito!”'],
  ['Cercadinho do Alvorada', 'Ghostly Prison', '“Para falar com o presidente, paga o pedágio.”', 'Encantamento', 'As criaturas não podem atacar você, a menos que o controlador delas pague {2} para cada criatura que ele controla que esteja atacando você.'],
  ['Malafaia, Pastor do Dízimo', 'Soul Warden', '“Cada criatura que entra é uma oferta.”'],
  ['Queiroz, o Operador', 'Zulaport Cutthroat', '“Estava escondido em Atibaia. Também.”'],
  ['Braga Netto, o Interventor', 'Ravenous Chupacabra', '“General de quatro estrelas, plano de uma.”'],
  ['Jair Renan, o 04', 'Serra Ascendant', '“Começa pequeno. Com a vida do papai, voa.”'],
  ['Patriota do Caminhão', "Ajani's Pridemate", '“Pendurado no para-choque, crescendo a cada bênção.”'],
  ['Damares, a da Goiabeira', 'Archangel of Thune', '“Vi Jesus no pé de goiaba.”'],
  ['Eduardo Bananinha, o Exilado', 'Vampire Nighthawk', '“Fritava hambúrguer. Agora frita o Brasil de longe.”'],
  ['Milei, El Loco da Motosserra', 'Massacre Wurm', '“¡Afuera!”'],
  ['Tarifaço do Trump', 'Decree of Pain', '“Cinquenta por cento em tudo. De nada.”'],
  ['Paulo Guedes, o Posto Ipiranga', 'Pitiless Plunderer', '“Pergunta lá no Posto Ipiranga.”', 'Criatura — Humano Pirata', 'Sempre que outra criatura que você controla morre, crie uma ficha de Tesouro. (Ela é um artefato com “{T}, sacrifique esta ficha: adicione um mana de qualquer cor”.)'],
  ['Sergio Moro, Ex-Juiz', 'Palace Jailer', '“Prendeu um, virou ministro do outro.”'],
  ['Mauro Cid, o Delator', 'Kalitas, Traitor of Ghet', '“Contou tudo. Depois contou de novo.”'],
  ['Leite Condensado', 'Exsanguinate', '“Quinze milhões em leite condensado. Para enfiar onde?”'],
  ['Joias da Arábia', 'Basilisk Collar', '“Presente pessoal. Estava na mochila do assessor.”'],
  ['Pix do Mito', 'Boon Reflection', '“Dezessete milhões em doações. Vida em dobro.”'],
  ['Valdemar, Dono do Partido', 'Grim Hireling', '“O partido é meu. O candidato é alugado.”'],
  ['Vivendas da Barra', 'Gavony Township', '“Condomínio tranquilo. Vizinhos discretos.”'],
];

const basicas = (o) => Object.entries(o).map(([nome, quantidade]) => ({ nome, quantidade }));
const um = (nomes) => nomes.map((nome) => ({ nome, quantidade: 1 }));

const DECKS = [
  {
    id: 'brasil-lula', nome: 'Brasil Pronto pra Mais (deck do Lula)', comandante: 'Lula, o Espanca Pobre', cores: 'WBR',
    cartas: [
      ...basicas({ Plains: 5, Swamp: 4, Mountain: 3 }),
      ...um([
        // terrenos
        'Command Tower', 'Nomad Outpost', 'Path of Ancestry', 'Exotic Orchard', 'Battlefield Forge', 'Caves of Koilos', 'Sulfurous Springs',
        'Clifftop Retreat', 'Isolated Chapel', 'Dragonskull Summit', 'Godless Shrine', 'Temple of Triumph', 'Temple of Silence',
        'Temple of Malice', 'Boros Garrison', 'Orzhov Basilica', 'Rakdos Carnarium', 'Evolving Wilds', 'Terramorphic Expanse',
        'Sítio de Atibaia', 'Bojuka Bog', "Rogue's Passage", 'Smoldering Marsh', 'Canyon Slough',
        // mana
        'Sol Ring', 'Arcane Signet', 'Boros Signet', 'Orzhov Signet', 'Rakdos Signet', 'Talisman of Hierarchy', 'Talisman of Conviction',
        'Fellwar Stone', "Commander's Sphere", 'Banco Master do Vorcaro',
        // inéditas
        'Bolsa Família', 'Geraldo Alckmin, o Vice Chuchu', 'Dilma, Estocadora de Vento', 'Haddad, o Taxad', 'Janja, Primeira-Dama',
        'Jaques Wagner e Rui Costa, Dupla da Bahia', 'Maria do Rosário', 'PAC, a Obra que Nunca Acaba', 'Emenda Pix', 'Faz o L',
        'Alexandre de Moraes, o Xandão',
        // skins
        'Imposto é Amor', 'Taxa das Blusinhas', 'Mensalão', 'Minha Casa, Minha Vida', 'Triplex do Guarujá', 'Boulos e o MTST',
        'Companheiro É Companheiro', 'Lula Livre', 'Janones, Tropa do Zap', 'Zanin, Advogado de Estimação', 'Gleisi, a Presidenta do Partido',
        'Zé Dirceu, o Articulador', 'Tornozeleira Eletrônica', 'Tesoureiro do Partido', 'Reforma Tributária', 'Picanha e Cervejinha',
        'Marina Silva, a Sustentável', 'Sidônio, o Marqueteiro', 'Nunca Antes na História Deste País',
        // auras
        'Ethereal Armor', 'Sheltered by Ghosts', 'Mantle of the Ancients', 'Coercive Impetus', 'Martial Impetus', 'Parasitic Impetus',
        'Shiny Impetus', 'Vow of Duty', 'Vow of Lightning', 'Vow of Malice', 'Darksteel Mutation', 'Angelic Destiny', 'Underworld Connections',
        // roubo e apoio
        'Tariel, Reckoner of Souls', 'Puppeteer Clique', "Archon of Sun's Grace", "Ajani's Chosen", 'Eidolon of Countless Battles',
        'Starfield Mystic', 'Hateful Eidolon', 'Swords to Plowshares', 'Mortify', 'Generous Gift',
      ]),
    ],
  },
  {
    id: 'brasil-bolsonaro', nome: 'O Brasil Vai Vencer (deck do Bolsonaro)', comandante: 'Bolsonaro, o Genocida', cores: 'WBG',
    cartas: [
      ...basicas({ Forest: 5, Plains: 4, Swamp: 3 }),
      ...um([
        // terrenos
        'Command Tower', 'Sandsteppe Citadel', 'Path of Ancestry', 'Exotic Orchard', 'Caves of Koilos', 'Llanowar Wastes', 'Isolated Chapel',
        'Woodland Cemetery', 'Sunpetal Grove', 'Godless Shrine', 'Temple of Malady', 'Temple of Plenty', 'Temple of Silence',
        'Orzhov Basilica', 'Golgari Rot Farm', 'Selesnya Sanctuary', 'Evolving Wilds', 'Terramorphic Expanse', 'Bojuka Bog',
        "Rogue's Passage", 'Canopy Vista', 'Scattered Groves', 'Krosan Verge', 'Vivendas da Barra',
        // mana
        'Sol Ring', 'Arcane Signet', 'Orzhov Signet', 'Selesnya Signet', 'Talisman of Hierarchy', 'Fellwar Stone', "Commander's Sphere",
        'Llanowar Elves', 'Sakura-Tribe Elder', 'Banco Master do Vorcaro',
        // inéditas
        'Flávio Bolsonaro, Filhote de Cruz Credo', 'Nikolas Ferreira, o Mais Votado', 'Motociata', 'Cloroquina',
        'Michelle, Primeira-Dama em Línguas', 'Tarcísio, o Plano B', 'Carluxo, Gabinete do Ódio', 'Minuta do Golpe', 'Pintou um Clima',
        'Imbrochável', 'Alexandre de Moraes, o Xandão',
        // skins
        'Gripezinha', 'Zambelli de Arma em Punho', 'Oito de Janeiro', 'Mito', 'Cercadinho do Alvorada', 'Malafaia, Pastor do Dízimo',
        'Queiroz, o Operador', 'Braga Netto, o Interventor', 'Jair Renan, o 04', 'Patriota do Caminhão', 'Damares, a da Goiabeira',
        'Eduardo Bananinha, o Exilado', 'Milei, El Loco da Motosserra', 'Tarifaço do Trump', 'Paulo Guedes, o Posto Ipiranga',
        'Sergio Moro, Ex-Juiz', 'Mauro Cid, o Delator', 'Leite Condensado', 'Joias da Arábia', 'Pix do Mito', 'Valdemar, Dono do Partido',
        // remoção
        'Infernal Grasp', 'Mortify', 'Anguished Unmaking', 'Despark', 'Path to Exile', 'Casualties of War', 'Generous Gift', 'Vanquish the Horde',
        // vida
        'Cleric Class', "Trostani, Selesnya's Voice", 'Lathiel, the Bounteous Dawn', 'Voice of the Blessed', 'Resplendent Angel',
        'Crested Sunmare', 'Dina, Soul Steeper', 'Marauding Blight-Priest',
        // pancada
        'Brimaz, King of Oreskos', 'Fleecemane Lion', 'Voice of Resurgence', 'Shalai, Voice of Plenty', 'Grave Titan',
      ]),
    ],
  },
];

// ---------------------------------------------------------------------------- conferência

const problemas = [];
const slug = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const skinDe = new Map(SKINS.map(([nome, de]) => [nome, de]));
const proprias = new Map(fonte.cartas.map((c) => [c.nome, c]));
const semPt = [];
for (const [nome, de, , tipoPt, texto] of SKINS) {
  const o = gerado[de];
  if (!o) { problemas.push(`${nome}: "${de}" não está no jogo`); continue; }
  if (o.faces.length !== 1) problemas.push(`${nome}: "${de}" tem mais de uma face`);
  if (!existsSync(`cartas/defs/${slug(de)}.ts`)) problemas.push(`${nome}: "${de}" não tem regras`);
  const pt = imagens[de]?.pt;
  if ((!pt?.texto && pt?.texto !== '' && texto === undefined) || (!pt?.tipo && !tipoPt)) semPt.push(`${nome} <- ${de}: ${o.faces[0].typeLine} | ${o.faces[0].oracleText.replace(/\n/g, ' / ')}`);
}
for (const d of DECKS) {
  const total = d.cartas.reduce((n, c) => n + c.quantidade, 0) + 1;
  if (total !== 100) problemas.push(`${d.id}: ${total} cartas (o Commander pede 100)`);
  const vistos = new Set();
  for (const c of d.cartas) {
    if (vistos.has(c.nome)) problemas.push(`${d.id}: ${c.nome} repetida`);
    vistos.add(c.nome);
    const base = skinDe.get(c.nome) ?? c.nome;
    const o = gerado[base];
    if (!o) { if (!proprias.has(c.nome)) problemas.push(`${d.id}: ${c.nome} não existe`); continue; }
    if (!skinDe.has(c.nome) && !proprias.has(c.nome) && !o.faces[0].supertypes.includes('Basic') && !existsSync(`cartas/defs/${slug(base)}.ts`)) problemas.push(`${d.id}: ${c.nome} sem regras`);
    const fora = o.colorIdentity.filter((x) => !d.cores.includes(x));
    if (fora.length) problemas.push(`${d.id}: ${c.nome} tem cor fora da identidade (${fora.join('')})`);
    if (c.quantidade > 1 && !o.faces[0].supertypes.includes('Basic')) problemas.push(`${d.id}: ${c.nome} com ${c.quantidade} cópias`);
  }
}
if (problemas.length) console.log(`PROBLEMAS (${problemas.length}):\n  ${problemas.join('\n  ')}`);
if (semPt.length) console.log(`SEM PORTUGUÊS (${semPt.length}): escreva tipo e texto na lista de skins\n  ${semPt.join('\n  ')}`);
if (conferir || problemas.length || semPt.length) process.exit(problemas.length || semPt.length ? 1 : 0);

// ---------------------------------------------------------------------------- gravação

const nomesSkins = new Set(SKINS.map(([n]) => n));
const antigas = fonte.cartas.filter((c) => !nomesSkins.has(c.nome));
const skins = SKINS.map(([nome, de, frase, tipoPt, texto]) => ({ nome, skinDe: de, ...(tipoPt ? { tipoPt } : {}), ...(texto !== undefined ? { texto } : {}), frase }));
fonte.cartas = [...antigas.filter((c) => !c.ficha), ...skins, ...antigas.filter((c) => c.ficha)];
writeFileSync('proprias/cartas.json', JSON.stringify(fonte, null, 1) + '\n');

const agora = '2026-10-12T00:00:00.000Z';
DECKS.forEach((d, i) => {
  const arq = `decks/${d.id}.json`;
  const antigo = existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : null;
  writeFileSync(arq, JSON.stringify({
    formato: 1, id: d.id, ordem: antigo?.ordem ?? 100 + i, nome: d.nome, link: '', importadoEm: antigo?.importadoEm ?? agora, verificadoEm: null,
    atual: { comandante: d.comandante, cartas: d.cartas, origem: { versao: null, atualizadoEm: null }, desde: agora },
    preparacao: null,
  }, null, 1) + '\n');
});
console.log(`${skins.length} skins na fonte; ${DECKS.length} decks gravados.`);
