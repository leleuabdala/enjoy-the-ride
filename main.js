import { supabase } from './supabase-client.js'

(function(){
"use strict";

var ATTRS=[
 {k:"for",n:"Força",     d:"treino",          i:"i-for", q:"Treinar (academia ou sessão em casa)"},
 {k:"vit",n:"Vitalidade",d:"alimentação",     i:"i-vit", q:"Comi o que estava planejado"},
 {k:"per",n:"Percepção", d:"direção de arte", i:"i-per", q:"30 min de estudo de direção de arte"},
 {k:"men",n:"Mente",     d:"páginas matinais",i:"i-men", q:"Escrever as páginas até o fim"},
 {k:"vin",n:"Vínculo",   d:"a Gi",            i:"i-vin", q:"Uma coisa que eu propus e fiz acontecer"}
];
var BONUS=[
 {k:"read",i:"i-read",n:"Li alguma coisa",
  p:"Kindle, papel, tanto faz. Se for livro de craft ou direção de arte, paga em Percepção; qualquer outro paga em Mente.",
  pay:"+7 xp · +8 ouro",gold:8,note:"Qual livro?",pick:[["per","craft / arte"],["men","qualquer outro"]],pickXp:7},
 {k:"well",i:"i-well",n:"Enchi o poço",
  p:"Quinze minutos recebendo em vez de produzindo: uma galeria, um livro de arte, um filme antigo, uma caminhada. Não é trabalho e não é estudo — é entrada.",
  pay:"+8 percepção · +10 ouro",xp:{per:8},gold:10,note:"O que você foi ver?"}
];
var JOURNEY=[
 ["Segurança","Comece as páginas matinais. Liste os inimigos e os incentivadores da sua autoestima criativa."],
 ["Identidade","Onde o seu tempo realmente vai. Identifique os crazymakers e o ceticismo que te trava."],
 ["Poder","Volte à infância: o quarto, cinco conquistas, cinco comidas. Raiva é combustível, não defeito."],
 ["Integridade","Privação de leitura: uma semana sem ler nada. E uma carta de você aos 80 anos para você hoje."],
 ["Possibilidade","Comece um arquivo de imagens. Cinco coisas que você tentaria se tivesse fé ou dinheiro."],
 ["Abundância","Abundância natural: cinco pedras, cinco flores. Abra espaço: doe cinco roupas velhas."],
 ["Conexão","“Cuidar de mim como objeto precioso me torna mais forte.” Ouça música só por prazer."],
 ["Força","Procura de objetivo: dê um título ao sonho e escreva o passo concreto que cabe nesta semana."],
 ["Compaixão","Releia as páginas matinais pela primeira vez. Duas canetas: descobertas e ações."],
 ["Autoproteção","Os mortais: álcool, trabalho, dinheiro, comida. Onde cada um te bloqueia."],
 ["Autonomia","Dez desejos em cada área: saúde, finanças, lazer, relações, criação, carreira, espírito."],
 ["Fé","Escreva suas resistências e medos. Releia as crenças negativas da Semana 1 e ria."]
];
var POOLS={
 oficio:{n:"Ofício",attr:"per",cards:[
  "Refaça um frame que você já entregou — só direção de arte, sem cliente olhando.",
  "Escolha uma peça de motion que você admira e desmonte ela: o que faz funcionar, em cinco linhas.",
  "Faça um estudo de cor de 30 segundos. Uma paleta, uma ideia, nada mais.",
  "Monte um board de referência de um estilo visual que você nunca usou.",
  "Anime uma coisa boba só pra você. Sem briefing, sem entrega, sem mostrar pra ninguém.",
  "Pegue um projeto antigo e escreva o que você faria diferente hoje.",
  "Estude um tipo de tipografia em movimento que você não domina e faça um teste de 5 segundos.",
  "Peça a alguém que você respeita uma crítica direta de uma peça sua. Só ouça.",
  "Crie três composições diferentes usando os mesmos elementos.",
  "Escolha uma cena de filme e transforme as cores dela em uma pequena peça sua.",
  "Faça um teste de animação em que o ritmo conte a ideia.",
  "Transforme um objeto do dia a dia em um personagem e crie uma pose para ele.",
  "Explore luz e sombra em um estudo visual curto.",
  "Crie uma transição entre duas cenas de um projeto seu.",
  "Monte um storyboard de seis quadros para uma ideia que você gostaria de animar.",
  "Experimente uma técnica de animação que desperte sua curiosidade e salve o resultado."]},
 corpo:{n:"Corpo",attr:"for",cards:[
  "Marque os três treinos da semana no calendário. Hora marcada, como reunião de cliente.",
  "Um treino a mais do que na semana passada. Um só.",
  "Prepare as proteínas da semana inteira num domingo só.",
  "Cinco dias seguidos comendo o que estava no plano. Domingo não conta.",
  "Uma caminhada de 30 minutos, três vezes na semana.",
  "Durma antes da meia-noite quatro noites.",
  "Troque um treino por algo que você nunca fez: natação, boxe, escalada.",
  "Duas semanas de treino sem faltar — esta é a primeira.",
  "Separe a roupa e os acessórios dos próximos treinos para facilitar a saída.",
  "Faça uma pausa para se movimentar em três dias de trabalho nesta semana.",
  "Prepare um lanche para levar em um dia de rotina corrida.",
  "Experimente uma receita que combine com seu planejamento de refeições.",
  "Reserve um momento da semana para alongar o corpo de forma confortável.",
  "Organize um espaço da casa para fazer seus exercícios.",
  "Registre como você se sentiu antes e depois de dois treinos.",
  "Planeje um horário para começar a desacelerar e experimente seguir esse horário em três noites."]},
 vida:{n:"Vida",attr:"vin",cards:[
  "Planeje e execute uma coisa com a Gi que ela não está esperando.",
  "Resolva aquela pendência da casa que está te irritando há semanas.",
  "Ligue pra alguém que você não fala há mais de três meses.",
  "Um dia inteiro do fim de semana sem trabalho e sem celular na mão.",
  "Faça um jantar pra vocês dois como se fosse restaurante. Mesa posta, o pacote todo.",
  "Leve a Gi a um lugar da cidade onde vocês nunca foram.",
  "Escreva pra ela uma coisa que você nunca disse em voz alta.",
  "Tire uma tarde pra fazer nada. Nada mesmo, sem tela.",
  "Escolham juntos um filme que nenhum dos dois viu e façam uma sessão em casa.",
  "Separe alguns objetos que você não usa mais e encaminhe para doação.",
  "Convide alguém querido para um café ou uma conversa.",
  "Escolha uma foto de vocês dois e dê a ela um lugar na casa.",
  "Pergunte à Gi o que tornaria a semana dela mais leve e combine uma ajuda concreta.",
  "Retome um hobby por um momento nesta semana.",
  "Organize um cantinho da casa para ficar mais gostoso de usar.",
  "Anote três coisas boas que aconteceram nesta semana e compartilhe uma com alguém."]}
};
var ANGLES=["oficio","corpo","vida"];
var CARD_XP=30,CARD_GOLD=80,BONUS_2=100,BONUS_3=250,GOLD_DISH_PICK=15,GOLD_DISH_DO=30;
var RANKS=[{r:"E",min:1},{r:"D",min:5},{r:"C",min:10},{r:"B",min:18},{r:"A",min:28},{r:"S",min:40}];
var DAYS=["Segunda","Terça","Quarta","Quinta","Sexta"];
var XP_QUEST=10,XP_EXTRA=5,GOLD_QUEST=5,GOLD_ALL=25,
    XP_AD=30,GOLD_AD=60,XP_CI=15,GOLD_CI=25,GOLD_MEAL=20,
    
    PEN_MISS=6,MAX_CATCHUP=14,MAX_EXTRA=3,UNSEAL_WEEK=9;

function need(l){return 40+(l-1)*20}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function shift(ds,n){var p=ds.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]);d.setDate(d.getDate()+n);
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function diffDays(a,b){var pa=a.split("-"),pb=b.split("-");
 return Math.round((Date.UTC(+pb[0],+pb[1]-1,+pb[2])-Date.UTC(+pa[0],+pa[1]-1,+pa[2]))/864e5)}
function dow(ds){var p=ds.split("-");return new Date(+p[0],+p[1]-1,+p[2]).getDay()}
function mondayOf(ds){var d=dow(ds);return shift(ds,d===0?-6:1-d)}
function words(t){var m=(t||"").trim().match(/\S+/g);return m?m.length:0}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function br(d){return d.split("-").reverse().join("/")}

function rnd(seed){var x=Math.sin(seed*9301+49297)*233280;return x-Math.floor(x)}
function dealCards(n){
 return ANGLES.map(function(a,i){
  var pool=POOLS[a].cards,idx=Math.floor(rnd(n*7+i*31)*pool.length)%pool.length;
  return {a:a,t:pool[idx]};
 });
}
function fresh(){
 var a={};ATTRS.forEach(function(x){a[x.k]={xp:0,lvl:1,last:today(),quest:x.q}});
 return {v:3,start:today(),updatedAt:0,attrs:a,gold:0,streak:0,best:0,goal:750,writeMode:"key",
  day:{date:today(),done:{},extra:{},bonus:{},bonusNote:{},readAttr:"men",text:"",counted:false,closed:false},
  week:{n:1,ad:false,adNote:"",ci:{a:"",b:"",c:""},ciDone:false,wrote:0,
        cards:dealCards(1),cardPlan:{},cardDone:{},prized:false,
        dish:"",dishPicked:false,dishDone:false,
        meals:normalizeMeals([]),mealsDone:false,folga:false},
  history:{},purchases:[],unsealed:false,avatar:{v:3,marks:0,points:0,seen:{},equipped:-1},
  shop:[{id:"s1",name:"Compra idiota (até R$100)",cost:300},
        {id:"s2",name:"Tarde inteira de jogo, sem culpa",cost:250},
        {id:"s3",name:"Livro novo, sem pensar no preço",cost:260},
        {id:"s4",name:"Ingresso de stand-up",cost:450},
        {id:"s5",name:"Hambúrguer do bom",cost:420},
        {id:"s6",name:"Rodízio com a Gi",cost:650}],
  deck:[{id:"c1",t:"Peça o jantar mais caro do cardápio hoje. Sem olhar o preço."},
        {id:"c2",t:"Compre aquela bobagem que você viu essa semana e fingiu que não queria."},
        {id:"c3",t:"Uma tarde inteira de jogo. Sem culpa, sem relógio."},
        {id:"c4",t:"Um ingrediente caro pra cozinhar no fim de semana. Escolha o mais absurdo."},
        {id:"c5",t:"Um livro de arte. Daqueles grandes, de capa dura."},
        {id:"c6",t:"Noite de filme com a Gi — você escolhe o filme, ela não pode reclamar."},
        {id:"c7",t:"Um dia inteiro sem abrir este app. Folga total, sem penalidade."},
        {id:"c8",t:"Aquele stand-up que você queria ver. Compra o ingresso hoje."}]};
}
var S=fresh(),saveTimer=null,padTimer=null,fieldTimer=null,BOOTED=false,TOUCHED=false,CLOUD_USER=null,CLOUD_BASE=null,CLOUD_PURCHASES=0;
function xpTotal(a){var n=0;for(var l=1;l<a.lvl;l++)n+=need(l);return n+a.xp}
function cloudSnapshot(){var x={gold:S.gold,attrs:{}};ATTRS.forEach(function(a){x.attrs[a.k]=xpTotal(S.attrs[a.k])});return x}
function weekStart(){return mondayOf(S.day.date||today())}
function dayStatus(){if(S.history[S.day.date]==="f")return "free_day";if(S.history[S.day.date]==="x")return "missed";if(doneCount()===ATTRS.length)return "complete";return "active"}
function cloudRows(){
 var uid=CLOUD_USER.id,prefs={shop:S.shop,deck:S.deck,unsealed:S.unsealed};
 return {
  profile:{user_id:uid,display_name:"Gabriel Abdala",journey_start:S.start,word_goal:S.goal,write_mode:S.writeMode,equipped_character:S.avatar.equipped,preferences:prefs},
  day:{user_id:uid,entry_date:S.day.date,done:S.day.done,extra:S.day.extra,bonus:S.day.bonus,bonus_notes:S.day.bonusNote,read_attr:S.day.readAttr,counted:S.day.counted,closed:S.day.closed,day_status:dayStatus()},
  journal:{user_id:uid,entry_date:S.day.date,week_number:S.week.n,mode:S.writeMode,text_content:S.day.text||null,word_count:words(S.day.text||""),closed:S.day.closed,closed_at:S.day.closed?new Date().toISOString():null},
  week:{user_id:uid,week_number:S.week.n,week_start:weekStart(),encounter_done:S.week.ad,encounter_note:S.week.adNote,checkin:S.week.ci,checkin_done:S.week.ciDone,wrote:S.week.wrote,cards:S.week.cards,card_plan:S.week.cardPlan,card_done:S.week.cardDone,prize_drawn:S.week.prized,dish:S.week.dish,dish_picked:S.week.dishPicked,dish_done:S.week.dishDone,meals:S.week.meals,meals_done:S.week.mealsDone,free_day_used:S.week.folga},
  progress:{user_id:uid,attrs:S.attrs,gold:S.gold,current_streak:S.streak,best_streak:S.best,avatar_marks:S.avatar.marks,avatar_points:S.avatar.points,avatar_seen:S.avatar.seen,unlocked:S.unsealed}
 };
}
async function persistCloud(){
 if(!CLOUD_USER)return;var r=cloudRows(),before=CLOUD_BASE,after=cloudSnapshot();
 var jobs=[supabase.from("profiles").upsert(r.profile),supabase.from("daily_entries").upsert(r.day,{onConflict:"user_id,entry_date"}),supabase.from("journal_entries").upsert(r.journal,{onConflict:"user_id,entry_date"}),supabase.from("weekly_entries").upsert(r.week,{onConflict:"user_id,week_number"}),supabase.from("user_progress").upsert(r.progress)];
 var hist=Object.keys(S.history).filter(function(date){return date!==S.day.date}).map(function(date){var v=S.history[date];return {user_id:CLOUD_USER.id,entry_date:date,day_status:v==="f"?"free_day":v==="x"?"missed":v===ATTRS.length?"complete":"active"}});
 if(hist.length)jobs.push(supabase.from("daily_entries").upsert(hist,{onConflict:"user_id,entry_date"}));
 var newPurchases=Math.max(0,S.purchases.length-CLOUD_PURCHASES);
 if(newPurchases){jobs.push(supabase.from("purchases").insert(S.purchases.slice(0,newPurchases).map(function(p){return {user_id:CLOUD_USER.id,reward_name:p.name,gold_cost:p.cost,purchased_at:(p.date||today())+"T12:00:00-03:00"}})))}
 if(before){var events=[];ATTRS.forEach(function(a){var d=after.attrs[a.k]-(before.attrs[a.k]||0);if(d)events.push({user_id:CLOUD_USER.id,event_type:"state_change",event_date:today(),attribute_key:a.k,xp_delta:d,gold_delta:0,source_type:"app_state",metadata:{revision:6}})});var gd=after.gold-before.gold;if(gd)events.push({user_id:CLOUD_USER.id,event_type:"state_change",event_date:today(),xp_delta:0,gold_delta:gd,source_type:"app_state",metadata:{revision:6}});if(events.length)jobs.push(supabase.from("progress_events").insert(events))}
 var results=await Promise.all(jobs),failed=results.find(function(x){return x.error});if(failed)throw failed.error;CLOUD_BASE=after;CLOUD_PURCHASES=S.purchases.length;
}

function attrOf(k){for(var i=0;i<ATTRS.length;i++)if(ATTRS[i].k===k)return ATTRS[i];return ATTRS[0]}
function addXp(k,amt){var a=S.attrs[k];if(!a)return;a.xp+=amt;
 while(a.xp>=need(a.lvl)){a.xp-=need(a.lvl);a.lvl++;toast("Nível acima","<b>"+attrOf(k).n+"</b> chegou ao nível "+a.lvl+".")}
 while(a.xp<0){if(a.lvl>1){a.lvl--;a.xp+=need(a.lvl)}else a.xp=0}}
function minLvl(){return ATTRS.reduce(function(m,x){return Math.min(m,S.attrs[x.k].lvl)},999)}
function rank(){var m=minLvl(),r=RANKS[0];for(var i=0;i<RANKS.length;i++)if(m>=RANKS[i].min)r=RANKS[i];return r}
function nextRank(){var m=minLvl();for(var i=0;i<RANKS.length;i++)if(m<RANKS[i].min)return RANKS[i];return null}
function doneCount(){var n=0;ATTRS.forEach(function(x){if(S.day.done[x.k])n++});return n}
function weekNum(d){return Math.floor(diffDays(mondayOf(S.start),mondayOf(d))/7)+1}
function journeyIdx(){return Math.min(12,Math.max(1,S.week.n))}
// Keep the first five slots for existing main meals; the last five hold snacks.
function normalizeMeals(values){
 return Array.from({length:10},function(_,i){return Array.isArray(values)&&typeof values[i]==="string"?values[i]:""});
}
function mealsFilled(){return S.week.meals.slice(0,5).filter(function(m){return m&&m.trim()}).length}

function closeWeek(){
 if(CLOUD_USER)persistCloud().catch(function(e){console.error(e)})
}
function newWeek(n){return {n:n,ad:false,adNote:"",ci:{a:"",b:"",c:""},ciDone:false,wrote:0,
 cards:dealCards(n),cardPlan:{},cardDone:{},prized:false,
 dish:"",dishPicked:false,dishDone:false,
 meals:normalizeMeals([]),mealsDone:false,folga:false}}
function cardsDone(){return Object.keys(S.week.cardDone||{}).filter(function(k){return S.week.cardDone[k]}).length}

function settle(){
 var t=today();
 if(S.day.date===t){
   var wn=weekNum(t);
   if(wn!==S.week.n){var r={days:0,losses:{}};closeWeek();S.week=newWeek(wn);return {report:r,archive:null}}
   return null;
 }
 var gap=diffDays(S.day.date,t);
 if(gap<0){S.day={date:t,done:{},extra:{},bonus:{},bonusNote:{},readAttr:S.day.readAttr||"men",text:"",counted:false,closed:false};return null}
 var rep={days:0,losses:{},broke:false,folga:false},archive=null;

 var pend=[];
 var n=doneCount();
 S.history[S.day.date]=n>0?n:"x";
 if(S.day.text&&S.day.text.trim())archive={date:S.day.date,text:S.day.text,words:words(S.day.text),week:S.week.n};
 if(n===0)pend.push({date:S.day.date,missing:ATTRS.map(function(x){return x.k})});
 if(n===ATTRS.length){S.streak++;if(S.streak>S.best)S.best=S.streak}

 var missed=Math.min(gap-1,MAX_CATCHUP);
 for(var i=1;i<=missed;i++){
   var d=shift(S.day.date,i);S.history[d]="x";
   pend.push({date:d,missing:ATTRS.map(function(x){return x.k})});
 }
 // folga: o pior dia da leva sai de graça, uma vez por semana
 if(!S.week.folga&&pend.length){
   var worst=0;for(var j=1;j<pend.length;j++)if(pend[j].missing.length>pend[worst].missing.length)worst=j;
   if(pend[worst].missing.length>0){
     S.week.folga=true;rep.folga=true;S.history[pend[worst].date]="f";
     pend.splice(worst,1);
   }
 }
 pend.forEach(function(p){
   if(!p.missing.length)return;
   rep.days++;if(S.streak>0){rep.broke=true}S.streak=0;
   p.missing.forEach(function(k){addXp(k,-PEN_MISS);rep.losses[k]=(rep.losses[k]||0)+PEN_MISS});
 });

 var cut=shift(t,-120);
 Object.keys(S.history).forEach(function(d){if(d<cut)delete S.history[d]});

 var wn2=weekNum(t);
 if(wn2!==S.week.n){closeWeek();S.week=newWeek(wn2)}
 S.day={date:t,done:{},extra:{},bonus:{},bonusNote:{},readAttr:S.day.readAttr||"men",text:"",counted:false,closed:false};
 return {report:rep,archive:archive};
}

function localSave(){try{localStorage.setItem("etr.v3",JSON.stringify(S))}catch(e){}}
function localLoad(){try{var r=localStorage.getItem("etr.v3");return r?JSON.parse(r):null}catch(e){return null}}
function save(){
 S.updatedAt=Date.now();TOUCHED=true;localSave();
 if(!CLOUD_USER)return;clearTimeout(saveTimer);
 saveTimer=setTimeout(function(){persistCloud().catch(function(e){console.error("Falha ao salvar no Supabase",e)})},500);
}
function archiveDay(a){if(CLOUD_USER&&a)supabase.from("journal_entries").upsert({user_id:CLOUD_USER.id,entry_date:a.date,week_number:a.week||1,mode:"key",text_content:a.text||null,word_count:a.words||0,closed:true,closed_at:new Date().toISOString()},{onConflict:"user_id,entry_date"}).then(function(r){if(r.error)console.error(r.error)})}
function merge(L){
 if(!L||typeof L!=="object")return;
 var b=fresh();
 S={v:3,start:L.start||b.start,updatedAt:+L.updatedAt||0,attrs:b.attrs,gold:+L.gold||0,streak:+L.streak||0,
  best:+L.best||0,goal:+L.goal||750,writeMode:(L.writeMode==="pen"?"pen":"key"),
  day:(L.day&&L.day.date)?{date:L.day.date,done:L.day.done||{},extra:L.day.extra||{},bonus:L.day.bonus||{},
    bonusNote:L.day.bonusNote||{},readAttr:L.day.readAttr||"men",text:L.day.text||"",counted:!!L.day.counted,closed:!!L.day.closed}:b.day,
  week:(L.week&&L.week.n)?{n:+L.week.n,ad:!!L.week.ad,adNote:L.week.adNote||"",ci:L.week.ci||{a:"",b:"",c:""},
    ciDone:!!L.week.ciDone,wrote:+L.week.wrote||0,
    cards:(Array.isArray(L.week.cards)&&L.week.cards.length===3)?L.week.cards:dealCards(+L.week.n||1),
    cardPlan:L.week.cardPlan||{},cardDone:L.week.cardDone||{},prized:!!L.week.prized,
    dish:L.week.dish||"",dishPicked:!!L.week.dishPicked,dishDone:!!L.week.dishDone,
    meals:normalizeMeals(L.week.meals),
    mealsDone:!!L.week.mealsDone,folga:!!L.week.folga}:b.week,
  history:L.history||{},purchases:Array.isArray(L.purchases)?L.purchases:[],unsealed:!!L.unsealed,
  avatar:normalizeAvatar(L.avatar),
  shop:Array.isArray(L.shop)?L.shop:b.shop,
  deck:Array.isArray(L.deck)&&L.deck.length?L.deck:b.deck};
 ATTRS.forEach(function(x){var s=(L.attrs||{})[x.k]||{};
  S.attrs[x.k]={xp:+s.xp||0,lvl:Math.max(1,+s.lvl||1),last:s.last||S.day.date,quest:s.quest||x.q}});
 reconcileAvatarMarks();
}

var el=function(i){return document.getElementById(i)};
function icon(id){return '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#'+id+'"/></svg>'}

var AVATAR_STEP=8,AVATAR_CLASS_POINTS=56;
var AVATAR_CLASSES=[
 {slug:"soldado",name:"Soldado",accent:"#B84E32",soft:"#F7E7DE",color:"terracota",weapon:"Espada",steps:["Primeira luva","Botas","Segunda luva","Peitoral","Elmo","Capa","Espada"]},
 {slug:"mago",name:"Mago",accent:"#307760",soft:"#E4EEE7",color:"verde-jade",weapon:"Cajado",steps:["Primeira luva","Botas","Túnica","Luvas e bolsa","Chapéu","Manto","Cajado"]},
 {slug:"patrulheiro",name:"Patrulheiro",accent:"#947020",soft:"#F3ECD6",color:"ocre",weapon:"Arco e aljava",steps:["Primeira luva","Botas","Colete","Luvas e cinto","Chapéu","Capa","Arco e aljava"]}
];
function normalizeAvatar(old){
 old=old&&typeof old==="object"?old:{};
 var marks=Math.max(0,Math.floor(Number(old.marks)||0));
 var points=(old.v===2||old.v===3)?Math.max(0,Math.floor(Number(old.points)||0)):
   Math.floor(marks/12)*AVATAR_CLASS_POINTS+Math.ceil((marks%12)*7/12)*AVATAR_STEP;
 var selected=(old.v===2||old.v===3)?old.equipped:old.view;
 var earned=Math.floor(points/AVATAR_CLASS_POINTS);
 return {v:3,marks:marks,points:points,seen:old.seen&&typeof old.seen==="object"&&!Array.isArray(old.seen)?old.seen:{},
   equipped:Number.isInteger(selected)&&selected>=0&&selected<earned?selected:-1};
}
function avatarSet(index){
 var base=AVATAR_CLASSES[index%AVATAR_CLASSES.length],cycle=Math.floor(index/AVATAR_CLASSES.length)+1;
 return {index:index,slug:base.slug,name:base.name+(cycle>1?" · jornada "+cycle:""),accent:base.accent,soft:base.soft,color:base.color,weapon:base.weapon,steps:base.steps};
}
function avatarCurrent(){
 var points=S.avatar.points,index=Math.floor(Math.max(0,points-1)/AVATAR_CLASS_POINTS);
 var earned=points-index*AVATAR_CLASS_POINTS;
 return {index:index,stage:Math.min(7,Math.floor(earned/AVATAR_STEP)),within:earned%AVATAR_STEP,earned:earned};
}
function avatarSprite(index,stage){
 var set=avatarSet(index),frame=Math.max(0,Math.min(7,stage));
 return '<span class="dog-sprite dog-'+set.slug+'" data-class="'+set.slug+'" data-stage="'+frame+'" aria-hidden="true" style="--frame-x:'+((frame%4)*100/3)+'%;--frame-y:'+(frame<4?0:100)+'%"></span>';
}
function addAvatarMark(id){
 if(S.avatar.seen[id])return;
 S.avatar.seen[id]=true;S.avatar.marks++;S.avatar.points++;
 if(S.avatar.points%AVATAR_STEP!==0)return;
 var current=avatarCurrent(),set=avatarSet(current.index);
 if(current.stage===7)toast("Classe completa",esc(set.name)+": conjunto e "+esc(set.weapon.toLowerCase())+" guardados no armário.");
 else toast("Uma peça de cada vez",esc(set.steps[current.stage-1])+" conquistada. Seu cachorrinho está evoluindo!");
}
function removeAvatarMark(id){
 if(!S.avatar.seen[id])return;
 delete S.avatar.seen[id];
 S.avatar.marks=Math.max(0,S.avatar.marks-1);
 S.avatar.points=Math.max(0,S.avatar.points-1);
 if(S.avatar.equipped>=Math.floor(S.avatar.points/AVATAR_CLASS_POINTS))S.avatar.equipped=-1;
}
function reconcileAvatarMarks(){
 // Repair credits from earlier versions before settling the saved day/week.
 // Previous days stay earned; only the editable day's and week's unchecked items are removed.
 function check(id,active){if(!active)removeAvatarMark(id)}
 ATTRS.forEach(function(a){
  check("dia:"+S.day.date+":"+a.k,!!S.day.done[a.k]);
  for(var i=0;i<MAX_EXTRA;i++)check("extra:"+S.day.date+":"+a.k+":"+i,(+S.day.extra[a.k]||0)>i);
 });
 BONUS.forEach(function(b){check("bonus:"+S.day.date+":"+b.k,!!S.day.bonus[b.k])});
 var week="semana:"+S.week.n+":";
 check(week+"encontro",S.week.ad);check(week+"checagem",S.week.ciDone);
 check(week+"prato-escolhido",S.week.dishPicked);check(week+"prato-feito",S.week.dishDone);
 check(week+"plano-refeicoes",S.week.mealsDone);
 S.week.cards.forEach(function(c,i){check(week+"carta:"+i,!!S.week.cardDone[i])});
}
function renderAvatar(){
 var current=avatarCurrent(),unlocked=Math.floor(S.avatar.points/AVATAR_CLASS_POINTS);
 var equipped=S.avatar.equipped>=0&&S.avatar.equipped<unlocked?S.avatar.equipped:-1;
 var display=equipped>=0?equipped:current.index,stage=equipped>=0?7:current.stage;
 var set=avatarSet(display),training=avatarSet(current.index),panel=el("tab-armario");
 panel.style.setProperty("--class-accent",set.accent);panel.style.setProperty("--class-soft",set.soft);
 el("avatar-mini").innerHTML=avatarSprite(display,stage);
 el("open-avatar").setAttribute("aria-label","Abrir personagem: cachorrinho "+set.name.toLowerCase());
 el("open-avatar").style.setProperty("--class-accent",set.accent);
 el("avatar-art").innerHTML=avatarSprite(display,stage);
 el("avatar-art").setAttribute("aria-label","Cachorrinho "+set.name.toLowerCase()+", "+stage+" de 7 melhorias, destaque "+set.color);
 el("avatar-tier").textContent=stage===7?"Classe completa · "+set.color:"Em formação · "+set.color;
 el("avatar-status").textContent=stage===0&&display===0?"Pequeno aventureiro":set.name;
 el("avatar-count").textContent=S.avatar.marks+" "+(S.avatar.marks===1?"conquista":"conquistas");
 el("avatar-equipped-note").textContent=equipped>=0?"Conjunto do armário equipado.":"O visual acompanha suas novas conquistas.";
 el("avatar-training").textContent="Em evolução · "+training.name;
 var remaining=AVATAR_STEP-current.within,filled=current.stage===7?AVATAR_STEP:current.within;
 el("avatar-bar").style.width=(filled/AVATAR_STEP*100)+"%";
 var meter=el("avatar-meter");meter.setAttribute("aria-valuenow",String(filled));
 meter.setAttribute("aria-valuetext",current.stage===7?"Classe completa":filled+" de 8 conquistas para "+training.steps[current.stage]);
 el("avatar-next").textContent=current.stage===7?
   "Conjunto completo! Na próxima conquista começa a classe "+avatarSet(current.index+1).name+".":
   "Falta"+(remaining===1?"":"m")+" "+remaining+" conquista"+(remaining===1?"":"s")+" para: "+training.steps[current.stage]+".";
 el("avatar-steps").innerHTML=training.steps.map(function(name,i){return '<li class="'+(i<current.stage?'earned':i===current.stage?'next':'')+'"><span aria-hidden="true">'+(i<current.stage?'✓':i+1)+'</span>'+esc(name)+(i<current.stage?'<span class="sr-only"> conquistada</span>':'')+'</li>'}).join("");
 el("avatar-roadmap").innerHTML=AVATAR_CLASSES.map(function(c,i){return '<span'+(i===current.index%3?' aria-current="step"':'')+'>'+c.name+'</span>'}).join('<i aria-hidden="true">→</i>');
 var host=el("wardrobe");host.innerHTML="";
 function item(index,itemStage,label,selected,value){
   var chosen=avatarSet(index),b=document.createElement("button");b.type="button";
   b.style.setProperty("--item-accent",chosen.accent);b.style.setProperty("--item-soft",chosen.soft);
   b.setAttribute("aria-pressed",selected?"true":"false");b.dataset.equip=String(value);
   b.setAttribute("aria-label",value<0?"Acompanhar evolução do personagem":"Equipar "+chosen.name);
   b.innerHTML=avatarSprite(index,itemStage)+'<b>'+esc(label)+'</b><small>'+(selected?'Em uso':value<0?'Acompanhar evolução':'Equipar conjunto')+'</small>';
   b.addEventListener("click",function(){S.avatar.equipped=value;save();renderAvatar()});host.appendChild(b);
 }
 item(current.index,current.stage,"Jornada atual",equipped===-1,-1);
 for(var i=0;i<unlocked;i++)item(i,7,avatarSet(i).name,equipped===i,i);
 el("wardrobe-empty").hidden=unlocked>0;
}

function renderHead(){
 var r=rank(),nx=nextRank(),m=minLvl(),j=journeyIdx();
 el("rank-letter").textContent=r.r;
 el("c-lvl").textContent=ATTRS.reduce(function(s,x){return s+S.attrs[x.k].lvl},0);
 el("c-gold").textContent=S.gold;el("shop-gold").textContent=S.gold+" ouro";
 var st=el("c-streak");
 st.innerHTML="Sequência <b>"+S.streak+"</b> "+(S.streak===1?"dia":"dias");
 st.className="tally"+(S.streak>0?" hot":" off");
 el("arc").innerHTML=(S.week.n>12?"Pós-jornada · semana "+S.week.n+" · <b>"+esc(JOURNEY[11][0])+" (de novo)</b>"
   :"Semana "+S.week.n+" de 12 · <b>Recuperando o senso de "+esc(JOURNEY[j-1][0].toLowerCase())+"</b>");
 if(nx){var prog=Math.max(0,Math.min(1,(m-r.min)/(nx.min-r.min)));
  el("gate-txt").textContent="Rank "+nx.r+" — nível "+nx.min+" em todos";
  el("gate-bar").style.width=(prog*100).toFixed(1)+"%";
 }else{el("gate-txt").textContent="Rank máximo";el("gate-bar").style.width="100%"}
 el("today-str").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
 el("daily-count").textContent=doneCount()+" / "+ATTRS.length;
 el("write-date").textContent=br(S.day.date);
 el("week-tag").textContent="semana "+S.week.n;
 el("journey-tag").textContent=Math.min(12,S.week.n)+" / 12";
 el("meal-tag").textContent=mealsFilled()+" / 5";
 var open=(S.week.n>=UNSEAL_WEEK||S.unsealed);
 el("arch-tag").textContent=open?"aberto":"selado até a semana "+UNSEAL_WEEK;
 el("seal-note").hidden=open;
 el("big-tag").textContent=cardsDone()+" de 3";
 el("dish-tag").textContent=S.week.dishDone?"feito":(S.week.dishPicked?"escolhido":"em aberto");
}

function renderCards(){
 S.week.cards.forEach(function(c){if(c.t==="Uma caminhada de 30 minutos sem fone, três vezes na semana.")c.t="Uma caminhada de 30 minutos, três vezes na semana."});
 var host=el("cards");host.innerHTML="";
 S.week.cards.forEach(function(c,i){
  var done=!!S.week.cardDone[i],pool=POOLS[c.a];
  var d=document.createElement("div");d.className="card"+(done?" done":"");
  d.innerHTML='<div class="ang">'+pool.n+'</div><div class="t">'+esc(c.t)+'</div>'+
   '<input class="pl" maxlength="90" placeholder="como você vai fazer?" value="'+esc(S.week.cardPlan[i]||"")+'" aria-label="Plano para a carta '+(i+1)+'">'+
   '<div class="foot"><span class="pay">+'+CARD_XP+' '+pool.n.toLowerCase()+' · +'+CARD_GOLD+' ouro</span>'+
   '<button class="mark"'+(BOOTED?"":" disabled")+' aria-pressed="'+(done?"true":"false")+'" aria-label="Cumpri: '+esc(c.t)+'">'+
   '<svg viewBox="0 0 24 24"><polyline points="4,12.5 9.5,18 20,6"></polyline></svg></button></div>';
  d.querySelector(".mark").addEventListener("click",function(){toggleCard(i)});
  var pl=d.querySelector(".pl");
  pl.addEventListener("input",function(){S.week.cardPlan[i]=pl.value;clearTimeout(fieldTimer);fieldTimer=setTimeout(save,900)});
  host.appendChild(d);
 });
}

function renderAttrs(){
 var host=el("attrs");host.innerHTML="";
 ATTRS.forEach(function(x){
  var a=S.attrs[x.k],pct=Math.max(0,Math.min(100,a.xp/need(a.lvl)*100)),ex=S.day.extra[x.k]||0;
  var row=document.createElement("div");row.className="attr";
  row.innerHTML='<div class="ico">'+icon(x.i)+'</div>'+
   '<div class="attr-main">'+
     '<div class="attr-name"><h3>'+x.n+'</h3><span>'+x.d+'</span></div>'+
     '<input class="qtext" value="'+esc(a.quest)+'" maxlength="90" aria-label="Missão de '+x.n+'">'+
     '<div class="meter"><div class="lv">'+a.lvl+'<span>nível</span></div>'+
     '<div class="bar"><i style="width:'+pct.toFixed(1)+'%"></i></div>'+
     '<div class="xp">'+a.xp+'/'+need(a.lvl)+' xp</div></div>'+
   '</div>'+
   '<div class="attr-side">'+
     '<button class="mark"'+(BOOTED?"":" disabled")+' aria-pressed="'+(S.day.done[x.k]?"true":"false")+'" aria-label="Cumpri a missão de '+x.n+'">'+
       '<svg viewBox="0 0 24 24"><polyline points="4,12.5 9.5,18 20,6"></polyline></svg></button>'+
     '<div class="extra"><span class="el">extra</span>'+
       [0,1,2].map(function(i){var on=i<ex;
         return '<button class="'+(on?"on":"")+'" data-i="'+i+'" aria-pressed="'+(on?"true":"false")+'"'+
         ' title="'+(on?"Clique para tirar":"Clique para marcar (+"+XP_EXTRA+" XP)")+'"'+
         ' aria-label="Extra '+(i+1)+' de 3 em '+x.n+'"></button>'}).join("")+
     '</div>'+
   '</div>';
  row.querySelector(".mark").addEventListener("click",function(){toggle(x.k)});
  Array.prototype.forEach.call(row.querySelectorAll(".extra button"),function(b){
   b.addEventListener("click",function(){setExtra(x.k,+b.dataset.i)})});
  var qi=row.querySelector(".qtext");
  qi.addEventListener("change",function(){a.quest=qi.value.trim()||x.q;qi.value=a.quest;save()});
  qi.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();qi.blur()}});
  host.appendChild(row);
 });
}

function renderBonus(){
 var host=el("bonus");host.innerHTML="";
 BONUS.forEach(function(b){
  var on=!!S.day.bonus[b.k];
  var row=document.createElement("div");row.className="block";
  var pickHtml="";
  if(b.pick){pickHtml='<div class="seg" role="group" aria-label="Tipo de leitura">'+
    b.pick.map(function(p){return '<button data-a="'+p[0]+'" aria-pressed="'+(S.day.readAttr===p[0]?"true":"false")+'">'+p[1]+'</button>'}).join("")+'</div>'}
  row.innerHTML='<div class="ico">'+icon(b.i)+'</div>'+
   '<div><h3>'+b.n+'</h3><p>'+b.p+'</p><span class="pay">'+b.pay+'</span>'+pickHtml+
   '<input class="field" placeholder="'+b.note+'" maxlength="120" value="'+esc(S.day.bonusNote[b.k]||"")+'"></div>'+
   '<button class="mark"'+(BOOTED?"":" disabled")+' aria-pressed="'+(on?"true":"false")+'" aria-label="Marcar: '+b.n+'">'+
   '<svg viewBox="0 0 24 24"><polyline points="4,12.5 9.5,18 20,6"></polyline></svg></button>';
  row.querySelector(".mark").addEventListener("click",function(){toggleBonus(b)});
  var f=row.querySelector(".field");
  f.addEventListener("input",function(){S.day.bonusNote[b.k]=f.value;clearTimeout(fieldTimer);fieldTimer=setTimeout(save,900)});
  Array.prototype.forEach.call(row.querySelectorAll(".seg button"),function(sb){
   sb.addEventListener("click",function(){
    if(S.day.bonus[b.k]){toast("Desmarque primeiro","Você já registrou a leitura de hoje. Tire o visto pra trocar o tipo.");return}
    S.day.readAttr=sb.dataset.a;save();renderBonus()})});
  host.appendChild(row);
 });
}

function renderWeek(){
 el("ad-check").setAttribute("aria-pressed",S.week.ad?"true":"false");
 el("ci-check").setAttribute("aria-pressed",S.week.ciDone?"true":"false");
 if(document.activeElement!==el("ad-note"))el("ad-note").value=S.week.adNote||"";
 ["a","b","c"].forEach(function(k){var f=el("ci-"+k);if(document.activeElement!==f)f.value=S.week.ci[k]||""});
 el("ci-auto").textContent="— o sistema contou "+S.week.wrote+(S.week.wrote===1?" dia":" dias");
 el("dish-pick").setAttribute("aria-pressed",S.week.dishPicked?"true":"false");
 el("dish-do").setAttribute("aria-pressed",S.week.dishDone?"true":"false");
 if(document.activeElement!==el("dish-name"))el("dish-name").value=S.week.dish||"";
 var mh=el("meals");
 if(mh.querySelectorAll("input").length!==10){
  mh.innerHTML="";
  DAYS.forEach(function(d,i){
   var row=document.createElement("div");row.className="meal";
   row.innerHTML='<div class="d">'+d.slice(0,3)+'</div>'+
    '<label class="meal-field"><span>Refeição principal</span><input data-meal="'+i+'" maxlength="70" placeholder="o que você planejou" aria-label="Refeição principal de '+d+'"></label>'+
    '<label class="meal-field"><span>Lanche <small>(opcional)</small></span><input data-meal="'+(i+5)+'" maxlength="70" placeholder="o que você planejou" aria-label="Lanche de '+d+'"></label>';
   Array.prototype.forEach.call(row.querySelectorAll("input"),function(inp){
    inp.addEventListener("input",function(){S.week.meals[Number(inp.dataset.meal)]=inp.value;el("meal-tag").textContent=mealsFilled()+" / 5";
     clearTimeout(fieldTimer);fieldTimer=setTimeout(save,900)});
   });
   mh.appendChild(row);
  });
 }
 Array.prototype.forEach.call(mh.querySelectorAll("input"),function(inp){
  if(document.activeElement!==inp)inp.value=S.week.meals[Number(inp.dataset.meal)]||""});
 el("meal-save").disabled=S.week.mealsDone;
 el("meal-save").textContent=S.week.mealsDone?"Plano fechado":"Fechar o plano (+"+GOLD_MEAL+" ouro)";
 var host=el("weeks");host.innerHTML="";
 JOURNEY.forEach(function(w,i){
  var n=i+1,d=document.createElement("div");
  d.className="wk"+(n<S.week.n?" done":"")+(n===S.week.n?" now":"");
  d.innerHTML='<div class="num">Sem '+String(n).padStart(2,"0")+'</div>'+
   '<div><h3>'+esc(w[0])+'</h3><div class="ds">'+esc(w[1])+'</div></div>';
  host.appendChild(d);
 });
}

function renderShop(){
 var host=el("shop");host.innerHTML="";
 if(!S.shop.length)host.innerHTML='<p class="muted" style="margin:0">Nenhuma recompensa ainda.</p>';
 S.shop.forEach(function(r){
  var ok=S.gold>=r.cost,c=document.createElement("div");c.className="reward";
  c.innerHTML='<div class="rn">'+esc(r.name)+'</div>'+
   '<div class="rc"><svg viewBox="0 0 24 24"><use href="#i-gold"/></svg>'+r.cost+'</div>'+
   '<div class="rrow"><button class="btn'+(ok?" solid":"")+'"'+(ok?"":" disabled")+' style="flex:1">'+(ok?"Resgatar":"Falta "+(r.cost-S.gold))+'</button>'+
   '<button class="btn quiet" aria-label="Remover">✕</button></div>';
  var b=c.querySelectorAll("button");
  b[0].addEventListener("click",function(){buy(r)});
  b[1].addEventListener("click",function(){S.shop=S.shop.filter(function(z){return z.id!==r.id});save();renderShop()});
  host.appendChild(c);
 });
 var dh=el("deck");dh.innerHTML="";
 S.deck.forEach(function(c){
  var d=document.createElement("div");d.className="reward";
  d.innerHTML='<div class="rn" style="font-size:15px">'+esc(c.t)+'</div>'+
   '<div class="rrow"><button class="btn quiet" style="margin-left:auto" aria-label="Descartar">✕</button></div>';
  d.querySelector("button").addEventListener("click",function(){
   if(S.deck.length<=1){toast("Última carta","Deixe pelo menos uma no baralho.");return}
   S.deck=S.deck.filter(function(z){return z.id!==c.id});save();renderShop()});
  dh.appendChild(d);
 });
}

function renderLog(){
 var host=el("heat");host.innerHTML="";
 var t=today(),full=0;
 for(var i=0;i<90;i++){
  var d=shift(t,-i),v=(d===t)?(doneCount()||0):S.history[d],u=document.createElement("u");
  u.title=br(d)+(v==="x"?" · penalidade":v==="f"?" · folga":(v?" · "+v+"/5":" · sem registro"));
  if(v==="x")u.setAttribute("data-v","x");
  else if(v==="f")u.setAttribute("data-v","f");
  else if(v){u.setAttribute("data-v",String(Math.min(5,v)));if(v>=5)full++}
  host.appendChild(u);
 }
 el("log-tag").textContent=full+" dias cheios · melhor sequência "+S.best;
 var L=el("ledger");
 if(!S.purchases.length){L.innerHTML='<p class="muted" style="margin:0">Nenhum resgate ainda.</p>';return}
 L.innerHTML="";
 S.purchases.slice(0,20).forEach(function(p){
  var d=document.createElement("div");
  d.innerHTML='<time>'+br(p.date)+'</time><span>'+esc(p.name)+'</span><b>−'+p.cost+'</b>';
  L.appendChild(d);
 });
}

function renderPad(){
 var p=el("pad");if(document.activeElement!==p)p.value=S.day.text||"";
 el("wgoal").value=S.goal;updateWc();
 el("write-live").hidden=!!S.day.closed;
 el("write-done").hidden=!S.day.closed;
}
function updateWc(){
 var w=words(el("pad").value),g=S.goal,wc=el("wc");
 wc.innerHTML="<b>"+w+"</b> / "+g+" palavras";wc.className="wc"+(w>=g?" hit":"");
 el("wbar").style.width=Math.min(100,w/g*100).toFixed(1)+"%";
}
function renderAll(){renderHead();renderCards();renderAttrs();renderBonus();renderWeek();renderShop();renderLog();renderPad();renderAvatar();
 if(window.__penReady)setMode(S.writeMode)}

/* ===== ações ===== */
function toggle(k){
 if(!BOOTED)return;
 if(!S.day.done[k]){
  S.day.done[k]=true;S.attrs[k].last=today();addXp(k,XP_QUEST);S.gold+=GOLD_QUEST;addAvatarMark("dia:"+S.day.date+":"+k);
  if(k==="men")S.week.wrote++;
  toast("Missão cumprida","+"+XP_QUEST+" XP em "+attrOf(k).n.toLowerCase()+" e +"+GOLD_QUEST+" ouro.");
  if(doneCount()===ATTRS.length&&!S.day.counted){S.day.counted=true;S.gold+=GOLD_ALL;
   toast("Dia completo","As cinco. Bônus de +"+GOLD_ALL+" ouro.")}
 }else{
  delete S.day.done[k];removeAvatarMark("dia:"+S.day.date+":"+k);addXp(k,-XP_QUEST);S.gold=Math.max(0,S.gold-GOLD_QUEST);
  if(k==="men")S.week.wrote=Math.max(0,S.week.wrote-1);
  if(S.day.counted){S.day.counted=false;S.gold=Math.max(0,S.gold-GOLD_ALL)}
 }
 save();renderHead();renderAttrs();renderWeek();renderLog();renderAvatar();
}
function setExtra(k,i){
 if(!BOOTED)return;
 var cur=S.day.extra[k]||0,next=(i<cur)?i:i+1,delta=next-cur;
 if(!delta)return;
 S.day.extra[k]=next;addXp(k,delta*XP_EXTRA);
 if(delta>0)for(var e=cur;e<next;e++)addAvatarMark("extra:"+S.day.date+":"+k+":"+e);
 else for(var e=next;e<cur;e++)removeAvatarMark("extra:"+S.day.date+":"+k+":"+e);
 if(delta>0){S.attrs[k].last=today();toast("Extra marcado","+"+(delta*XP_EXTRA)+" XP em "+attrOf(k).n.toLowerCase()+".")}
 save();renderHead();renderAttrs();renderAvatar();
}
function toggleBonus(b){
 if(!BOOTED)return;
 var xp=b.xp||{};if(b.pick){xp={};xp[S.day.readAttr]=b.pickXp}
 if(!S.day.bonus[b.k]){
  S.day.bonus[b.k]=true;addAvatarMark("bonus:"+S.day.date+":"+b.k);
  Object.keys(xp).forEach(function(k){S.attrs[k].last=today();addXp(k,xp[k])});
  S.gold+=b.gold;
  toast(b.n,Object.keys(xp).map(function(k){return "+"+xp[k]+" "+attrOf(k).n.toLowerCase()}).join(", ")+" e +"+b.gold+" ouro.");
 }else{
  delete S.day.bonus[b.k];removeAvatarMark("bonus:"+S.day.date+":"+b.k);
  Object.keys(xp).forEach(function(k){addXp(k,-xp[k])});
  S.gold=Math.max(0,S.gold-b.gold);
 }
 save();renderHead();renderAttrs();renderBonus();renderAvatar();
}
function toggleAD(){
 if(!BOOTED)return;
 if(!S.week.ad){S.week.ad=true;S.attrs.vin.last=today();addXp("vin",XP_AD);S.gold+=GOLD_AD;addAvatarMark("semana:"+S.week.n+":encontro");
  toast("Encontro cumprido","+"+XP_AD+" XP em vínculo e +"+GOLD_AD+" ouro.")}
 else{S.week.ad=false;removeAvatarMark("semana:"+S.week.n+":encontro");addXp("vin",-XP_AD);S.gold=Math.max(0,S.gold-GOLD_AD)}
 save();renderHead();renderAttrs();renderWeek();renderAvatar();
}
function toggleCI(){
 if(!BOOTED)return;
 if(!S.week.ciDone){S.week.ciDone=true;S.attrs.men.last=today();addXp("men",XP_CI);S.gold+=GOLD_CI;addAvatarMark("semana:"+S.week.n+":checagem");
  toast("Checagem registrada","+"+XP_CI+" XP em mente e +"+GOLD_CI+" ouro.")}
 else{S.week.ciDone=false;removeAvatarMark("semana:"+S.week.n+":checagem");addXp("men",-XP_CI);S.gold=Math.max(0,S.gold-GOLD_CI)}
 save();renderHead();renderAttrs();renderWeek();renderAvatar();
}
function toggleCard(i){
 if(!BOOTED)return;
 var c=S.week.cards[i],pool=POOLS[c.a],before=cardsDone();
 if(!S.week.cardDone[i]){
  S.week.cardDone[i]=true;S.attrs[pool.attr].last=today();addAvatarMark("semana:"+S.week.n+":carta:"+i);
  addXp(pool.attr,CARD_XP);S.gold+=CARD_GOLD;
  var n=cardsDone(),extra=0;
  if(n===2)extra=BONUS_2; if(n===3)extra=BONUS_3-BONUS_2;
  if(extra){S.gold+=extra;toast(n===3?"As três":"Duas cartas","Bônus de +"+extra+" ouro por acumular.")}
  else toast("Carta cumprida","+"+CARD_XP+" XP em "+pool.n.toLowerCase()+" e +"+CARD_GOLD+" ouro.");
  save();renderHead();renderAttrs();renderCards();renderAvatar();
  if(!S.week.prized){S.week.prized=true;save();setTimeout(drawPrize,400)}
 }else{
  var was=cardsDone();
  delete S.week.cardDone[i];removeAvatarMark("semana:"+S.week.n+":carta:"+i);addXp(pool.attr,-CARD_XP);S.gold=Math.max(0,S.gold-CARD_GOLD);
  if(was===3)S.gold=Math.max(0,S.gold-(BONUS_3-BONUS_2));
  if(was===2)S.gold=Math.max(0,S.gold-BONUS_2);
  save();renderHead();renderAttrs();renderCards();renderAvatar();
 }
}
function drawPrize(){
 var c=S.deck[Math.floor(Math.random()*S.deck.length)];
 var scrim=document.createElement("div");scrim.className="scrim";
 scrim.innerHTML='<div class="card-prize" role="alertdialog"><div class="lab">Sua recompensa</div>'+
  '<h3>'+esc(c.t)+'</h3><p>Cumprir uma carta já libera o prêmio. As outras duas continuam valendo ouro.</p>'+
  '<button class="btn solid">Aceito</button></div>';
 document.body.appendChild(scrim);
 var b=scrim.querySelector("button");b.addEventListener("click",function(){scrim.remove()});b.focus();
}
function toggleDishPick(){
 if(!BOOTED)return;
 if(!S.week.dishPicked){
  if(!S.week.dish||!S.week.dish.trim()){toast("Escreva o prato","Diga qual vai ser antes de marcar.");return}
  S.week.dishPicked=true;S.gold+=GOLD_DISH_PICK;addAvatarMark("semana:"+S.week.n+":prato-escolhido");
  toast("Prato escolhido","+"+GOLD_DISH_PICK+" ouro. Metade do trabalho é decidir.");
 }else{S.week.dishPicked=false;removeAvatarMark("semana:"+S.week.n+":prato-escolhido");S.gold=Math.max(0,S.gold-GOLD_DISH_PICK)}
 save();renderHead();renderWeek();renderAvatar();
}
function toggleDishDo(){
 if(!BOOTED)return;
 if(!S.week.dishDone){
  if(!S.week.dishPicked){toast("Escolha primeiro","Marque a escolha antes de marcar que fez.");return}
  S.week.dishDone=true;S.attrs.vit.last=today();S.attrs.per.last=today();addAvatarMark("semana:"+S.week.n+":prato-feito");
  addXp("vit",8);addXp("per",5);S.gold+=GOLD_DISH_DO;
  toast("Prato feito","+8 vitalidade, +5 percepção e +"+GOLD_DISH_DO+" ouro.");
 }else{S.week.dishDone=false;removeAvatarMark("semana:"+S.week.n+":prato-feito");addXp("vit",-8);addXp("per",-5);S.gold=Math.max(0,S.gold-GOLD_DISH_DO)}
 save();renderHead();renderAttrs();renderWeek();renderAvatar();
}
function saveMeals(){
 if(S.week.mealsDone)return;
 if(mealsFilled()<5){toast("Falta refeição principal","Preencha as cinco refeições principais antes de fechar o plano. Os lanches são opcionais.");return}
 S.week.mealsDone=true;S.gold+=GOLD_MEAL;addAvatarMark("semana:"+S.week.n+":plano-refeicoes");
 toast("Plano fechado","+"+GOLD_MEAL+" ouro. Agora é só cumprir.");
 save();renderHead();renderWeek();renderShop();renderAvatar();
}
function buy(r){
 if(S.gold<r.cost)return;
 S.gold-=r.cost;S.purchases.unshift({date:today(),name:r.name,cost:r.cost});S.purchases=S.purchases.slice(0,40);
 toast("Resgatado",r.name+" — "+r.cost+" de ouro fora da conta. Vai lá.");
 save();renderHead();renderShop();renderLog();
}
function closeWriting(){
 var w=words(S.day.text),pen=(S.writeMode==="pen");
 if(!pen&&w<40){toast("Pouca coisa","Escreve mais um pouco antes de fechar.");return}
 S.day.closed=true;
 if(!S.day.done.men)toggle("men");
 if(S.day.text&&S.day.text.trim())archiveDay({date:S.day.date,text:S.day.text,words:w,week:S.week.n});
 if(pen)PEN.flush();
 el("write-done-sub").textContent=pen
  ? "Arquivado à mão. Amanhã tem folha nova."
  : w+" palavras arquivadas. Amanhã tem folha nova.";
 save();renderPad();renderHead();
}

function toast(title,body){
 var t=document.createElement("div");t.className="toast";
 t.innerHTML="<b>"+esc(title)+"</b>"+body;
 el("toasts").appendChild(t);
 setTimeout(function(){t.style.transition="opacity .4s,transform .4s";t.style.opacity="0";t.style.transform="translateY(10px)";
  setTimeout(function(){t.remove()},420)},3600);
}
function penaltyAlert(rep){
 var items=Object.keys(rep.losses).filter(function(k){return rep.losses[k]>0});
 if(!items.length&&!rep.folga)return;
 if(!items.length){toast("Folga usada","Um dia da semana passada saiu de graça. Sem penalidade.");return}
 var ex=(rep.folga?" Um dia saiu de graça pela folga da semana.":"");
 var scrim=document.createElement("div");scrim.className="scrim";
 scrim.innerHTML='<div class="alert" role="alertdialog"><h3>O Censor avançou</h3>'+
  '<p>'+(rep.days?"Nenhuma missão diária foi concluída em "+rep.days+(rep.days===1?" dia":" dias")+".":"Nenhuma missão diária foi concluída.")+
  (rep.broke?" A sequência foi zerada.":"")+esc(ex)+'</p>'+
  '<ul>'+items.map(function(k){return "<li>"+attrOf(k).n+" <b>−"+rep.losses[k]+" XP</b></li>"}).join("")+'</ul>'+
  '<div class="quote">“As opiniões negativas do seu Censor não são a verdade.” O placar é. Volte amanhã de manhã.</div>'+
  '<button class="btn">Aceitar</button></div>';
 document.body.appendChild(scrim);
 var b=scrim.querySelector("button");b.addEventListener("click",function(){scrim.remove()});b.focus();
}

function loadEntries(){
 if(!CLOUD_USER)return;
 supabase.from("journal_entries").select("entry_date,mode,text_content,pen_pages,word_count").eq("user_id",CLOUD_USER.id).order("entry_date",{ascending:false}).limit(30).then(function(res){
  if(res.error)throw res.error;
  var host=el("entries"),sealed=!(S.week.n>=UNSEAL_WEEK||S.unsealed),any=false;host.innerHTML="";
  (res.data||[]).forEach(function(d){
   var pen=(d.mode==="pen"&&Array.isArray(d.pen_pages));if(!d.text_content&&!pen)return;any=true;
   var det=document.createElement("details");det.className="entry";
   var meta=pen?"à mão":((d.word_count||0)+" palavras");
   det.innerHTML='<summary><b>'+br(String(d.entry_date))+'</b><span>'+meta+(sealed?' · selado':'')+'</span></summary><div class="body"></div>';
   var body=det.querySelector(".body");
   if(sealed){body.innerHTML='<div class="sealed"><span>Selado até a Semana '+UNSEAL_WEEK+'.</span><button class="btn quiet">Quebrar o selo</button></div>';body.querySelector("button").addEventListener("click",function(){S.unsealed=true;save();renderHead();loadEntries();toast("Selo quebrado","O arquivo está aberto.")})}
   else if(pen)body.appendChild(replayCanvas(d.pen_pages||[]));
   else{var pp=document.createElement("p");pp.textContent=d.text_content;body.appendChild(pp)}
   host.appendChild(det);
  });
  if(!any)host.innerHTML='<p class="muted" style="margin:0">Nada arquivado ainda.</p>';
 }).catch(function(e){console.error("Falha ao carregar arquivo",e)});
}
/* ===== escrita à mão ===== */
var PEN=(function(){
 var VW=1000,VH=1350,FULL_LEN=15000,MAX_STROKES=900;
 var pages=[mk(),mk(),mk()],cur=0,cv=null,ctx=null,dpr=1,cssW=0,
     drawing=false,active=null,live=null,penSeen=false,dirty=false,tmr=null,myDate=today(),
     gotPointer=false,lastKind="nenhuma ainda";
 function mk(){return {st:[],man:false}}
 function len(p){var s=0;for(var i=2;i<p.length;i+=2)s+=Math.abs(p[i]-p[i-2])+Math.abs(p[i+1]-p[i-1]);return s}
 function pageLen(pg){var s=0;for(var i=0;i<pg.st.length;i++)s+=len(pg.st[i].p);return s}
 function isFull(pg){return pg.man||pageLen(pg)>=FULL_LEN}
 function fullCount(){var n=0;pages.forEach(function(p){if(isFull(p))n++});return n}
 function hasInk(){return pages.some(function(p){return p.st.length>0})}
 function lsKey(){return "etr.pen."+myDate}
 function saveLocal(){try{localStorage.setItem(lsKey(),JSON.stringify(pages))}catch(e){}}
 function loadLocal(){try{var r=localStorage.getItem(lsKey());if(r){var v=JSON.parse(r);if(Array.isArray(v)&&v.length===3)pages=v}}catch(e){}}
 function flush(){
  if(!dirty)return;dirty=false;saveLocal();
  var s=el("p-saved");if(s)s.textContent="salvo";
  if(CLOUD_USER)supabase.from("journal_entries").upsert({user_id:CLOUD_USER.id,entry_date:myDate,week_number:S.week.n,mode:"pen",pen_pages:pages,word_count:0,closed:S.day.closed},{onConflict:"user_id,entry_date"}).then(function(r){if(r.error)console.error(r.error)});
 }
 function touch(){dirty=true;var s=el("p-saved");if(s)s.textContent="salvando…";clearTimeout(tmr);tmr=setTimeout(flush,1400)}
 function stat(){var s=el("p-stat");if(!s)return;
  s.textContent="folha: "+(cssW?Math.round(cssW)+"×"+Math.round(cssW*VH/VW):"—")+" · entrada: "+lastKind+" · traços nesta página: "+pages[cur].st.length}
 var fitTries=0;
 function fit(){
  if(!cv)return;var w=cv.parentNode.clientWidth;
  if(!w){if(fitTries++<40)setTimeout(fit,120);return}
  fitTries=0;cssW=w;dpr=Math.min(window.devicePixelRatio||1,2.5);
  cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssW*(VH/VW)*dpr);
  cv.style.height=Math.round(cssW*(VH/VW))+"px";redraw();stat();
 }
 function sx(x){return x/VW*cv.width}
 function line(st){
  var p=st.p;if(p.length<2)return;
  ctx.lineWidth=Math.max(1,st.w*dpr*(cssW/380));
  ctx.beginPath();
  if(p.length===2){ctx.arc(sx(p[0]),sx(p[1]),ctx.lineWidth/2,0,6.284);ctx.fillStyle="#16120E";ctx.fill();return}
  ctx.moveTo(sx(p[0]),sx(p[1]));
  for(var i=2;i<p.length-2;i+=2)ctx.quadraticCurveTo(sx(p[i]),sx(p[i+1]),sx((p[i]+p[i+2])/2),sx((p[i+1]+p[i+3])/2));
  ctx.lineTo(sx(p[p.length-2]),sx(p[p.length-1]));ctx.stroke();
 }
 function redraw(){
  if(!ctx)return;ctx.clearRect(0,0,cv.width,cv.height);
  ctx.strokeStyle="#16120E";ctx.lineCap="round";ctx.lineJoin="round";
  pages[cur].st.forEach(line);if(live)line(live);
 }
 function pt(e){var r=cv.getBoundingClientRect();
  return [Math.round((e.clientX-r.left)/r.width*VW),Math.round((e.clientY-r.top)/r.width*VW)]}
 function begin(x,y,pr,kind){
  lastKind=kind;if(!cssW)fit();
  if(pages[cur].st.length>=MAX_STROKES){toast("Página cheia","Vá para a próxima.");return false}
  drawing=true;live={w:1.1+pr*2.6,p:[x,y]};redraw();stat();return true;
 }
 function extend(x,y){
  if(!drawing||!live)return;var p=live.p,n=p.length;
  if(n>=2&&Math.abs(x-p[n-2])+Math.abs(y-p[n-1])<3)return;
  p.push(x,y);if(p.length>3000){finish();begin(x,y,.5,lastKind);return}redraw();
 }
 function finish(){
  if(!drawing)return;drawing=false;active=null;
  if(live&&live.p.length>=2){live.w=Math.round(live.w*10)/10;pages[cur].st.push(live)}
  live=null;redraw();stat();touch();sync();
 }
 function down(e){
  gotPointer=true;if(e.pointerType==="pen")penSeen=true;
  var only=el("p-only")&&el("p-only").checked;
  if(only&&penSeen&&e.pointerType!=="pen")return;
  active=e.pointerId;try{cv.setPointerCapture(e.pointerId)}catch(_){}
  var c=pt(e),pr=(e.pressure>0&&e.pressure<1)?e.pressure:0.5;
  if(begin(c[0],c[1],pr,e.pointerType==="pen"?"caneta":(e.pointerType==="touch"?"dedo":"mouse")))
   if(e.cancelable)e.preventDefault();
 }
 function move(e){
  if(!drawing)return;if(active!=null&&e.pointerId!==active)return;
  if(e.cancelable)e.preventDefault();
  if(e.getCoalescedEvents){var ev=e.getCoalescedEvents();
   if(ev&&ev.length>1){for(var i=0;i<ev.length;i++){var q=pt(ev[i]);extend(q[0],q[1])}return}}
  var c=pt(e);extend(c[0],c[1]);
 }
 function up(e){if(e&&e.cancelable)e.preventDefault();finish()}
 function tp(t){var r=cv.getBoundingClientRect();
  return [Math.round((t.clientX-r.left)/r.width*VW),Math.round((t.clientY-r.top)/r.width*VW)]}
 function tdown(e){
  if(gotPointer)return;var t=e.changedTouches[0],sty=(t.touchType==="stylus");
  if(sty)penSeen=true;
  var only=el("p-only")&&el("p-only").checked;
  if(only&&penSeen&&!sty)return;
  var c=tp(t);if(begin(c[0],c[1],t.force>0?t.force:0.5,sty?"caneta (toque)":"dedo (toque)"))e.preventDefault();
 }
 function tmove(e){if(gotPointer||!drawing)return;e.preventDefault();
  var ts=e.changedTouches;for(var i=0;i<ts.length;i++){var c=tp(ts[i]);extend(c[0],c[1])}}
 function tup(e){if(gotPointer)return;e.preventDefault();finish()}
 function sync(){
  renderDots();
  if(fullCount()>=3&&!S.day.done.men){toggle("men");toast("Três páginas","Feito. A missão de Mente fechou.")}
  else save();
 }
 function renderDots(){
  var h=el("pagedots");if(!h)return;h.innerHTML="";
  for(var i=0;i<3;i++){(function(i){
   var b=document.createElement("button");b.textContent=String(i+1);
   if(isFull(pages[i]))b.className="filled";
   if(i===cur)b.setAttribute("aria-current","true");
   b.setAttribute("aria-label","Página "+(i+1));
   b.addEventListener("click",function(){cur=i;redraw();renderDots();stat()});
   h.appendChild(b)})(i)}
  var mb=document.createElement("button");mb.textContent="✓";mb.title="Marcar esta página como cheia";
  mb.setAttribute("aria-label","Marcar página como cheia");
  mb.addEventListener("click",function(){pages[cur].man=!pages[cur].man;touch();sync()});
  h.appendChild(mb);
 }
 function init(){
  cv=el("sheet");if(!cv)return;ctx=cv.getContext("2d");loadLocal();
  try{var cut=shift(today(),-7);
   for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);
    if(k&&k.indexOf("etr.pen.")===0&&k.slice(8)<cut)localStorage.removeItem(k)}}catch(e){}
  cv.style.touchAction="none";
  cv.addEventListener("pointerdown",down,{passive:false});
  cv.addEventListener("pointermove",move,{passive:false});
  cv.addEventListener("pointerup",up,{passive:false});
  cv.addEventListener("pointercancel",up,{passive:false});
  window.addEventListener("pointerup",function(){finish()});
  cv.addEventListener("touchstart",tdown,{passive:false});
  cv.addEventListener("touchmove",tmove,{passive:false});
  cv.addEventListener("touchend",tup,{passive:false});
  cv.addEventListener("touchcancel",tup,{passive:false});
  el("p-undo").addEventListener("click",function(){pages[cur].st.pop();redraw();stat();touch();sync()});
  el("p-clear").addEventListener("click",function(){pages[cur]=mk();redraw();stat();touch();sync()});
  window.addEventListener("resize",function(){clearTimeout(window.__pf);window.__pf=setTimeout(fit,160)});
  window.addEventListener("orientationchange",function(){setTimeout(fit,300)});
  if(window.ResizeObserver){try{new ResizeObserver(function(){fit()}).observe(cv.parentNode)}catch(_){}}
  renderDots();stat();
 }
 return {init:init,fit:fit,flush:flush,hasInk:hasInk,
  adopt:function(p){if(Array.isArray(p)&&p.length===3){pages=p;saveLocal();redraw();renderDots()}}};
})();

function setMode(m){
 S.writeMode=(m==="pen")?"pen":"key";
 el("m-key").setAttribute("aria-pressed",S.writeMode==="key"?"true":"false");
 el("m-pen").setAttribute("aria-pressed",S.writeMode==="pen"?"true":"false");
 el("mode-key").hidden=(S.writeMode!=="key");
 el("mode-pen").hidden=(S.writeMode!=="pen");
 if(S.writeMode==="pen")requestAnimationFrame(PEN.fit);
 if(BOOTED)save();
}
function replayCanvas(pages){
 var box=document.createElement("div");box.className="replay";
 var c=document.createElement("canvas"),W=520,H=Math.round(520*1.35);
 c.width=W*2;c.height=H*2;c.style.height=H+"px";
 var x=c.getContext("2d");x.fillStyle="#FBF8F3";x.fillRect(0,0,c.width,c.height);
 x.strokeStyle="#16120E";x.lineCap="round";x.lineJoin="round";
 pages.forEach(function(pg){(pg.st||[]).forEach(function(s){
  var p=s.p;if(!p||p.length<2)return;
  x.lineWidth=Math.max(1,(s.w||1.6)*2*(W/380));
  x.beginPath();x.moveTo(p[0]/1000*c.width,p[1]/1000*c.width);
  for(var i=2;i<p.length;i+=2)x.lineTo(p[i]/1000*c.width,p[i+1]/1000*c.width);
  x.stroke()})});
 box.appendChild(c);return box;
}

/* ===== tabs e inputs ===== */
var TABS=["hoje","semana","escrita","loja","armario","registro"];
el("open-avatar").addEventListener("click",function(){
 document.querySelector('[data-tab="armario"]').click();
 el("tab-armario").scrollIntoView({behavior:"smooth",block:"start"});
 el("avatar-heading").focus({preventScroll:true});
});
Array.prototype.forEach.call(document.querySelectorAll('[role="tab"]'),function(btn){
 btn.addEventListener("click",function(){
  Array.prototype.forEach.call(document.querySelectorAll('[role="tab"]'),function(b){b.setAttribute("aria-selected",b===btn?"true":"false")});
  TABS.forEach(function(t){el("tab-"+t).hidden=(t!==btn.dataset.tab)});
  el("open-avatar").setAttribute("aria-expanded",btn.dataset.tab==="armario"?"true":"false");
  if(btn.dataset.tab==="escrita"){loadEntries();if(S.writeMode==="pen")requestAnimationFrame(PEN.fit)}
  try{localStorage.setItem("etr.tab",btn.dataset.tab)}catch(e){}
 });
});
el("pad").addEventListener("input",function(){
 S.day.text=el("pad").value;updateWc();el("saved").textContent="salvando…";
 clearTimeout(padTimer);
 padTimer=setTimeout(function(){save();el("saved").textContent="salvo"},1200);
});
el("wgoal").addEventListener("change",function(){
 var v=Math.max(100,Math.min(2000,+el("wgoal").value||750));S.goal=v;el("wgoal").value=v;updateWc();save()});
function bindField(id,setter){
 el(id).addEventListener("input",function(){setter(el(id).value);clearTimeout(fieldTimer);fieldTimer=setTimeout(save,900)})}
bindField("ad-note",function(v){S.week.adNote=v});
bindField("ci-a",function(v){S.week.ci.a=v});
bindField("ci-b",function(v){S.week.ci.b=v});
bindField("ci-c",function(v){S.week.ci.c=v});
bindField("dish-name",function(v){S.week.dish=v});
el("dish-pick").addEventListener("click",toggleDishPick);
el("dish-do").addEventListener("click",toggleDishDo);
el("ad-check").addEventListener("click",toggleAD);
el("ci-check").addEventListener("click",toggleCI);
el("meal-save").addEventListener("click",saveMeals);
el("m-key").addEventListener("click",function(){setMode("key")});
el("m-pen").addEventListener("click",function(){setMode("pen")});
el("write-close").addEventListener("click",closeWriting);
el("write-reopen").addEventListener("click",function(){S.day.closed=false;save();renderPad()});
el("r-add").addEventListener("click",function(){
 var n=el("r-name").value.trim(),c=Math.max(10,Math.min(9999,+el("r-cost").value||0));
 if(!n||!c)return;
 S.shop.push({id:"r"+Date.now(),name:n,cost:c});el("r-name").value="";el("r-cost").value="";save();renderShop()});
el("d-add").addEventListener("click",function(){
 var n=el("d-name").value.trim();if(!n)return;
 S.deck.push({id:"d"+Date.now(),t:n});el("d-name").value="";save();renderShop()});
el("r-name").addEventListener("keydown",function(e){if(e.key==="Enter")el("r-add").click()});
el("r-cost").addEventListener("keydown",function(e){if(e.key==="Enter")el("r-add").click()});
el("d-name").addEventListener("keydown",function(e){if(e.key==="Enter")el("d-add").click()});

/* ===== boot ===== */
function afterLoad(){
 BOOTED=true;
 var out=settle();
 if(out){if(out.archive)archiveDay(out.archive);save();setTimeout(function(){penaltyAlert(out.report)},500)}
 renderAll();
}
var loc=localLoad();if(loc)merge(loc);
PEN.init();window.__penReady=true;
renderAll();
window.addEventListener("beforeunload",function(){PEN.flush()});
try{var tb=localStorage.getItem("etr.tab");if(tb){var b=document.querySelector('[data-tab="'+tb+'"]');if(b)b.click()}}catch(e){}

async function loadCloud(user){
 CLOUD_USER=user;
 var uid=user.id,t=today();
 var results=await Promise.all([
  supabase.from("profiles").select("*").eq("user_id",uid).maybeSingle(),
  supabase.from("daily_entries").select("*").eq("user_id",uid).order("entry_date",{ascending:false}).limit(1).maybeSingle(),
  supabase.from("journal_entries").select("*").eq("user_id",uid).order("entry_date",{ascending:false}).limit(1).maybeSingle(),
  supabase.from("weekly_entries").select("*").eq("user_id",uid).order("week_number",{ascending:false}).limit(1).maybeSingle(),
  supabase.from("user_progress").select("*").eq("user_id",uid).maybeSingle(),
  supabase.from("purchases").select("*").eq("user_id",uid).order("purchased_at",{ascending:false}).limit(40),
  supabase.from("daily_entries").select("entry_date,day_status,done").eq("user_id",uid).gte("entry_date",shift(t,-120)).order("entry_date",{ascending:true})
 ]);
 var failed=results.find(function(x){return x.error});if(failed)throw failed.error;
 var p=results[0].data,d=results[1].data,j=results[2].data,w=results[3].data,pr=results[4].data,buys=results[5].data||[],days=results[6].data||[];
 var remote=fresh();
 if(p){remote.start=p.journey_start||remote.start;remote.goal=p.word_goal||750;remote.writeMode=p.write_mode==="pen"?"pen":"key";var pref=p.preferences||{};if(Array.isArray(pref.shop))remote.shop=pref.shop;if(Array.isArray(pref.deck)&&pref.deck.length)remote.deck=pref.deck;remote.unsealed=!!pref.unsealed}
 if(pr){remote.attrs=pr.attrs||remote.attrs;remote.gold=pr.gold||0;remote.streak=pr.current_streak||0;remote.best=pr.best_streak||0;remote.avatar={v:3,marks:pr.avatar_marks||0,points:pr.avatar_points||0,seen:pr.avatar_seen||{},equipped:p?p.equipped_character:-1}}
 if(d){remote.day={date:d.entry_date,done:d.done||{},extra:d.extra||{},bonus:d.bonus||{},bonusNote:d.bonus_notes||{},readAttr:d.read_attr||"men",text:j&&j.text_content||"",counted:!!d.counted,closed:!!d.closed}}
 if(w){remote.week={n:w.week_number,ad:!!w.encounter_done,adNote:w.encounter_note||"",ci:w.checkin||{a:"",b:"",c:""},ciDone:!!w.checkin_done,wrote:w.wrote||0,cards:Array.isArray(w.cards)&&w.cards.length===3?w.cards:dealCards(w.week_number),cardPlan:w.card_plan||{},cardDone:w.card_done||{},prized:!!w.prize_drawn,dish:w.dish||"",dishPicked:!!w.dish_picked,dishDone:!!w.dish_done,meals:normalizeMeals(w.meals),mealsDone:!!w.meals_done,folga:!!w.free_day_used}}
 remote.purchases=buys.map(function(x){return {date:String(x.purchased_at).slice(0,10),name:x.reward_name,cost:x.gold_cost}});
 days.forEach(function(x){if(x.day_status==="free_day")remote.history[x.entry_date]="f";else if(x.day_status==="missed")remote.history[x.entry_date]="x";else{var n=0;ATTRS.forEach(function(a){if((x.done||{})[a.k])n++});remote.history[x.entry_date]=n||undefined}});
 if(!p&&loc){
  /* Primeira conexão: preserva o progresso que já existia neste navegador. */
  CLOUD_PURCHASES=0;CLOUD_BASE=null;await persistCloud();
 }else{
  merge(remote);
  if(j&&j.mode==="pen"&&Array.isArray(j.pen_pages)){S.writeMode="pen";PEN.adopt(j.pen_pages)}
  CLOUD_PURCHASES=S.purchases.length;CLOUD_BASE=cloudSnapshot();
  if(!p)await persistCloud();
 }
}
var authStarted=false;
async function startForSession(session){
 if(authStarted||!session||!session.user)return;authStarted=true;
 try{await loadCloud(session.user)}catch(e){console.error("Falha ao carregar Supabase",e)}
 afterLoad();loadEntries();
}
window.addEventListener("etr:auth",function(e){var s=e.detail&&e.detail.session;if(s)startForSession(s)});
if(window.ETR_USER)startForSession({user:window.ETR_USER});


})();
