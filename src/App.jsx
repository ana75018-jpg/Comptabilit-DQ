import { useState, useMemo, useRef, useEffect } from "react";

// ════════════════════════════════════════════════
// DAVIS QUARTZ — Application Complète v3
// Partie A (Semaine) + Partie B (toutes les pages)
// ════════════════════════════════════════════════

// ── Constantes ───────────────────────────────────
const PRICES={Charbon:{Stagiaire:1.7,Confirmé:2.1,Expérimenté:2.5},Fer:{Stagiaire:5.903,Confirmé:7.292,Expérimenté:8.6805},Cuivre:{Stagiaire:3.594,Confirmé:4.4396,Expérimenté:5.2855},Or:{Stagiaire:4.775,Confirmé:5.899,Expérimenté:7.0225},Aluminium:{Stagiaire:3.72,Confirmé:3.36,Expérimenté:4.0}};
const CAP={Stagiaire:11000,Confirmé:13000,Expérimenté:15000};
const DIR_SAL={Patronne:20000,"Co Patron":20000,"Lead Manager":18000,Manager:18000,RH:18000};
const QUOTAS={Charbon:5000,Fer:1440,Cuivre:2365,Or:890,Aluminium:3125};
const CAT_MAX={Charbon:11,Fer:23,Cuivre:20,Or:10,Aluminium:11};
const CAT_COL={Direction:"#EA4335",Charbon:"#8fa8b3",Fer:"#8ab4a0",Cuivre:"#c87941",Or:"#d4a017",Aluminium:"#7EB8C9"};
const CAT_ORDER=["Direction","Charbon","Fer","Cuivre","Or","Aluminium"];
const GRADE_UP={Stagiaire:"Confirmé",Confirmé:"Expérimenté",Expérimenté:"Expérimenté"};
const GRADE_DIR_UP={Stagiaire:"RH",RH:"Manager",Manager:"Lead Manager","Lead Manager":"Patronne","Co Patron":"Patronne",Patronne:"Patronne"};
const CARTON_UNIT=25;
const CARTON_RECAP=100;
const STATUS_OPTS=["","Nouveau","Absent","Avertissement","Licencié","Démission","Up","OK","Prime"];
const STATUS_COLOR={Nouveau:{border:"#5A8C4A",bg:"rgba(90,140,74,.10)",text:"#7dba65"},Absent:{border:"#5B7FA6",bg:"rgba(91,127,166,.10)",text:"#8aabcc"},Avertissement:{border:"#D4A017",bg:"rgba(212,160,23,.10)",text:"#D4A017"},Licencié:{border:"#B84040",bg:"rgba(184,64,64,.10)",text:"#d47070"},Démission:{border:"#8B5E3C",bg:"rgba(139,94,60,.12)",text:"#d4956a"},Up:{border:"#C8792A",bg:"rgba(200,121,42,.10)",text:"#e09a5a"},OK:{border:"#5A8C4A",bg:"rgba(90,140,74,.06)",text:"#7dba65"},Prime:{border:"#7A5C8C",bg:"rgba(122,92,140,.12)",text:"#b899d4"}};
const DQ={darker:"#1A0F07",dark:"#2C1A0E",mid:"#3D2510",panel:"#4A2E14",accent:"#D4A017",accent2:"#C8792A",muted:"#9A7B55",text:"#EDD9A3",white:"#F5E6C8",border:"rgba(212,160,23,0.22)",green:"#5A8C4A",red:"#B84040",blue:"#5B7FA6",purple:"#7A5C8C"};
const MINERAIS=["Charbon","Fer","Cuivre","Or","Aluminium"];

// ── Helpers ──────────────────────────────────────
const fmt=n=>(n||0).toLocaleString("fr-FR");
const fmtDate=d=>{const dt=new Date(d);return dt.toLocaleDateString("fr-FR")+" "+dt.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});};
const today=()=>new Date().toLocaleDateString("fr-FR");
const scls=s=>s?s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]/g,""):"";
function calcSal(m,P=PRICES,C=CAP,D=DIR_SAL){if(!m)return 0;if(m.categorie==="Direction")return D[m.grade]||18000;const p=(P[m.categorie]||{})[m.grade]||0;const cap=C[m.grade]||15000;return Math.round(Math.min(p*(m.quantite||0)+Math.floor((m.exports||0)/100)*2500,cap));}
function calcSalD(qte,cartons,minerai,grade,P=PRICES,C=CAP){const p=(P[minerai]||{})[grade]||0;const bonus=Math.floor((cartons||0)/100)*2500;return Math.round(Math.min(p*(qte||0)+bonus,C[grade]||15000));}
function mkRow(r){return{casier:r.casier,categorie:r.cat,grade:r.grade,nom:r.nom,menus:false,exports:0,quantite:0,frais:0,prime:0,status:"",commentaire:""};}
function sbCls(s){const m={Nouveau:"sbn",Absent:"sba",Avertissement:"sbav",Licencié:"sbl",Démission:"sbd",Up:"sbu",OK:"sbok",Prime:"sbp"};return "sbadge "+(m[s]||"");}

// ── Données initiales ───────────────────────────
const ROSTER_FULL=[
  {casier:"1",cat:"Direction",grade:"Patronne",nom:"Kayla Moreno"},{casier:"2",cat:"Direction",grade:"Lead Manager",nom:"Marc Assin"},{casier:"3",cat:"Direction",grade:"Manager",nom:"Wyatt Scott"},{casier:"4",cat:"Direction",grade:"RH",nom:"Valentina Carmona"},{casier:"5",cat:"Direction",grade:"RH",nom:"Benjamin Johnson"},
  {casier:"52",cat:"Charbon",grade:"Expérimenté",nom:"Jayden Reed"},{casier:"10",cat:"Charbon",grade:"Expérimenté",nom:"Aaron Olsen"},{casier:"80",cat:"Charbon",grade:"Expérimenté",nom:"Sacha Parker"},{casier:"44",cat:"Charbon",grade:"Expérimenté",nom:"Toma Pachysse"},{casier:"53",cat:"Charbon",grade:"Expérimenté",nom:"Carlos Distevia"},{casier:"07",cat:"Charbon",grade:"Expérimenté",nom:"Jesse O'Ree"},{casier:"38",cat:"Charbon",grade:"Expérimenté",nom:"Jabari Shepard"},{casier:"45",cat:"Charbon",grade:"Expérimenté",nom:"Ace Andersonne"},{casier:"51",cat:"Charbon",grade:"Expérimenté",nom:"Logan Cross"},{casier:"57",cat:"Charbon",grade:"Expérimenté",nom:"Loucas Planckeel"},{casier:"59",cat:"Charbon",grade:"Expérimenté",nom:"Logan Martin"},{casier:"36",cat:"Charbon",grade:"Expérimenté",nom:"Isao Nakamoto"},{casier:"33",cat:"Charbon",grade:"Expérimenté",nom:"Misaki Sakamoto"},{casier:"40",cat:"Charbon",grade:"Expérimenté",nom:"Marc Mozarella"},{casier:"39",cat:"Charbon",grade:"Expérimenté",nom:"Sandro Moro"},{casier:"78",cat:"Charbon",grade:"Expérimenté",nom:"Horacio Kavera"},{casier:"63",cat:"Charbon",grade:"Confirmé",nom:"Gibril Lowner"},{casier:"49",cat:"Charbon",grade:"Stagiaire",nom:"Hannah Diaz"},{casier:"46",cat:"Charbon",grade:"Stagiaire",nom:"Alejandro Jimenez"},{casier:"16",cat:"Charbon",grade:"Stagiaire",nom:"Issa Blackys"},
  {casier:"75",cat:"Fer",grade:"Expérimenté",nom:"Josh Lewis"},{casier:"35",cat:"Fer",grade:"Expérimenté",nom:"Jude Olsen"},{casier:"54",cat:"Fer",grade:"Expérimenté",nom:"Matheo Taka"},{casier:"42",cat:"Fer",grade:"Expérimenté",nom:"Akram Djils"},{casier:"18",cat:"Fer",grade:"Expérimenté",nom:"Yori Tamagotchi"},{casier:"55",cat:"Fer",grade:"Expérimenté",nom:"Jessica Wood"},{casier:"29",cat:"Fer",grade:"Expérimenté",nom:"Davy Brival"},{casier:"48",cat:"Fer",grade:"Expérimenté",nom:"Hector Reyes"},{casier:"60",cat:"Fer",grade:"Expérimenté",nom:"Emy Wilsonn"},{casier:"27",cat:"Fer",grade:"Expérimenté",nom:"Doula Ham"},{casier:"17",cat:"Fer",grade:"Expérimenté",nom:"Juan Carlos Gonzalez"},{casier:"19",cat:"Fer",grade:"Expérimenté",nom:"Cameron Davis"},{casier:"23",cat:"Fer",grade:"Expérimenté",nom:"Ethan Monkass"},{casier:"62",cat:"Fer",grade:"Expérimenté",nom:"Teddy Carlton"},{casier:"66",cat:"Fer",grade:"Confirmé",nom:"Brandon Cortez"},{casier:"43",cat:"Fer",grade:"Confirmé",nom:"Tyson Brooks"},{casier:"79",cat:"Fer",grade:"Confirmé",nom:"Matheo Mendez"},{casier:"15",cat:"Fer",grade:"Stagiaire",nom:"Brad Kenan"},
  {casier:"71",cat:"Cuivre",grade:"Expérimenté",nom:"Rafael Dawnson"},{casier:"37",cat:"Cuivre",grade:"Expérimenté",nom:"Mike Fosh"},{casier:"67",cat:"Cuivre",grade:"Expérimenté",nom:"Gustavo Carrera"},{casier:"14",cat:"Cuivre",grade:"Expérimenté",nom:"Ayrton Junior"},{casier:"13",cat:"Cuivre",grade:"Expérimenté",nom:"Davis Miller"},{casier:"12",cat:"Cuivre",grade:"Expérimenté",nom:"Kendrick Robinson"},{casier:"34",cat:"Cuivre",grade:"Expérimenté",nom:"Juan Rojas"},{casier:"28",cat:"Cuivre",grade:"Confirmé",nom:"Hun-Ji San"},{casier:"61",cat:"Cuivre",grade:"Confirmé",nom:"Carol Carter"},{casier:"06",cat:"Cuivre",grade:"Stagiaire",nom:"Salazar Cordoba"},{casier:"24",cat:"Cuivre",grade:"Stagiaire",nom:"Anderson Diaz"},{casier:"20",cat:"Cuivre",grade:"Stagiaire",nom:"Rico Freez"},
  {casier:"76",cat:"Or",grade:"Expérimenté",nom:"Riley West"},{casier:"30",cat:"Or",grade:"Expérimenté",nom:"Jordan Wallace"},{casier:"74",cat:"Or",grade:"Expérimenté",nom:"Tonio Madrino"},{casier:"47",cat:"Or",grade:"Expérimenté",nom:"Luis Abelli"},{casier:"11",cat:"Or",grade:"Expérimenté",nom:"Pang Woo"},{casier:"56",cat:"Or",grade:"Expérimenté",nom:"Adler Rewan"},{casier:"31",cat:"Or",grade:"Expérimenté",nom:"Jaden Carter"},{casier:"64",cat:"Or",grade:"Expérimenté",nom:"Riley Frost"},{casier:"22",cat:"Or",grade:"Expérimenté",nom:"Iris Morales"},{casier:"72",cat:"Or",grade:"Expérimenté",nom:"Nashon Lowe"},{casier:"58",cat:"Or",grade:"Expérimenté",nom:"Ryu Watson"},{casier:"25",cat:"Or",grade:"Expérimenté",nom:"Tyquan Lewis"},{casier:"65",cat:"Or",grade:"Confirmé",nom:"Nella Rose"},{casier:"21",cat:"Or",grade:"Stagiaire",nom:"William O'Connor"},{casier:"26",cat:"Or",grade:"Stagiaire",nom:"Yvan Serrano"},
  {casier:"41",cat:"Aluminium",grade:"Expérimenté",nom:"Milo Jenkins"},{casier:"32",cat:"Aluminium",grade:"Expérimenté",nom:"Blake Carrington"},{casier:"50",cat:"Aluminium",grade:"Expérimenté",nom:"Maya Luna"},{casier:"73",cat:"Aluminium",grade:"Stagiaire",nom:"Elijah Serrano"},{casier:"77",cat:"Aluminium",grade:"Stagiaire",nom:"Armando Alvarèz"},
];

const COMPTES_INIT=[
  {id:1,nom:"Moreno",prenom:"Kayla",login:"direction",mdp:"admin",role:"direction",minerai:null,grade:null},
  {id:2,nom:"Assin",prenom:"Marc",login:"gestion",mdp:"admin",role:"gestion",minerai:null,grade:null},
  {id:7,nom:"O'Ree",prenom:"Jesse",login:"jesse",mdp:"emp",role:"employe",minerai:"Charbon",grade:"Expérimenté"},
  {id:10,nom:"Olsen",prenom:"Aaron",login:"aaron",mdp:"emp",role:"employe",minerai:"Charbon",grade:"Expérimenté"},
  {id:56,nom:"Rewan",prenom:"Adler",login:"adler",mdp:"emp",role:"employe",minerai:"Or",grade:"Expérimenté"},
  {id:42,nom:"Djils",prenom:"Akram",login:"akram",mdp:"emp",role:"employe",minerai:"Fer",grade:"Expérimenté"},
];
const DECLS_INIT=[
  {id:1,date:"2026-05-31T18:59",employeId:10,minerai:"Charbon",grade:"Expérimenté",qte:2472,cartons:0},
  {id:2,date:"2026-05-31T18:04",employeId:7,minerai:"Charbon",grade:"Expérimenté",qte:1836,cartons:0},
  {id:3,date:"2026-05-31T17:46",employeId:56,minerai:"Or",grade:"Expérimenté",qte:903,cartons:12},
  {id:4,date:"2026-05-31T17:28",employeId:42,minerai:"Fer",grade:"Expérimenté",qte:580,cartons:0},
  {id:5,date:"2026-05-30T14:22",employeId:56,minerai:"Or",grade:"Expérimenté",qte:935,cartons:8},
  {id:6,date:"2026-05-30T11:05",employeId:42,minerai:"Fer",grade:"Expérimenté",qte:1500,cartons:0},
];
const COMPTA_INIT={chiffreAffaires:0,autresEntrees:0,donsRecus:0,decoration:0,subventions:0,masseSalariale:59000,matieresPremières:4733,fraisAvocats:0,fraisComptables:0,locations:0,fraisVehicules:0,nourriture:0,donsEffectues:0,locsNonDed:0,vehiculesNonDed:0,autresNonDed:0,impots:0};
const CHAT_INIT=[
  {id:1,from:1,text:"Prise de service — bonne semaine à tous.",date:"2026-05-31T08:00",role:"direction"},
  {id:2,from:7,text:"Présent, on démarre le charbon.",date:"2026-05-31T08:05",role:"employe"},
  {id:3,from:2,text:"Rappel : déclarations avant 19h ce soir.",date:"2026-05-31T09:00",role:"gestion"},
  {id:4,from:56,text:"Bons exports sur l'or cette semaine !",date:"2026-05-31T14:30",role:"employe"},
];


// ── CSS global ───────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#1A0F07}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#1A0F07}
::-webkit-scrollbar-thumb{background:rgba(212,160,23,.3);border-radius:3px}
.dqR:nth-child(even){background:#221407}
.dqR:nth-child(odd){background:#2A1A0A}
.dqR:hover{background:rgba(212,160,23,.07)!important}
td input,td select{background:transparent;border:none;color:#EDD9A3;font-family:'Barlow Condensed',sans-serif;font-size:14px;width:100%;outline:none;padding:2px 3px;border-radius:2px;transition:background .15s}
td input:focus,td select:focus{background:rgba(212,160,23,.1);outline:1px solid rgba(212,160,23,.4)}
td input[type=number]{font-family:'IBM Plex Mono',monospace;font-size:12px}
td input[type=checkbox]{width:auto;accent-color:#D4A017;transform:scale(1.2);cursor:pointer}
td select option{background:#2C1A0E;color:#EDD9A3}
.fbtn{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:4px 9px;border-radius:2px;border:1px solid rgba(212,160,23,.22);background:transparent;color:#9A7B55;cursor:pointer;transition:all .15s;white-space:nowrap}
.fbtn:hover,.fbtn.on{color:#D4A017;background:rgba(212,160,23,.1);border-color:#D4A017}
.fbtn.c-Charbon.on{background:rgba(88,100,109,.25);border-color:#8fa8b3;color:#adbbc4}
.fbtn.c-Fer.on{background:rgba(138,180,160,.2);border-color:#8ab4a0;color:#8ab4a0}
.fbtn.c-Cuivre.on{background:rgba(200,121,65,.2);border-color:#c87941;color:#c87941}
.fbtn.c-Or.on{background:rgba(212,160,23,.2);border-color:#d4a017;color:#d4a017}
.fbtn.c-Aluminium.on{background:rgba(126,184,201,.2);border-color:#7EB8C9;color:#7EB8C9}
.fbtn.c-Direction.on{background:rgba(184,64,64,.2);border-color:#B84040;color:#d47070}
.sbadge{display:inline-block;padding:2px 8px;border-radius:2px;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;white-space:nowrap}
.sb-nouveau{background:rgba(90,140,74,.2);color:#7dba65;border:1px solid rgba(90,140,74,.4)}
.sb-absent{background:rgba(91,127,166,.2);color:#8aabcc;border:1px solid rgba(91,127,166,.4)}
.sb-avertissement{background:rgba(212,160,23,.15);color:#D4A017;border:1px solid rgba(212,160,23,.35)}
.sb-licenci{background:rgba(184,64,64,.18);color:#d47070;border:1px solid rgba(184,64,64,.35)}
.sb-demission{background:rgba(100,60,10,.3);color:#d4956a;border:1px solid rgba(180,100,30,.4)}
.sb-up{background:rgba(200,121,42,.18);color:#e09a5a;border:1px solid rgba(200,121,42,.4)}
.sb-ok{background:rgba(90,140,74,.12);color:#7dba65;border:1px solid rgba(90,140,74,.25)}
.sb-prime{background:rgba(122,92,140,.2);color:#b899d4;border:1px solid rgba(122,92,140,.4)}
.delbtn{background:none;border:none;color:rgba(184,64,64,.35);cursor:pointer;padding:2px 5px;font-size:15px;border-radius:2px;transition:all .15s;line-height:1}
.delbtn:hover{color:#B84040;background:rgba(184,64,64,.12)}
.eff-bw{height:5px;background:rgba(212,160,23,.1);border-radius:3px;overflow:hidden;margin-bottom:3px}
.eff-b{height:100%;border-radius:3px;transition:width .4s}
.eff-gp{background:rgba(212,160,23,.08);border:1px solid rgba(212,160,23,.22);border-radius:2px;padding:1px 5px;white-space:nowrap;font-family:'IBM Plex Mono',monospace;font-size:9px;color:#9A7B55}
.dq-nav{display:flex;align-items:center;gap:8px;padding:8px 16px;cursor:pointer;border-left:3px solid transparent;font-size:13px;letter-spacing:1px;text-transform:uppercase;transition:all .15s;color:#9A7B55}
.dq-nav:hover{color:#F5E6C8;background:rgba(212,160,23,.07)}
.dq-nav.act{border-left-color:#D4A017;background:rgba(212,160,23,.1);color:#D4A017;font-weight:700}
.inp{background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.22);border-radius:3px;color:#EDD9A3;font-family:'Barlow Condensed',sans-serif;font-size:14px;padding:7px 10px;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s}
.inp:focus{border-color:#D4A017}
.sel{background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:3px;color:#EDD9A3;font-family:'Barlow Condensed',sans-serif;font-size:13px;padding:7px 10px;outline:none;cursor:pointer}
.sel option{background:#2C1A0E}
.btnP{background:linear-gradient(135deg,#D4A017,#b8860b);border:none;color:#1A0F07;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:3px;cursor:pointer;transition:all .15s;white-space:nowrap}
.btnP:hover{filter:brightness(1.1);box-shadow:0 0 14px rgba(212,160,23,.4)}
.btnG{background:transparent;border:1px solid rgba(212,160,23,.22);color:#9A7B55;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:3px;cursor:pointer;transition:all .15s;white-space:nowrap}
.btnG:hover{color:#EDD9A3;border-color:#D4A017}
.pitem{display:flex;flex-direction:column;gap:3px;padding:5px 0;border-bottom:1px solid rgba(212,160,23,.06)}
.pitem:last-child{border-bottom:none}
.sritem{display:flex;align-items:flex-start;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(212,160,23,.06)}
.sritem:last-child{border-bottom:none}
.fitem,.pritem{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(212,160,23,.06);font-size:12px}
.fitem:last-child,.pritem:last-child{border-bottom:none}
.rcard{background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:5px;padding:11px 13px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .18s;position:relative}
.rcard:hover{border-color:#D4A017;background:rgba(212,160,23,.05);transform:translateY(-1px)}
.rcard.added{border-color:#5A8C4A;background:rgba(52,168,83,.05)}
.rcard.added::after{content:"✓";position:absolute;top:7px;right:9px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#5A8C4A;background:rgba(52,168,83,.15);padding:1px 6px;border-radius:2px}
.rdelbtn{position:absolute;top:5px;right:5px;background:none;border:none;color:rgba(184,64,64,.3);cursor:pointer;font-size:15px;line-height:1;padding:2px 5px;border-radius:2px;transition:all .15s;z-index:2}
.rdelbtn:hover{color:#B84040;background:rgba(184,64,64,.15)}
.archcard{background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:5px;overflow:hidden;margin-bottom:10px;transition:border-color .15s}
.archcard:hover{border-color:rgba(212,160,23,.5)}
.avcrd{background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:5px;overflow:hidden;margin-bottom:10px}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center}
.modal{background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:7px;width:480px;max-width:95vw;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.7)}
.mhdr{background:#3D2510;padding:13px 20px;font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid rgba(212,160,23,.22);display:flex;justify-content:space-between;align-items:center}
.mbody{padding:20px}
.mftr{padding:12px 20px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid rgba(212,160,23,.22)}
.cbtn{background:none;border:none;color:#9A7B55;font-size:20px;cursor:pointer;line-height:1;transition:color .15s}
.cbtn:hover{color:#F5E6C8}
.twrap{border:1px solid rgba(212,160,23,.22);border-radius:4px;overflow:auto;background:#2A1A0A;box-shadow:0 8px 32px rgba(0,0,0,.5),inset 0 1px 0 rgba(212,160,23,.08)}
table{width:100%;border-collapse:collapse;min-width:960px}
thead tr{background:linear-gradient(180deg,#2C1A0E,#221407);border-bottom:2px solid #D4A017}
th{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#9A7B55;padding:10px 8px;text-align:left;white-space:nowrap;user-select:none}
td{padding:7px 8px;vertical-align:middle;font-family:'Barlow Condensed',sans-serif;font-size:14px;color:#EDD9A3}
.tbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.tc{flex:1;min-width:110px;background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:4px;padding:10px 14px}
.tc .tl{font-size:9px;letter-spacing:2px;color:#9A7B55;text-transform:uppercase}
.tc .tv{font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:500;color:#D4A017;margin-top:2px}
.tv.g{color:#5A8C4A}.tv.y{color:#D4A017}.tv.cu{color:#C8792A}.tv.pu{color:#ce93d8}
.panel{background:#2C1A0E;border:1px solid rgba(212,160,23,.22);border-radius:5px;overflow:hidden}
.phdr{background:#3D2510;padding:8px 14px;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:3px;color:#D4A017;text-transform:uppercase;border-bottom:1px solid rgba(212,160,23,.22)}
.pbody{padding:8px 12px}
.empty{text-align:center;padding:20px;color:#9A7B55;font-size:11px;letter-spacing:1px}
.ac-list{position:absolute;top:100%;left:0;right:0;background:#4A2E14;border:1px solid #D4A017;border-radius:0 0 4px 4px;z-index:50;max-height:200px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.ac-item{padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(212,160,23,.22);transition:background .1s}
.ac-item:hover{background:rgba(212,160,23,.1)}
.ac-item:last-child{border-bottom:none}
.sbox{margin:0 12px 8px;background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.2);border-radius:4px;padding:10px 12px}
.srow{display:flex;justify-content:space-between;align-items:center;padding:4px 16px;font-size:13px}
.bg-tex{background-image:radial-gradient(ellipse at 50% 0%,rgba(212,160,23,.06) 0%,transparent 60%)}
`;


// ── Semaine ───────────────────────────────────────
function PageSemaine({weeks,setWeeks,curIdx,setCurIdx,roster,setRoster,role}){
  const [fc,setFc]=useState("all");
  const [fg,setFg]=useState("all");
  const [srch,setSrch]=useState("");
  const [showNW,setShowNW]=useState(false);
  const [newNum,setNewNum]=useState("");
  const [qsOpen,setQsOpen]=useState(false);
  const [qs,setQs]=useState("");
  const [showSal,setShowSal]=useState(false);
  const [salD,setSalD]=useState(null);
  const [localPrices,setLocalPrices]=useState(PRICES);
  const [localCap,setLocalCap]=useState(CAP);
  const [localDirSal,setLocalDirSal]=useState(DIR_SAL);

  const cw=weeks[curIdx]||{num:"?",date:"",data:[],locked:false};
  const isArch=(curIdx<weeks.length-1)&&(cw.locked!==false);
  const canEdit=!isArch||(role==="direction");
  const DGO=["Patronne","Co Patron","Lead Manager","Manager","RH"];
  const GFO=["Expérimenté","Confirmé","Stagiaire"];

  function calcSalLocal(m){
    if(!m) return 0;
    if(m.categorie==="Direction") return localDirSal[m.grade]||18000;
    const p=(localPrices[m.categorie]||{})[m.grade]||0;
    const cap=localCap[m.grade]||15000;
    return Math.round(Math.min(p*(m.quantite||0)+Math.floor((m.exports||0)/100)*2500,cap));
  }

  const filtered=useMemo(()=>{
    let d=[...cw.data];
    if(fc!=="all") d=d.filter(m=>m.categorie===fc);
    if(fg!=="all") d=d.filter(m=>m.grade===fg);
    if(srch) d=d.filter(m=>(m.nom||"").toLowerCase().includes(srch.toLowerCase())||(m.casier||"").includes(srch));
    d.sort((a,b)=>{
      const ia=CAT_ORDER.indexOf(a.categorie),ib=CAT_ORDER.indexOf(b.categorie);
      if(ia!==ib) return (ia<0?99:ia)-(ib<0?99:ib);
      if(a.categorie==="Direction"){const ga=DGO.indexOf(a.grade),gb=DGO.indexOf(b.grade);return(ga<0?99:ga)-(gb<0?99:gb);}
      const ga=GFO.indexOf(a.grade),gb=GFO.indexOf(b.grade);return(ga<0?99:ga)-(gb<0?99:gb);
    });
    return d;
  },[cw.data,fc,fg,srch]);

  function updW(ws){setWeeks(ws);}
  function updRow(casier,k,v){
    const nw=weeks.map((w,i)=>i!==curIdx?w:{...w,data:w.data.map(m=>{
      if(m.casier!==casier) return m;
      const nm={...m,[k]:v};
      if(k==="status"){
        if(v==="Démission"){nm._oldCat=m.categorie;nm._oldGrade=m.grade;nm.categorie="—";nm.grade="—";}
        else if(m._oldCat&&v!=="Démission"){nm.categorie=m._oldCat;nm.grade=m._oldGrade;delete nm._oldCat;delete nm._oldGrade;}
      }
      if((k==="grade"||k==="categorie")&&m.casier){
        const ri=roster.findIndex(r=>r.casier===m.casier);
        if(ri>=0){const nr=[...roster];nr[ri]={...nr[ri],[k==="grade"?"grade":"cat"]:v};setRoster(nr);}
      }
      return nm;
    })});
    updW(nw);
  }
  function delRow(casier){
    if(!canEdit) return;
    updW(weeks.map((w,i)=>i!==curIdx?w:{...w,data:w.data.filter(m=>m.casier!==casier)}));
  }
  function addFromRoster(r){
    if(cw.data.find(m=>m.casier===r.casier)) return;
    const nm=mkRow(r);
    updW(weeks.map((w,i)=>i!==curIdx?w:{...w,data:[...w.data,nm]}));
    setQsOpen(false);setQs("");
  }
  function clearWeek(){if(!canEdit)return;updW(weeks.map((w,i)=>i!==curIdx?w:{...w,data:[]}));}
  function navWeek(d){const ni=Math.max(0,Math.min(weeks.length-1,curIdx+d));setCurIdx(ni);}
  function openNW(){const n=parseInt(cw.num||"0");setNewNum(isNaN(n)?"":String(n+1).padStart(2,"0"));setShowNW(true);}
  function confirmNW(){
    const num=newNum.trim()||"?";
    const nws=[...weeks];nws[curIdx]={...nws[curIdx],locked:true};
    const nr=[...roster];
    nws[curIdx].data.forEach(m=>{
      if(m.status==="Up"&&m.casier){const ri=nr.findIndex(r=>r.casier===m.casier);if(ri>=0){const g=nr[ri].cat==="Direction"?(GRADE_DIR_UP[nr[ri].grade]||nr[ri].grade):(GRADE_UP[nr[ri].grade]||nr[ri].grade);nr[ri]={...nr[ri],grade:g};}}
      if((m.status==="Licencié"||m.status==="Démission")&&m.casier){const ri=nr.findIndex(r=>r.casier===m.casier);if(ri>=0)nr.splice(ri,1);}
    });
    setRoster(nr);
    const nd=nr.map(r=>mkRow(r));
    nws.push({num,date:today(),data:nd,locked:false});
    setWeeks(nws);setCurIdx(nws.length-1);setShowNW(false);
  }
  function exportCSV(){
    const rows=[["Cat","Grade","Nom","Casier","Payer","Exports","CA","Qté","Salaire","Frais","Prime","Status","Note"],...cw.data.map(m=>[m.categorie,m.grade,m.nom,m.casier,m.menus?"Oui":"Non",m.exports||0,(m.exports||0)*CARTON_UNIT,m.quantite||0,calcSalLocal(m),m.frais||0,m.prime||0,m.status,m.commentaire])];
    const csv=rows.map(r=>r.join(";")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download=`DQ_Sem${cw.num}.csv`;a.click();
  }

  const totAct=filtered.filter(m=>m.status!=="Absent"&&m.status!=="Licencié").length;
  const totExp=filtered.reduce((s,m)=>s+(m.exports||0),0);
  const totCA=filtered.reduce((s,m)=>s+(m.exports||0)*100,0); // barre totaux : 1 carton = 100$
  const totQty=filtered.reduce((s,m)=>s+(m.quantite||0),0);
  const totSal=filtered.reduce((s,m)=>s+calcSalLocal(m),0);
  const totFrais=filtered.reduce((s,m)=>s+(m.frais||0),0);
  const totPrime=filtered.reduce((s,m)=>s+(m.prime||0),0);

  const qsFil=qs.length>1?roster.filter(r=>(r.nom||"").toLowerCase().includes(qs.toLowerCase())||(r.casier||"").includes(qs)).slice(0,8):[];
  const addedSet=new Set(cw.data.map(m=>m.casier));

  return(<>
    {/* Controls */}
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}>
      {isArch&&role==="direction"&&<button onClick={()=>setWeeks(ws=>ws.map((w,i)=>i===curIdx?{...w,locked:false}:w))} style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:DQ.accent,background:"rgba(212,160,23,.1)",border:"1px solid rgba(212,160,23,.3)",borderRadius:3,padding:"4px 10px",cursor:"pointer"}}>🔓 Déverrouiller</button>}
      {isArch&&role!=="direction"&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:1,color:"#d47070",background:"rgba(184,64,64,.15)",border:"1px solid rgba(184,64,64,.3)",borderRadius:3,padding:"2px 8px"}}>Lecture seule</span>}
      {/* Nav semaines */}
      <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(212,160,23,.08)",border:"1px solid rgba(212,160,23,.3)",borderRadius:4,padding:"4px 8px"}}>
        <button onClick={()=>navWeek(-1)} disabled={curIdx<=0} style={{background:"none",border:"none",color:DQ.muted,fontSize:18,cursor:"pointer",padding:"2px 6px",lineHeight:1,opacity:curIdx<=0?.3:1}}>‹</button>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:500,color:DQ.accent,minWidth:90,textAlign:"center",padding:"0 6px"}}>SEM. {cw.num||"?"}</span>
        <button onClick={()=>navWeek(1)} disabled={curIdx>=weeks.length-1} style={{background:"none",border:"none",color:DQ.muted,fontSize:18,cursor:"pointer",padding:"2px 6px",lineHeight:1,opacity:curIdx>=weeks.length-1?.3:1}}>›</button>
        <button onClick={isArch?()=>setCurIdx(weeks.length-1):openNW} className="btnP" style={{fontSize:11,padding:"4px 10px"}}>
          {isArch?"→ Dernière":"+ Nouvelle semaine"}
        </button>
      </div>
      {isArch&&<span style={{background:"rgba(212,160,23,.1)",border:`1px solid ${DQ.border}`,color:DQ.muted,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:1,padding:"3px 10px",borderRadius:3}}>📦 ARCHIVE</span>}
      <div style={{flex:1}}/>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:DQ.muted}}>{filtered.length} membre{filtered.length>1?"s":""}</span>
      {role==="direction"&&<button onClick={()=>{setSalD({P:{...JSON.parse(JSON.stringify(localPrices))},C:{...localCap},D:{...localDirSal}});setShowSal(true);}} className="btnG" style={{fontSize:11,padding:"4px 10px",color:DQ.accent,borderColor:"rgba(212,160,23,.4)"}}>⚙ Salaires</button>}
      {canEdit&&<button onClick={clearWeek} className="btnG" style={{fontSize:11,padding:"4px 10px"}}>🗑 Vider</button>}
      <button onClick={exportCSV} className="btnG" style={{fontSize:11,padding:"4px 10px",color:DQ.green,borderColor:"rgba(90,140,74,.4)"}}>↓ CSV</button>
      {canEdit&&<div style={{position:"relative"}}>
        <button className="btnP" onClick={()=>setQsOpen(p=>!p)}>+ Ajouter</button>
        {qsOpen&&<div style={{position:"absolute",top:"110%",right:0,zIndex:50,background:DQ.panel,border:`1px solid ${DQ.accent}`,borderRadius:"0 0 4px 4px",minWidth:300,maxHeight:240,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.5)"}}>
          <input autoFocus value={qs} onChange={e=>setQs(e.target.value)} style={{width:"100%",background:"rgba(212,160,23,.08)",border:"none",borderBottom:`1px solid ${DQ.border}`,color:DQ.text,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,padding:"8px 12px",outline:"none"}} placeholder="Rechercher..."/>
          {qsFil.map(r=>{const a=addedSet.has(r.casier);return(
            <div key={r.casier} className="ac-item" onClick={()=>!a&&addFromRoster(r)} style={{opacity:a?.7:1,cursor:a?"default":"pointer"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:"rgba(212,160,23,.2)",color:DQ.accent,padding:"2px 6px",borderRadius:2}}>{r.casier}</span>
              <span style={{flex:1,fontSize:12,color:DQ.white}}>{r.nom}</span>
              <span style={{fontSize:10,color:DQ.muted}}>{r.grade}</span>
              {a&&<span style={{color:DQ.green,fontSize:11}}>✓</span>}
            </div>
          );})}
          {qs.length>1&&qsFil.length===0&&<div className="empty">Aucun résultat</div>}
        </div>}
      </div>}
    </div>

    {/* Filtres catégorie */}
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
      {["all","Direction","Charbon","Fer","Cuivre","Or","Aluminium"].map(c=>(
        <button key={c} className={`fbtn c-${c}${fc===c?" on":""}`} onClick={()=>setFc(c)}>{c==="all"?"Tous":c}</button>
      ))}
      <span style={{width:1,height:14,background:DQ.border,margin:"0 2px"}}/>
      {["all","Expérimenté","Confirmé","Stagiaire"].map(g=>(
        <button key={g} className={`fbtn${fg===g?" on":""}`} onClick={()=>setFg(g)}>{g==="all"?"Tous grades":g}</button>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(212,160,23,.06)",border:`1px solid ${DQ.border}`,borderRadius:3,padding:"4px 10px",flex:1,maxWidth:260,marginLeft:6}}>
        <span style={{color:DQ.muted,fontSize:13}}>🔍</span>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Rechercher nom, casier..." style={{background:"none",border:"none",color:DQ.text,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,outline:"none",width:"100%"}}/>
      </div>
    </div>

    {/* Tableau principal */}
    <div className="twrap">
      <table>
        <thead><tr>
          {["Catégorie","Grade","Prénom Nom","Casier","Payer","Exports","CA Carton","Quantité","Salaire","Frais","Prime","Status","Commentaire",""].map(h=><th key={h}>{h}</th>)}
        </tr></thead>
        <tbody>
          {filtered.length===0
            ?<tr><td colSpan={14} className="empty">Aucun membre — cliquez sur + Ajouter ou allez dans Recrutement</td></tr>
            :filtered.map(m=>{
              const sal=calcSalLocal(m),ca=(m.exports||0)*CARTON_UNIT;
              const sc=m.status?STATUS_COLOR[m.status]:null;
              const quota=QUOTAS[m.categorie]||0,qty=m.quantite||0,qOk=quota>0&&qty>=quota;
              const gOpts=m.categorie==="Direction"?DGO:GFO;
              const ro=isArch&&role!=="direction";
              const isDem=m.status==="Démission";
              const sbCls=`sbadge sb-${scls(m.status||"")}`;
              // Prime prend le dessus sur TOUT si valeur > 0 ou statut Prime
              const hasPrime=(m.prime||0)>0||m.status==="Prime";
              const primeCol={border:"#7A5C8C",bg:"rgba(122,92,140,.12)",text:"#b899d4"};
              const nomSc=hasPrime?primeCol:sc;
              return(<tr key={m.casier} className="dqR">
                <td><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:CAT_COL[m.categorie]||"#666",flexShrink:0}}/>
                  {isDem?<span style={{color:DQ.muted,textDecoration:"line-through"}}>{m.categorie}</span>:m.categorie}
                </span></td>
                <td>{ro?<span style={{color:DQ.muted}}>{isDem?"—":m.grade}</span>:<select value={m.grade} onChange={e=>updRow(m.casier,"grade",e.target.value)}>{gOpts.map(g=><option key={g} value={g}>{g}</option>)}</select>}</td>
                <td style={{borderLeft:nomSc?`3px solid ${nomSc.border}`:"3px solid transparent",background:nomSc?nomSc.bg:"transparent",paddingLeft:10,borderRadius:3}}>
                  {ro?<span style={{color:nomSc?nomSc.text:DQ.text,fontWeight:nomSc?600:400}}>{m.nom}</span>
                  :<input value={m.nom||""} onChange={e=>updRow(m.casier,"nom",e.target.value)} style={{minWidth:110,color:nomSc?nomSc.text:DQ.text,fontWeight:nomSc?600:400}}/>}
                </td>
                <td style={{textAlign:"center"}}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,background:"rgba(212,160,23,.15)",color:DQ.accent,padding:"1px 7px",borderRadius:2}}>{m.casier||"—"}</span></td>
                <td style={{textAlign:"center"}}>{ro?<span style={{color:m.menus?DQ.green:DQ.muted}}>{m.menus?"✓":"—"}</span>:<input type="checkbox" checked={!!m.menus} onChange={e=>updRow(m.casier,"menus",e.target.checked)}/>}</td>
                <td>{ro?<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{m.exports||0}</span>:<input type="number" value={m.exports||0} min="0" onChange={e=>updRow(m.casier,"exports",+e.target.value)} style={{width:55}}/>}</td>
                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:DQ.accent2}}>{ca?fmt(ca)+" $":"—"}</td>
                <td style={{background:qOk?"rgba(90,140,74,.08)":"transparent"}}>
                  {ro?<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:qOk?"#7dba65":DQ.text,fontWeight:qOk?700:400}}>{fmt(qty)}{qOk?" ✓":""}</span>
                  :<input type="number" value={qty} min="0" onChange={e=>updRow(m.casier,"quantite",+e.target.value)} style={{width:65,color:qOk?"#7dba65":"",fontWeight:qOk?700:400}}/>}
                </td>
                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:DQ.green}}>{sal?fmt(sal)+" $":"—"}</td>
                <td>{ro?<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#c87941"}}>{m.frais?fmt(m.frais)+" $":"—"}</span>:<input type="number" value={m.frais||0} min="0" onChange={e=>updRow(m.casier,"frais",+e.target.value)} style={{width:65,color:"#c87941"}}/>}</td>
                <td>{ro?<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#b899d4"}}>{m.prime?fmt(m.prime)+" $":"—"}</span>:<input type="number" value={m.prime||0} min="0" onChange={e=>updRow(m.casier,"prime",+e.target.value)} style={{width:65,color:"#b899d4"}}/>}</td>
                <td>{ro?<span className={sbCls}>{m.status||"—"}</span>
                :<select value={m.status||""} onChange={e=>updRow(m.casier,"status",e.target.value)} style={{minWidth:105}}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s||"—"}</option>)}
                </select>}</td>
                <td>{ro?<span style={{color:DQ.muted,fontSize:12}}>{m.commentaire||"—"}</span>:<input value={m.commentaire||""} onChange={e=>updRow(m.casier,"commentaire",e.target.value)} placeholder="..." style={{minWidth:80,color:DQ.muted}}/>}</td>
                <td>{!ro&&<button className="delbtn" onClick={()=>delRow(m.casier)}>×</button>}</td>
              </tr>);
            })}
        </tbody>
      </table>
    </div>

    {/* Totaux */}
    <div className="tbar">
      {[["Présents",totAct,""],["Exports",fmt(totExp),"cu"],["CA Carton",fmt(totCA)+" $","cu"],["Quantité",fmt(totQty),""],["Salaires",fmt(totSal)+" $","g"],["Frais",fmt(totFrais)+" $","y"],["Primes",fmt(totPrime)+" $","pu"]].map(([l,v,c])=>(
        <div key={l} className="tc"><div className="tl">{l}</div><div className={`tv${c?" "+c:""}`}>{v}</div></div>
      ))}
    </div>

    {/* Podiums + Panels */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:16}}>
      {["Charbon","Fer","Cuivre","Or","Aluminium"].map(cat=>{
        const ico={Charbon:"⛏",Fer:"⚙",Cuivre:"🔶",Or:"✨",Aluminium:"🔩"}[cat];
        const q=QUOTAS[cat]||0,col=CAT_COL[cat];
        const top=[...cw.data].filter(m=>m.categorie===cat&&(m.quantite||0)>0).sort((a,b)=>(b.quantite||0)-(a.quantite||0)).slice(0,5);
        return(<div key={cat} className="panel">
          <div className="phdr" style={{borderLeft:`3px solid ${col}`}}>{ico} Top 5 {cat}</div>
          <div className="pbody">
            {!top.length?<div className="empty">Pas de données</div>
            :top.map((m,i)=>{const qty=m.quantite||0,pct=q?Math.min(100,Math.round(qty/q*100)):0,atQ=q&&qty>=q;return(<div key={i} className="pitem">
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:500,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":DQ.muted,width:24,textAlign:"center",flexShrink:0}}>{["🥇","🥈","🥉","4","5"][i]}</span>
                <span style={{flex:1,fontSize:12,color:atQ?"#7dba65":DQ.white,fontWeight:atQ?700:400}}>{m.nom||"—"}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:atQ?"#7dba65":DQ.accent}}>{fmt(qty)}{atQ?" ✓":""}</span>
              </div>
              {q>0&&<div style={{height:3,background:"rgba(212,160,23,.1)",borderRadius:2,marginLeft:28}}>
                <div style={{height:"100%",width:pct+"%",background:atQ?"#7dba65":col,borderRadius:2,transition:"width .4s"}}/>
              </div>}
            </div>);})}
          </div>
        </div>);
      })}
      <div className="panel"><div className="phdr">📋 Status</div><div className="pbody">
        {["Nouveau","Absent","Avertissement","Licencié","Démission","Up","Prime"].map(s=>{
          const g=cw.data.filter(m=>m.status===s);if(!g.length) return null;
          const cols={Nouveau:DQ.green,Absent:DQ.blue,Avertissement:DQ.accent,Licencié:DQ.red,Démission:"#d4956a",Up:DQ.accent2,Prime:"#b899d4"};
          return(<div key={s} className="sritem">
            <div><span className={`sbadge sb-${scls(s)}`}>{s}</span><div style={{fontSize:10,color:DQ.muted,marginTop:2,maxWidth:140,lineHeight:1.3}}>{g.map(m=>m.nom||"?").join(", ")}</div></div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,color:cols[s],fontWeight:500}}>{g.length}</span>
          </div>);
        })}
        {!cw.data.some(m=>m.status)&&<div className="empty">Aucun status</div>}
      </div></div>
      <div className="panel"><div className="phdr">💰 Frais</div><div className="pbody">
        {cw.data.filter(m=>m.frais>0).sort((a,b)=>(b.frais||0)-(a.frais||0)).map(m=>(
          <div key={m.casier} className="fitem"><span style={{color:DQ.white}}>{m.nom||"—"}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#D4A017",fontSize:11}}>{fmt(m.frais||0)} $</span></div>
        ))}
        {!cw.data.some(m=>m.frais>0)&&<div className="empty">Aucune note</div>}
      </div></div>
      <div className="panel"><div className="phdr">🎖 Primes</div><div className="pbody">
        {cw.data.filter(m=>m.prime>0||m.status==="Prime").sort((a,b)=>(b.prime||0)-(a.prime||0)).map(m=>(
          <div key={m.casier} className="pritem"><span style={{color:DQ.white}}>{m.nom||"—"}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#ce93d8",fontSize:11}}>{m.prime?fmt(m.prime)+" $":"⭐"}</span></div>
        ))}
        {!cw.data.some(m=>m.prime>0||m.status==="Prime")&&<div className="empty">Aucune prime</div>}
      </div></div>
    </div>

    {/* Modal nouvelle semaine */}
    {showNW&&<div className="ov"><div className="modal">
      <div className="mhdr"><span>Nouvelle semaine</span><button className="cbtn" onClick={()=>setShowNW(false)}>×</button></div>
      <div className="mbody">
        <div style={{background:"rgba(30,144,255,.08)",border:`1px solid ${DQ.border}`,borderRadius:5,padding:"14px 16px",marginBottom:16,fontSize:13,lineHeight:1.7}}>
          <b style={{color:DQ.accent}}>Récap sem. {cw.num} avant clôture :</b><br/><br/>
          • <span style={{color:DQ.accent,fontWeight:600}}>{cw.data.length} membres</span> dans la semaine<br/>
          {cw.data.filter(m=>m.status==="Up").length>0&&<>• <span style={{color:DQ.green,fontWeight:600}}>⬆ {cw.data.filter(m=>m.status==="Up").length} Up</span> — promotions appliquées<br/></>}
          {cw.data.filter(m=>m.status==="Licencié").length>0&&<>• <span style={{color:DQ.red,fontWeight:600}}>🔴 {cw.data.filter(m=>m.status==="Licencié").length} Licencié(s)</span> — retirés du roster<br/></>}
          <br/>La nouvelle semaine reprend le roster <b>sans les données de production</b>.
        </div>
        <div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:6}}>Numéro de la nouvelle semaine</div>
        <input value={newNum} onChange={e=>setNewNum(e.target.value)} style={{background:DQ.mid,border:`1px solid ${DQ.border}`,borderRadius:3,color:DQ.white,fontFamily:"'IBM Plex Mono',monospace",fontSize:16,padding:"8px 12px",outline:"none",width:120,textAlign:"center"}}/>
      </div>
      <div className="mftr">
        <button className="btnG" onClick={()=>setShowNW(false)}>Annuler</button>
        <button className="btnP" onClick={confirmNW}>✓ Créer la semaine</button>
      </div>
    </div></div>}

    {/* Modal salaires */}
    {showSal&&salD&&<div className="ov"><div className="modal" style={{width:560,maxWidth:"95vw"}}>
      <div className="mhdr"><span>⚙ Paramètres Salaires</span><button className="cbtn" onClick={()=>setShowSal(false)}>×</button></div>
      <div className="mbody" style={{maxHeight:"65vh",overflowY:"auto"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:14}}>Taux par catégorie et grade</div>
        {["Charbon","Fer","Cuivre","Or","Aluminium"].map(cat=>(
          <div key={cat} style={{marginBottom:12,background:"rgba(212,160,23,.04)",border:`1px solid ${DQ.border}`,borderRadius:4,padding:"10px 12px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:CAT_COL[cat],marginBottom:8}}>{cat}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {["Expérimenté","Confirmé","Stagiaire"].map(g=>(
                <div key={g}>
                  <div style={{fontSize:9,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>{g}</div>
                  <input type="number" step="0.001" min="0" value={(salD.P[cat]||{})[g]||0} onChange={e=>setSalD(d=>({...d,P:{...d.P,[cat]:{...d.P[cat],[g]:+e.target.value}}}))} className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{borderTop:`1px solid ${DQ.border}`,paddingTop:12,marginTop:4}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:10}}>Plafonds (CAP)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {["Expérimenté","Confirmé","Stagiaire"].map(g=>(
              <div key={g}>
                <div style={{fontSize:9,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>{g}</div>
                <input type="number" step="100" min="0" value={salD.C[g]||0} onChange={e=>setSalD(d=>({...d,C:{...d.C,[g]:+e.target.value}}))} className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${DQ.border}`,paddingTop:12,marginTop:12}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:10}}>Salaires Direction</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {["Patronne","Co Patron","Lead Manager","Manager","RH"].map(r=>(
              <div key={r}>
                <div style={{fontSize:9,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>{r}</div>
                <input type="number" step="100" min="0" value={salD.D[r]||0} onChange={e=>setSalD(d=>({...d,D:{...d.D,[r]:+e.target.value}}))} className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mftr">
        <button className="btnG" onClick={()=>setShowSal(false)}>Annuler</button>
        <button className="btnP" onClick={()=>{setLocalPrices(salD.P);setLocalCap(salD.C);setLocalDirSal(salD.D);setShowSal(false);}}>✓ Enregistrer</button>
      </div>
    </div></div>}
  </>);
}



// ── Archives ──────────────────────────────────────
function PageArchives({weeks}){
  const [open,setOpen]=useState({});
  const archived=weeks.slice(0,-1).reverse();
  if(!archived.length) return <div className="empty" style={{padding:60,fontFamily:"'IBM Plex Mono',monospace"}}>Aucune archive disponible — créez une nouvelle semaine pour archiver la courante</div>;
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:4}}>Archives</div>
    <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>{archived.length} semaine{archived.length>1?"s":""} archivée{archived.length>1?"s":""}</div>
    {archived.map((w,i)=>{
      const totSal=w.data.reduce((s,m)=>s+calcSal(m),0);
      const totCA=w.data.reduce((s,m)=>s+(m.exports||0)*CARTON_UNIT,0);
      const isOpen=open[i];
      return(<div key={i} className="archcard">
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",cursor:"pointer",background:DQ.mid}} onClick={()=>setOpen(p=>({...p,[i]:!p[i]}))}>
          <div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700,letterSpacing:2,color:DQ.white}}>SEM. {w.num}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:DQ.muted}}>{w.date}</div>
          </div>
          <div style={{display:"flex",gap:20,marginLeft:"auto",alignItems:"center"}}>
            {[["Membres",w.data.length,DQ.white],["Salaires",fmt(totSal)+" $",DQ.green],["CA Carton",fmt(totCA)+" $",DQ.accent2],["Présents",w.data.filter(m=>m.status!=="Absent"&&m.status!=="Licencié").length,DQ.text]].map(([l,v,c])=>(
              <div key={l} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:DQ.muted,textAlign:"center"}}>
                <strong style={{display:"block",fontSize:14,color:c}}>{v}</strong>{l}
              </div>
            ))}
          </div>
          <span style={{color:DQ.muted,fontSize:18,marginLeft:8,display:"inline-block",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>
        </div>
        {isOpen&&<div style={{overflow:"auto",maxHeight:400}}>
          <table style={{minWidth:700}}>
            <thead><tr>{["Catégorie","Grade","Nom","Casier","Exports","CA","Quantité","Salaire","Frais","Prime","Status","Commentaire"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {w.data.map((m,j)=>{
                const sal=calcSal(m),ca=(m.exports||0)*CARTON_UNIT;
                const sc=m.status?STATUS_COLOR[m.status]:null;
                const hasPrime=(m.prime||0)>0||m.status==="Prime";
                const primeCol={border:"#7A5C8C",bg:"rgba(122,92,140,.12)",text:"#b899d4"};
                const nomSc=hasPrime?primeCol:sc;
                return(<tr key={j} className="dqR">
                  <td><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,textTransform:"uppercase"}}><span style={{width:6,height:6,borderRadius:"50%",background:CAT_COL[m.categorie]||"#666",flexShrink:0}}/>{m.categorie}</span></td>
                  <td style={{color:DQ.muted,fontSize:12}}>{m.grade}</td>
                  <td style={{borderLeft:nomSc?`3px solid ${nomSc.border}`:"3px solid transparent",background:nomSc?nomSc.bg:"transparent",paddingLeft:8}}>
                    <span style={{color:nomSc?nomSc.text:DQ.text,fontWeight:nomSc?600:400}}>{m.nom}</span>
                  </td>
                  <td style={{textAlign:"center"}}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,background:"rgba(212,160,23,.15)",color:DQ.accent,padding:"1px 7px",borderRadius:2}}>{m.casier||"—"}</span></td>
                  <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{m.exports||0}</td>
                  <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:DQ.accent2}}>{ca?fmt(ca)+" $":"—"}</td>
                  <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{fmt(m.quantite||0)}</td>
                  <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:DQ.green}}>{sal?fmt(sal)+" $":"—"}</td>
                  <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#c87941"}}>{m.frais?fmt(m.frais)+" $":"—"}</td>
                  <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#b899d4"}}>{m.prime?fmt(m.prime)+" $":"—"}</td>
                  <td>{m.status?<span className={sbCls(m.status)}>{m.status}</span>:"—"}</td>
                  <td style={{color:DQ.muted,fontSize:12}}>{m.commentaire||"—"}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>}
      </div>);
    })}
  </>);
}

// ── Avertissements ────────────────────────────────
function PageAvertissements({weeks}){
  const [srch,setSrch]=useState("");
  const [open,setOpen]=useState({});
  const map={};
  weeks.forEach(w=>{w.data.forEach(m=>{
    if(m.status==="Avertissement"||m.status==="Licencié"||m.status==="Démission"){
      const key=m.casier||m.nom;
      if(!map[key])map[key]={nom:m.nom,casier:m.casier,cat:m._oldCat||m.categorie,grade:m._oldGrade||m.grade,entries:[]};
      map[key].entries.push({week:w.num,status:m.status,commentaire:m.commentaire||""});
    }
  });});
  let members=Object.values(map).filter(m=>!srch||(m.nom||"").toLowerCase().includes(srch.toLowerCase())||(m.casier||"").toLowerCase().includes(srch.toLowerCase())).sort((a,b)=>b.entries.length-a.entries.length);
  const totalA=members.reduce((s,m)=>s+m.entries.filter(e=>e.status==="Avertissement").length,0);
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:4}}>Avertissements</div>
    <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>{members.length} membre{members.length!==1?"s":""} concerné{members.length!==1?"s":""} · {totalA} avertissement{totalA!==1?"s":""}</div>
    <div style={{marginBottom:14}}><input className="inp" value={srch} onChange={e=>setSrch(e.target.value)} placeholder="🔍 Rechercher..." style={{maxWidth:300}}/></div>
    {!members.length&&<div className="empty" style={{padding:60}}>⚠️ Aucun avertissement enregistré</div>}
    {members.map((m,mi)=>{
      const aC=m.entries.filter(e=>e.status==="Avertissement").length;
      const danger=aC>=3;const col=CAT_COL[m.cat]||DQ.accent;const isO=open[mi];
      return(<div key={mi} className="avcrd">
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:DQ.mid,cursor:"pointer"}} onClick={()=>setOpen(p=>({...p,[mi]:!p[mi]}))}>
          <div style={{width:32,height:32,borderRadius:4,background:col,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:500,color:"#fff",flexShrink:0}}>{m.casier||"?"}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:DQ.text}}>{m.nom}</div>
            <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",fontWeight:600,color:col}}>{m.cat} · {m.grade}</div>
          </div>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,padding:"2px 8px",borderRadius:2,background:danger?"rgba(184,64,64,.2)":"rgba(212,160,23,.15)",color:danger?"#d47070":DQ.accent,border:`1px solid ${danger?"rgba(184,64,64,.35)":"rgba(212,160,23,.3)"}`}}>⚠ {aC} avert.</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:DQ.muted,margin:"0 8px"}}>{m.entries.length} évèn.</span>
          <span style={{color:DQ.muted,fontSize:16,display:"inline-block",transition:"transform .2s",transform:isO?"rotate(180deg)":"none"}}>▾</span>
        </div>
        {isO&&<div style={{padding:"10px 14px"}}>
          {m.entries.map((e,ei)=>(
            <div key={ei} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:`1px solid ${DQ.border}`,fontSize:12}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:DQ.muted,width:70,flexShrink:0}}>Sem. {e.week}</span>
              <span style={{flex:1}}><span className={sbCls(e.status)}>{e.status}</span></span>
              <span style={{color:DQ.muted,fontSize:11,fontStyle:"italic"}}>{e.commentaire||"—"}</span>
            </div>
          ))}
        </div>}
      </div>);
    })}
  </>);
}

// ── Déclarations produits ─────────────────────────
function PageDeclarations({decls,setDecls,comptes}){
  const [srch,setSrch]=useState("");const [fm,setFm]=useState("all");
  const [eid,setEid]=useState(null);const [eq,setEq]=useState("");const [ec,setEc]=useState("");
  const filtered=useMemo(()=>decls.filter(d=>{
    const emp=comptes.find(c=>c.id===d.employeId);
    const ms=!srch||(emp&&`${emp.prenom} ${emp.nom}`.toLowerCase().includes(srch.toLowerCase()))||d.minerai.toLowerCase().includes(srch.toLowerCase());
    return ms&&(fm==="all"||d.minerai===fm);
  }).sort((a,b)=>new Date(b.date)-new Date(a.date)),[decls,srch,fm,comptes]);
  function save(id){setDecls(p=>p.map(d=>d.id===id?{...d,qte:Number(eq)||0,cartons:Number(ec)||0}:d));setEid(null);}
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:2}}>Déclarations de produits</div>
    <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Visualisation et correction des quantités déclarées</div>
    <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:14,marginBottom:14}}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
        <div><div style={{fontSize:9,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Recherche</div><input className="inp" value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Employé, minerai..."/></div>
        <div><div style={{fontSize:9,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Minerai</div>
          <select className="sel" style={{width:"100%"}} value={fm} onChange={e=>setFm(e.target.value)}><option value="all">Tous</option>{MINERAIS.map(m=><option key={m} value={m}>{m}</option>)}</select>
        </div>
      </div>
      <div style={{fontSize:11,color:DQ.muted,marginTop:8,fontFamily:"'IBM Plex Mono',monospace"}}>Affiché : {filtered.length} / {decls.length}</div>
    </div>
    <div className="twrap">
      <table>
        <thead><tr>{["Date","Employé","Minerai","Grade","Quantité","Cartons vendus","Salaire est.","Action"].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map(d=>{
            const emp=comptes.find(c=>c.id===d.employeId);
            const sal=calcSalD(d.qte,d.cartons,d.minerai,d.grade);
            const ok=QUOTAS[d.minerai]>0&&d.qte>=QUOTAS[d.minerai];
            return(<tr key={d.id} className="dqR">
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{fmtDate(d.date)}</td>
              <td><div style={{fontWeight:600}}>{emp?.prenom} {emp?.nom}</div><div style={{fontSize:10,color:DQ.muted}}>#{emp?.id}</div></td>
              <td><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",background:CAT_COL[d.minerai]}}/>{d.minerai}</span></td>
              <td style={{color:DQ.muted,fontSize:12}}>{d.grade}</td>
              <td>{eid===d.id?<input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",width:90}} type="number" value={eq} onChange={e=>setEq(e.target.value)}/>:<span style={{fontFamily:"'IBM Plex Mono',monospace",color:ok?"#7dba65":DQ.text,fontWeight:ok?700:400}}>{fmt(d.qte)}{ok?" ✓":""}</span>}</td>
              <td>{eid===d.id?<input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",width:70}} type="number" value={ec} onChange={e=>setEc(e.target.value)}/>:<span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent2}}>{d.cartons>0?d.cartons:"—"}</span>}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.green}}>{fmt(sal)} $</td>
              <td>{eid===d.id?<><button className="btnP" style={{padding:"4px 10px",marginRight:4,fontSize:11}} onClick={()=>save(d.id)}>✓</button><button className="btnG" style={{padding:"4px 10px",fontSize:11}} onClick={()=>setEid(null)}>✗</button></>:<button className="btnG" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>{setEid(d.id);setEq(d.qte);setEc(d.cartons||0);}}>✏ Modifier</button>}</td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>
    <div className="tbar">
      {MINERAIS.map(m=>{const s=filtered.filter(d=>d.minerai===m).reduce((t,d)=>t+d.qte,0);if(!s)return null;return <div key={m} className="tc"><div className="tl">{m}</div><div className="tv" style={{color:CAT_COL[m]}}>{fmt(s)}</div></div>;})}
      <div className="tc" style={{borderColor:"rgba(212,160,23,.5)"}}><div className="tl">Salaires est.</div><div className="tv g">{fmt(filtered.reduce((s,d)=>s+calcSalD(d.qte,d.cartons,d.minerai,d.grade),0))} $</div></div>
    </div>
  </>);
}

// ── Récapitulatif ─────────────────────────────────
function PageRecap({decls,comptes}){
  const [sem,setSem]=useState("2026-W22");const [srch,setSrch]=useState("");
  const [y,wn]=sem.split("-W").map(Number);
  function wr(yy,ww){const s=new Date(yy,0,1+(ww-1)*7);const dow=s.getDay();const st=new Date(s);if(dow<=4)st.setDate(s.getDate()-s.getDay()+1);else st.setDate(s.getDate()+8-s.getDay());const en=new Date(st);en.setDate(en.getDate()+6);return[st,en];}
  const [st,en]=wr(y,wn);
  const fil=decls.filter(d=>{const dt=new Date(d.date);return dt>=st&&dt<=new Date(en.getTime()+86399999);});
  const byE={};
  fil.forEach(d=>{if(!byE[d.employeId])byE[d.employeId]={};if(!byE[d.employeId][d.minerai])byE[d.employeId][d.minerai]={qte:0,cartons:0,grade:d.grade};byE[d.employeId][d.minerai].qte+=d.qte;byE[d.employeId][d.minerai].cartons+=(d.cartons||0);});
  const emps=Object.keys(byE).map(eid=>{
    const emp=comptes.find(c=>c.id===Number(eid));
    const mins=Object.entries(byE[eid]).map(([min,v])=>({minerai:min,...v}));
    const ts=mins.reduce((s,m)=>s+calcSalD(m.qte,m.cartons,m.minerai,m.grade),0);
    return{emp,mins,ts};
  }).filter(e=>!srch||(`${e.emp?.prenom} ${e.emp?.nom}`).toLowerCase().includes(srch.toLowerCase()));
  const fmtW=`${st.toISOString().slice(0,10)} → ${en.toISOString().slice(0,10)}`;
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:2}}>Récapitulatif hebdomadaire</div>
    <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Période : {fmtW}</div>
    <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:14,marginBottom:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <div><div style={{fontSize:9,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Semaine ISO</div><input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace"}} type="week" value={sem} onChange={e=>setSem(e.target.value)}/></div>
        <div><div style={{fontSize:9,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Recherche</div><input className="inp" value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Nom employé..."/></div>
        <div><div style={{fontSize:9,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Résumé</div><div style={{background:"rgba(212,160,23,.07)",border:`1px solid ${DQ.border}`,borderRadius:3,padding:"7px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:DQ.muted}}>{emps.length} emp · {fmt(emps.reduce((s,e)=>s+e.ts,0))} $</div></div>
      </div>
    </div>
    {emps.length===0&&<div className="empty" style={{padding:60}}>Aucune déclaration pour cette semaine</div>}
    {emps.map(({emp,mins,ts})=>(
      <div key={emp?.id} style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:3,background:`${CAT_COL[mins[0]?.minerai]||DQ.accent}22`,border:`1px solid ${CAT_COL[mins[0]?.minerai]||DQ.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:CAT_COL[mins[0]?.minerai]||DQ.accent}}>{emp?.id}</div>
          <div>
            <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:700,letterSpacing:1}}>{emp?.prenom} {emp?.nom}</span>
            <span style={{color:DQ.muted,fontSize:12,marginLeft:8,fontFamily:"'IBM Plex Mono',monospace"}}>#{emp?.id}</span>
            <div style={{fontSize:12,color:DQ.muted,marginTop:2}}>Salaires : <span style={{color:DQ.green,fontFamily:"'IBM Plex Mono',monospace"}}>{fmt(ts)} $</span></div>
          </div>
        </div>
        <div className="twrap">
          <table style={{minWidth:500}}>
            <thead><tr><th>Minerai</th><th>Grade</th><th>Cartons vendus</th><th style={{textAlign:"right"}}>Quantité</th><th style={{textAlign:"right"}}>Salaire</th></tr></thead>
            <tbody>{mins.map(m=>{const ok=QUOTAS[m.minerai]>0&&m.qte>=QUOTAS[m.minerai];const sal=calcSalD(m.qte,m.cartons,m.minerai,m.grade);return(
              <tr key={m.minerai} className="dqR">
                <td><span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:7,height:7,borderRadius:"50%",background:CAT_COL[m.minerai]}}/>{m.minerai}</span></td>
                <td style={{color:DQ.muted}}>{m.grade}</td>
                <td style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent2}}>{m.cartons>0?m.cartons:"—"}</td>
                <td style={{fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:ok?"#7dba65":DQ.text,fontWeight:ok?700:400}}>{fmt(m.qte)}{ok?" ✓":""}</td>
                <td style={{fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:DQ.green}}>{fmt(sal)} $</td>
              </tr>
            );})}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </>);
}

// ── Impôts ────────────────────────────────────────
function PageImpots({semaine,decls}){
  const [per,setPer]=useState("W"+(semaine?.num||"23"));
  const [c,setC]=useState({chiffreAffaires:0,autresEntrees:0,donsRecus:0,decoration:0,subventions:0,masseSalariale:59000,matieresPremières:4733,fraisAvocats:0,fraisComptables:0,locations:0,fraisVehicules:0,nourriture:0,donsEffectues:0,locsNonDed:0,vehiculesNonDed:0,autresNonDed:0,impots:0});
  const [show,setShow]=useState(true);
  const upd=k=>e=>setC(p=>({...p,[k]:Number(e.target.value)||0}));
  const weekCA=(semaine?.data||[]).reduce((s,m)=>s+(m.exports||0)*CARTON_RECAP,0);
  const vB=c.chiffreAffaires+c.autresEntrees+c.donsRecus+c.decoration+c.subventions+weekCA;
  const cD=c.masseSalariale+c.matieresPremières+c.fraisAvocats+c.fraisComptables+c.locations+c.fraisVehicules+c.nourriture+c.donsEffectues;
  const mI=vB-cD;const impB=mI>0?mI*0.25:0;
  const Row=({label,k,col})=>(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${DQ.border}`}}>
    <span style={{fontSize:13,color:col||DQ.text}}>{label}</span>
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      <input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",width:100,textAlign:"right",fontSize:12}} type="number" value={c[k]} onChange={upd(k)}/>
      <span style={{color:DQ.muted,fontSize:11}}>$</span>
    </div>
  </div>);
  return(<>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
      <div>
        <div style={{fontSize:9,color:"#d47070",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🔒 Direction — Confidentiel</div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2}}>Déclaration Périodique</div>
        <div style={{fontSize:11,color:DQ.muted,letterSpacing:1,textTransform:"uppercase"}}>Expertise Comptable & Fiscalité</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(212,160,23,.07)",border:`1px solid ${DQ.border}`,borderRadius:3,padding:"6px 12px"}}>
          <button style={{background:"none",border:"none",color:DQ.muted,cursor:"pointer",fontSize:18,lineHeight:1}} onClick={()=>setPer(p=>`W${Math.max(1,Number(p.slice(1))-1)}`)}>‹</button>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:500,fontSize:15,minWidth:80}}>{per} <span style={{color:DQ.muted,fontSize:12}}>2026</span></div><div style={{fontSize:9,color:DQ.muted,letterSpacing:1,textTransform:"uppercase"}}>Période</div></div>
          <button style={{background:"none",border:"none",color:DQ.muted,cursor:"pointer",fontSize:18,lineHeight:1}} onClick={()=>setPer(p=>`W${Number(p.slice(1))+1}`)}>›</button>
        </div>
        <button className="btnG" onClick={()=>setShow(p=>!p)}>{show?"Masquer":"Afficher"} analyses</button>
      </div>
    </div>
    {show&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
      {[[DQ.green,"↗","Volume d'affaires brut",fmt(vB)+" $US"],[DQ.blue,"↘","Charges déductibles",fmt(cD)+" $US"],[DQ.red,"◎","Marge imposable",fmt(mI)+" $US",mI<0?"#d47070":"#7dba65"]].map(([ic,ico,lbl,val,vc])=>(
        <div key={lbl} style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:4,background:ic+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ico}</div>
          <div><div style={{fontSize:9,color:DQ.muted,textTransform:"uppercase",letterSpacing:2}}>{lbl}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:500,color:vc||ic}}>{val}</div></div>
        </div>
      ))}
    </div>}
    {weekCA>0&&<div style={{background:DQ.dark,border:"1px solid rgba(212,160,23,.4)",borderRadius:4,padding:"12px 16px",marginBottom:14}}>
      <div style={{fontSize:9,letterSpacing:2,color:DQ.accent2,textTransform:"uppercase",marginBottom:6}}>📦 CA Cartons Sem.{semaine?.num} — importé automatiquement</div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,color:DQ.accent2,fontWeight:500}}>{fmt(weekCA)} $</div>
      <div style={{fontSize:11,color:DQ.muted,marginTop:4}}>{(semaine?.data||[]).reduce((s,m)=>s+(m.exports||0),0)} cartons × {CARTON_RECAP} $/carton</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:"#7dba65",textTransform:"uppercase",marginBottom:12,opacity:.8}}>🟢 Flux des revenus</div>
        {[["Chiffre d'affaires","chiffreAffaires"],["Autres entrées","autresEntrees"],["Dons reçus","donsRecus"],["Décoration","decoration"],["Subventions","subventions"]].map(([l,k])=><Row key={k} label={l} k={k}/>)}
      </div>
      <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:"#7eb8c9",textTransform:"uppercase",marginBottom:12,opacity:.8}}>🔵 Charges déductibles</div>
        {[["Masse Salariale","masseSalariale"],["Matières premières","matieresPremières"],["Frais d'Avocats","fraisAvocats"],["Frais Comptables","fraisComptables"],["Locations","locations"],["Frais véhicules","fraisVehicules"],["Nourriture","nourriture"],["Dons effectués","donsEffectues"]].map(([l,k])=><Row key={k} label={l} k={k}/>)}
      </div>
      <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:"#d47070",textTransform:"uppercase",marginBottom:12,opacity:.8}}>🔴 Frais non déductibles</div>
        {[["Locations n.d.","locsNonDed"],["Véhicules n.d.","vehiculesNonDed"],["Autres n.d.","autresNonDed"],["IMPÔTS","impots"]].map(([l,k])=><Row key={k} label={l} k={k} col="#d47070"/>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{fontSize:18}}>🎁</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:500,fontSize:12,letterSpacing:1}}>TAXE SUR LIBÉRALITÉS</span></div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${DQ.border}`}}><span>Total dons reçus</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{fmt(c.donsRecus)} $</span></div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${DQ.border}`}}><span>Taux appliqué</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>0%</span></div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}><span style={{fontWeight:700}}>Redevance calculée</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,color:DQ.accent2,fontWeight:500}}>0 $</span></div>
      </div>
      <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{fontSize:18}}>◎</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:500,fontSize:12,letterSpacing:1}}>BILAN FISCAL FINAL</span></div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${DQ.border}`,color:DQ.muted}}><span>Impôt sur bénéfices</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{fmt(impB)} $</span></div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${DQ.border}`,color:DQ.muted}}><span>Impôt sur libéralités</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>0 $</span></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:`1px solid ${DQ.border}`}}>
          <div><div style={{fontSize:9,color:DQ.muted,letterSpacing:2,textTransform:"uppercase"}}>Engagement total</div><div style={{fontWeight:700,fontSize:14,letterSpacing:1}}>À ACQUITTER SANS DÉLAI</div></div>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:500,color:DQ.accent}}>{fmt(impB)} $</span>
        </div>
      </div>
    </div>
  </>);
}

// ── Équipe (Comptes + Recrutement fusionnés) ─────
function PageEquipe({roster,setRoster,semaine,setSemaine,weeks,setWeeks,curIdx,comptes,setComptes}){
  const [srch,setSrch]=useState("");
  const [fc,setFc]=useState("all");
  const [showNew,setShowNew]=useState(false);
  const [editId,setEditId]=useState(null);  // id compte en cours d'édition
  const [form,setForm]=useState({prenom:"",nom:"",login:"",mdp:"",role:"employe",minerai:"Charbon",grade:"Expérimenté",casier:""});
  const [err,setErr]=useState("");
  const [ok,setOk]=useState(false);
  const DGO=["Patronne","Co Patron","Lead Manager","Manager","RH"];
  const GFO=["Expérimenté","Confirmé","Stagiaire"];

  // Construit la vue fusionnée : un objet par membre du roster enrichi avec le compte si existant
  const membres=useMemo(()=>{
    return roster.map(r=>{
      const compte=comptes.find(c=>c.login&&(
        (c.nom||"").toLowerCase()===r.nom.split(" ").slice(-1)[0].toLowerCase()||
        `${c.prenom} ${c.nom}`.toLowerCase()===r.nom.toLowerCase()
      ));
      return {...r, compte: compte||null};
    }).filter(m=>{
      const fc2=fc==="all"||m.cat===fc;
      const fs=!srch||(m.nom||"").toLowerCase().includes(srch.toLowerCase())||(m.casier||"").includes(srch);
      return fc2&&fs;
    }).sort((a,b)=>CAT_ORDER.indexOf(a.cat)-CAT_ORDER.indexOf(b.cat));
  },[roster,comptes,fc,srch]);

  function openNew(){
    setForm({prenom:"",nom:"",login:"",mdp:"",role:"employe",minerai:"Charbon",grade:"Expérimenté",casier:""});
    setErr("");setShowNew(true);setEditId(null);
  }

  function openEdit(r){
    const c=comptes.find(cc=>`${cc.prenom} ${cc.nom}`.toLowerCase()===r.nom.toLowerCase()||
      (cc.nom||"").toLowerCase()===r.nom.split(" ").slice(-1)[0].toLowerCase());
    setForm({
      prenom: c?.prenom||r.nom.split(" ")[0]||"",
      nom:    c?.nom||r.nom.split(" ").slice(1).join(" ")||r.nom,
      login:  c?.login||"",
      mdp:    c?.mdp||"",
      role:   c?.role||"employe",
      minerai:r.cat!=="Direction"?r.cat:"",
      grade:  r.grade,
      casier: r.casier,
    });
    setEditId(c?.id||null);
    setErr("");setShowNew(true);
  }

  function save(){
    if(!form.prenom||!form.nom||!form.casier){setErr("Prénom, nom et casier requis");return;}
    if(!form.login||!form.mdp){setErr("Login et mot de passe requis");return;}

    const nomComplet=`${form.prenom} ${form.nom}`;
    const cat=form.role==="direction"?"Direction":form.minerai||"Charbon";
    const grade=form.grade;

    // Vérif login unique (sauf si on édite ce même compte)
    const loginUsed=comptes.find(c=>c.login===form.login&&c.id!==editId);
    if(loginUsed){setErr("Ce login est déjà utilisé");return;}

    // 1. Mettre à jour ou créer le compte
    if(editId){
      setComptes(p=>p.map(c=>c.id===editId?{...c,prenom:form.prenom,nom:form.nom,login:form.login,mdp:form.mdp,role:form.role,minerai:form.role==="employe"?form.minerai:null,grade:form.role==="employe"?form.grade:null}:c));
    } else {
      const newId=Math.max(...comptes.map(c=>c.id),0)+1;
      setComptes(p=>[...p,{id:newId,prenom:form.prenom,nom:form.nom,login:form.login,mdp:form.mdp,role:form.role,minerai:form.role==="employe"?form.minerai:null,grade:form.role==="employe"?form.grade:null}]);
    }

    // 2. Mettre à jour ou créer dans le roster
    const existingRoster=roster.find(r=>r.casier===form.casier);
    if(existingRoster){
      setRoster(r=>r.map(m=>m.casier===form.casier?{...m,nom:nomComplet,cat,grade}:m));
    } else {
      setRoster(r=>[...r,{casier:form.casier,cat,grade,nom:nomComplet}]);
    }

    // 3. Mettre à jour ou créer la ligne dans la semaine courante
    const ligne={casier:form.casier,categorie:cat,grade,nom:nomComplet,menus:false,exports:0,quantite:0,frais:0,prime:0,status:"",commentaire:""};
    setWeeks(ws=>ws.map((w,i)=>{
      if(i!==curIdx) return w;
      const exists=w.data.find(m=>m.casier===form.casier);
      if(exists) return {...w,data:w.data.map(m=>m.casier===form.casier?{...m,nom:nomComplet,categorie:cat,grade}:m)};
      return {...w,data:[...w.data,ligne]};
    }));

    setOk(true);setShowNew(false);
    setTimeout(()=>setOk(false),3000);
  }

  function deleteMember(casier){
    const r=roster.find(m=>m.casier===casier);
    if(!r) return;
    setRoster(p=>p.filter(m=>m.casier!==casier));
    // Supprimer le compte associé
    const c=comptes.find(cc=>`${cc.prenom} ${cc.nom}`.toLowerCase()===r.nom.toLowerCase()||
      (cc.nom||"").toLowerCase()===r.nom.split(" ").slice(-1)[0].toLowerCase());
    if(c) setComptes(p=>p.filter(x=>x.id!==c.id));
    // Retirer de la semaine
    setWeeks(ws=>ws.map((w,i)=>i===curIdx?{...w,data:w.data.filter(m=>m.casier!==casier)}:w));
  }

  const rcCol={direction:DQ.red,gestion:DQ.accent,employe:DQ.blue};
  const rcLbl={direction:"Direction",gestion:"Gestion",employe:"Employé"};
  const groups={};CAT_ORDER.forEach(c=>{groups[c]=membres.filter(m=>m.cat===c);});

  return(<>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
      <div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2}}>Équipe</div>
        <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase"}}>{roster.length} membres · {comptes.filter(c=>c.role==="employe").length} comptes employés</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {ok&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:DQ.green,padding:"6px 10px",background:"rgba(90,140,74,.1)",border:"1px solid rgba(90,140,74,.3)",borderRadius:3}}>✓ Sauvegardé</span>}
        <button className="btnP" onClick={openNew}>+ Nouveau membre</button>
      </div>
    </div>

    {/* Filtres */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      {["all",...CAT_ORDER].map(c=><button key={c} className={`fbtn c${c.replace(/ /g,"")}${fc===c?" on":""}`} onClick={()=>setFc(c)}>{c==="all"?"Tous":c}</button>)}
      <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(212,160,23,.06)",border:`1px solid ${DQ.border}`,borderRadius:3,padding:"4px 10px",flex:1,maxWidth:260,marginLeft:6}}>
        <span style={{color:DQ.muted,fontSize:13}}>🔍</span>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Nom, casier..." style={{background:"none",border:"none",color:DQ.text,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,outline:"none",width:"100%"}}/>
      </div>
    </div>

    {/* Grille par catégorie */}
    {CAT_ORDER.map(cat=>{
      const g=groups[cat]||[];if(!g.length)return null;
      return(<div key={cat}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:3,textTransform:"uppercase",padding:"10px 0 5px",color:DQ.muted,borderBottom:`1px solid ${DQ.border}`,marginBottom:10,marginTop:14,display:"flex",alignItems:"center",gap:7}}>
          <span style={{width:9,height:9,borderRadius:"50%",background:CAT_COL[cat]}}/>
          {cat}
          <span style={{marginLeft:"auto"}}>{g.length} membre{g.length>1?"s":""}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10,marginBottom:8}}>
          {g.map(r=>{
            const c=r.compte;
            const inSem=!!(semaine?.data||[]).find(m=>m.casier===r.casier);
            return(<div key={r.casier} style={{background:DQ.dark,border:`1px solid ${c?DQ.border:"rgba(212,160,23,.1)"}`,borderRadius:5,padding:"12px 14px",position:"relative",transition:"border-color .15s"}}>
              {/* Header de la carte */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:40,height:40,borderRadius:4,background:CAT_COL[r.cat]||"#666",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:500,color:"#fff",flexShrink:0}}>{r.casier}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:DQ.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.nom}</div>
                  <div style={{fontSize:11,color:DQ.muted,marginTop:1}}>{r.grade} · <span style={{color:CAT_COL[r.cat]}}>{r.cat}</span></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  {c&&<span style={{display:"inline-block",padding:"1px 6px",borderRadius:2,fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:(rcCol[c.role]||DQ.muted)+"22",color:rcCol[c.role]||DQ.muted,border:`1px solid ${(rcCol[c.role]||DQ.muted)}44`}}>{rcLbl[c.role]||c.role}</span>}
                  {inSem&&<span style={{fontSize:9,color:DQ.green,fontFamily:"'IBM Plex Mono',monospace",background:"rgba(90,140,74,.12)",padding:"1px 5px",borderRadius:2}}>✓ Sem.</span>}
                </div>
              </div>
              {/* Infos compte */}
              {c?<div style={{background:DQ.darker,borderRadius:3,padding:"8px 10px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:DQ.muted}}>Login</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent}}>{c.login}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                  <span style={{color:DQ.muted}}>Mot de passe</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.muted,letterSpacing:2}}>••••••••</span>
                </div>
              </div>:<div style={{background:"rgba(212,160,23,.04)",border:"1px dashed rgba(212,160,23,.2)",borderRadius:3,padding:"6px 10px",marginBottom:10,fontSize:11,color:DQ.muted,textAlign:"center"}}>Pas de compte — cliquez Modifier</div>}
              {/* Actions */}
              <div style={{display:"flex",gap:6}}>
                <button className="btnG" style={{flex:1,fontSize:11,padding:"4px 0",textAlign:"center"}} onClick={()=>openEdit(r)}>✏ Modifier</button>
                <button style={{background:"transparent",border:"1px solid rgba(184,64,64,.4)",color:"#d47070",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"4px 10px",borderRadius:3,cursor:"pointer"}} onClick={()=>deleteMember(r.casier)}>✕</button>
              </div>
            </div>);
          })}
        </div>
      </div>);
    })}

    {!membres.length&&<div className="empty" style={{padding:60}}>Aucun résultat</div>}

    {/* Modal création / édition */}
    {showNew&&<div className="ov"><div className="modal" style={{width:520,maxWidth:"95vw"}}>
      <div className="mhdr">
        <span>{editId?"✏ Modifier le membre":"+ Nouveau membre"}</span>
        <button className="cbtn" onClick={()=>setShowNew(false)}>×</button>
      </div>
      <div className="mbody" style={{maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:DQ.accent,textTransform:"uppercase",marginBottom:12,opacity:.8}}>Identité</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Prénom *</label><input className="inp" value={form.prenom} onChange={e=>setForm(p=>({...p,prenom:e.target.value}))} placeholder="Jean"/></div>
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Nom *</label><input className="inp" value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Dupont"/></div>
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Casier *</label><input className="inp" value={form.casier} onChange={e=>setForm(p=>({...p,casier:e.target.value}))} placeholder="Ex: 42"/></div>
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Rôle</label>
            <select className="sel" style={{width:"100%"}} value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
              <option value="employe">Employé</option><option value="gestion">Gestion</option><option value="direction">Direction</option>
            </select>
          </div>
        </div>

        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:DQ.accent,textTransform:"uppercase",marginBottom:12,opacity:.8,borderTop:`1px solid ${DQ.border}`,paddingTop:14}}>Poste</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {form.role!=="direction"&&<div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Minerai</label>
            <select className="sel" style={{width:"100%"}} value={form.minerai} onChange={e=>setForm(p=>({...p,minerai:e.target.value}))}>
              {MINERAIS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>}
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Grade</label>
            <select className="sel" style={{width:"100%"}} value={form.grade} onChange={e=>setForm(p=>({...p,grade:e.target.value}))}>
              {(form.role==="direction"?["Patronne","Co Patron","Lead Manager","Manager","RH"]:["Expérimenté","Confirmé","Stagiaire"]).map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:DQ.accent,textTransform:"uppercase",marginBottom:12,opacity:.8,borderTop:`1px solid ${DQ.border}`,paddingTop:14}}>Identifiants de connexion</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Login *</label><input className="inp" value={form.login} onChange={e=>setForm(p=>({...p,login:e.target.value}))} placeholder="jean.dupont"/></div>
          <div><label style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",display:"block",marginBottom:4}}>Mot de passe *</label><input className="inp" type="password" value={form.mdp} onChange={e=>setForm(p=>({...p,mdp:e.target.value}))} placeholder="••••••••"/></div>
        </div>

        {err&&<div style={{color:"#d47070",fontSize:12,fontFamily:"'IBM Plex Mono',monospace",marginTop:12}}>{err}</div>}
      </div>
      <div className="mftr">
        <button className="btnG" onClick={()=>setShowNew(false)}>Annuler</button>
        <button className="btnP" onClick={save}>{editId?"✓ Enregistrer":"+ Créer le membre"}</button>
      </div>
    </div></div>}
  </>);
}

// ── Tchat ─────────────────────────────────────────
function PageTchat({user,comptes}){
  const [msgs,setMsgs]=useState(CHAT_INIT);
  const [txt,setTxt]=useState("");
  const bot=useRef(null);
  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  function send(){
    if(!txt.trim())return;
    setMsgs(p=>[...p,{id:Date.now(),from:user.id,text:txt.trim(),date:new Date().toISOString(),role:user.role}]);
    setTxt("");
  }
  const rcCol={direction:DQ.red,gestion:DQ.accent,employe:DQ.blue};
  const rcLbl={direction:"Direction",gestion:"Gestion",employe:"Employé"};
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:2}}>Tchat interne</div>
    <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Davis Quartz Mining Co.</div>
    <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,display:"flex",flexDirection:"column",height:"62vh"}}>
      <div style={{flex:1,overflowY:"auto",padding:16}}>
        {msgs.map(msg=>{
          const sndr=comptes.find(c=>c.id===msg.from);
          const isMe=msg.from===user.id;
          const col=rcCol[msg.role]||DQ.muted;
          return(<div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:10,marginBottom:14,alignItems:"flex-end"}}>
            <div style={{width:32,height:32,borderRadius:3,background:`${col}33`,border:`1px solid ${col}55`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:col,flexShrink:0}}>{sndr?.id||"?"}</div>
            <div style={{maxWidth:"65%"}}>
              <div style={{fontSize:10,color:DQ.muted,fontFamily:"'IBM Plex Mono',monospace",marginBottom:3,textAlign:isMe?"right":"left"}}>
                <span style={{color:col,fontWeight:600}}>{sndr?.prenom} {sndr?.nom}</span>
                <span style={{marginLeft:6}}>{fmtDate(msg.date)}</span>
                <span style={{display:"inline-block",padding:"1px 5px",borderRadius:2,fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:col+"22",color:col,border:`1px solid ${col}44`,marginLeft:6}}>{rcLbl[msg.role]||msg.role}</span>
              </div>
              <div style={{background:isMe?`${DQ.accent}18`:DQ.darker,border:`1px solid ${isMe?DQ.accent+"44":DQ.border}`,borderRadius:isMe?"8px 8px 2px 8px":"8px 8px 8px 2px",padding:"10px 14px",fontSize:13,color:DQ.text,lineHeight:1.5}}>{msg.text}</div>
            </div>
          </div>);
        })}
        <div ref={bot}/>
      </div>
      <div style={{borderTop:`1px solid ${DQ.border}`,padding:"12px 16px",display:"flex",gap:10}}>
        <input className="inp" style={{flex:1}} value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Écrire un message..." onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button className="btnP" onClick={send}>Envoyer ➤</button>
      </div>
    </div>
  </>);
}

// ── Déclarer (employé) ────────────────────────────
function PageDeclarer({user,onAdd}){
  const [qte,setQte]=useState("");
  const [ventesC,setVentesC]=useState("");   // vente de cartons → exports + bonus salaire (tous)
  const [cartNV,setCartNV]=useState("");      // cartons produits non vendus (Or uniquement, info seule)
  const [ok,setOk]=useState(false);
  const isOr=user.minerai==="Or";
  const prix=(PRICES[user.minerai]||{})[user.grade]||0;
  const qN=Number(qte)||0;
  const vN=Number(ventesC)||0;   // ventes cartons = exports ET bonus salaire
  const nvN=Number(cartNV)||0;   // non vendus = info seulement, pas d'impact calcul
  // Le bonus salaire est basé sur les cartons VENDUS (vN)
  const sal=calcSalD(qN,vN,user.minerai,user.grade);
  const quota=QUOTAS[user.minerai]||0;
  const qOk=quota>0&&qN>=quota;
  const col=CAT_COL[user.minerai]||DQ.accent;
  function sub(){
    if(!qN||qN<=0)return;
    // cartons = ventes (pour bonus salaire), ventesCartons = exports semaine
    onAdd({employeId:user.id,minerai:user.minerai,grade:user.grade,qte:qN,cartons:vN,ventesCartons:vN});
    setOk(true);setQte("");setVentesC("");setCartNV("");
    setTimeout(()=>setOk(false),3000);
  }
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:2}}>Déclarer une production</div>
    <div style={{fontSize:11,color:DQ.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:20}}>Saisissez votre production de la semaine</div>
    <div style={{maxWidth:520}}>
      <div style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:16}}>

        {/* Badge minerai */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,padding:"10px 12px",background:`${col}11`,border:`1px solid ${col}33`,borderRadius:3}}>
          <span style={{width:10,height:10,borderRadius:"50%",background:col,flexShrink:0}}/>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:500,color:col}}>{user.minerai}</span>
          <span style={{fontSize:12,color:DQ.muted,marginLeft:4}}>{user.grade} · {prix} $/unité</span>
        </div>

        {/* Quantité produite */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:5}}>Quantité produite *</div>
          <input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace"}} type="number" min="1" value={qte} onChange={e=>setQte(e.target.value)} placeholder={`Ex: ${fmt(quota)}`}/>
          {quota>0&&<div style={{fontSize:11,color:qOk?"#7dba65":DQ.muted,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>Quota : {fmt(quota)}{qOk&&" ✓ ATTEINT"}</div>}
        </div>

        {/* Vente de cartons — tous les minerais */}
        <div style={{marginBottom:isOr?14:0}}>
          <div style={{fontSize:9,letterSpacing:2,color:DQ.accent2,textTransform:"uppercase",marginBottom:5}}>
            Vente de cartons
          </div>
          <input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace",borderColor:"rgba(200,121,42,.4)"}} type="number" min="0" value={ventesC} onChange={e=>setVentesC(e.target.value)} placeholder="Nb cartons vendus"/>
          <div style={{fontSize:11,color:DQ.muted,marginTop:4}}>
            S'ajoute aux <b style={{color:DQ.accent2}}>Exports</b> du tableau semaine
            {" · "}100 vendus = <b style={{color:DQ.accent}}>+2 500 $</b> bonus salaire
          </div>
        </div>

        {/* Cartons produits non vendus — Or uniquement */}
        {isOr&&<div style={{marginBottom:0,marginTop:14,padding:"10px 12px",background:"rgba(212,160,23,.04)",border:`1px solid rgba(212,160,23,.15)`,borderRadius:3}}>
          <div style={{fontSize:9,letterSpacing:2,color:DQ.accent,textTransform:"uppercase",marginBottom:5}}>
            Cartons produits non vendus
            <span style={{color:DQ.muted,marginLeft:6,fontSize:9,fontWeight:400,letterSpacing:0,textTransform:"none"}}>Or uniquement — informatif</span>
          </div>
          <input className="inp" style={{fontFamily:"'IBM Plex Mono',monospace"}} type="number" min="0" value={cartNV} onChange={e=>setCartNV(e.target.value)} placeholder="Nb cartons en stock"/>
          <div style={{fontSize:11,color:DQ.muted,marginTop:4}}>Non comptabilisé dans les exports ni le salaire</div>
        </div>}

        {/* Récap */}
        {(qN>0||vN>0)&&<div style={{background:DQ.darker,borderRadius:3,padding:12,marginBottom:14,marginTop:14}}>
          {qN>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${DQ.border}`}}>
            <span style={{color:DQ.muted,fontSize:12}}>Quantité</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",color:qOk?"#7dba65":DQ.text,fontWeight:qOk?700:400}}>{fmt(qN)}{qOk?" ✓":""}</span>
          </div>}
          {vN>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${DQ.border}`}}>
            <span style={{color:DQ.muted,fontSize:12}}>Vente cartons → Exports</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent2}}>{vN} carton{vN>1?"s":""}</span>
          </div>}
          {vN>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${DQ.border}`}}>
            <span style={{color:DQ.muted,fontSize:12}}>Bonus salaire cartons</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent}}>+{fmt(Math.floor(vN/100)*2500)} $</span>
          </div>}
          {isOr&&nvN>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${DQ.border}`}}>
            <span style={{color:DQ.muted,fontSize:12}}>Cartons non vendus (stock)</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.muted}}>{nvN} carton{nvN>1?"s":""}</span>
          </div>}
          {qN>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
            <span style={{fontWeight:700}}>Salaire estimé</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,color:DQ.accent,fontWeight:500}}>{fmt(sal)} $</span>
          </div>}
        </div>}

        {ok&&<div style={{color:DQ.green,fontSize:13,fontFamily:"'IBM Plex Mono',monospace",marginBottom:10}}>✓ Déclaration enregistrée — tableau semaine mis à jour !</div>}
        <button className="btnP" onClick={sub}>⛏ Valider la déclaration</button>
      </div>
    </div>
  </>);
}

// ── Mes déclarations (employé) ────────────────────
function PageMesDecls({user,decls}){
  const miennes=decls.filter(d=>d.employeId===user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const totSal=miennes.reduce((s,d)=>s+calcSalD(d.qte,d.cartons,d.minerai,d.grade),0);
  const totQte=miennes.reduce((s,d)=>s+d.qte,0);
  const col=CAT_COL[user.minerai]||DQ.accent;
  return(<>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:2,marginBottom:16}}>Mes déclarations</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
      {[[col,"⛏","Total quantité",fmt(totQte)],[DQ.green,"💰","Salaires estimés",fmt(totSal)+" $"],[DQ.accent,"📋","Déclarations",miennes.length]].map(([ic,ico,lbl,val])=>(
        <div key={lbl} style={{background:DQ.dark,border:`1px solid ${DQ.border}`,borderRadius:4,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:4,background:ic+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ico}</div>
          <div><div style={{fontSize:9,color:DQ.muted,textTransform:"uppercase",letterSpacing:2}}>{lbl}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:500,color:ic}}>{val}</div></div>
        </div>
      ))}
    </div>
    <div className="twrap">
      <table style={{minWidth:600}}>
        <thead><tr>{["Date","Minerai","Grade","Quantité","Cartons","Salaire estimé"].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {miennes.length===0?<tr><td colSpan={6} className="empty">Aucune déclaration</td></tr>
          :miennes.map(d=>{const sal=calcSalD(d.qte,d.cartons,d.minerai,d.grade);const ok=QUOTAS[d.minerai]>0&&d.qte>=QUOTAS[d.minerai];return(
            <tr key={d.id} className="dqR">
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{fmtDate(d.date)}</td>
              <td><span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:7,height:7,borderRadius:"50%",background:CAT_COL[d.minerai]}}/>{d.minerai}</span></td>
              <td style={{color:DQ.muted}}>{d.grade}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:ok?"#7dba65":DQ.text,fontWeight:ok?700:400}}>{fmt(d.qte)}{ok?" ✓":""}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent2}}>{d.cartons>0?d.cartons:"—"}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.green,fontWeight:500}}>{fmt(sal)} $</td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  </>);
}

// ── Sidebar ───────────────────────────────────────
function Sidebar({user,page,setPage,semaine,roster}){
  const role=user.role;
  const navDir=[{k:"semaine",l:"Semaine",i:"📊"},{k:"equipe",l:"Équipe",i:"👥"},{k:"archives",l:"Archives",i:"🗄"},{k:"avertissements",l:"Avertissements",i:"⚠️"},{k:"declarations",l:"Déclarations",i:"📋"},{k:"recap",l:"Récapitulatif",i:"📈"},{k:"impots",l:"Impôts",i:"🔒"},{k:"tchat",l:"Tchat",i:"💬"}];
  const navGest=navDir.filter(n=>n.k!=="impots");
  const navEmp=[{k:"declarer",l:"Déclarer",i:"⛏"},{k:"mes-decls",l:"Mes déclarations",i:"📋"},{k:"tchat",l:"Tchat",i:"💬"}];
  const navs={direction:navDir,gestion:navGest,employe:navEmp};
  const data=semaine?.data||[];
  const isStaff=role==="direction"||role==="gestion";
  const totSal=data.reduce((s,m)=>s+calcSal(m),0);
  const totCA=data.reduce((s,m)=>s+(m.exports||0)*CARTON_RECAP,0);
  const totF=data.reduce((s,m)=>s+(m.frais||0),0);
  const totP=data.reduce((s,m)=>s+(m.prime||0),0);
  return(
    <aside style={{width:220,minWidth:220,background:`linear-gradient(180deg,${DQ.dark},#221407)`,borderRight:`1px solid ${DQ.border}`,padding:"18px 0",display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0}}>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:3,color:DQ.accent,textTransform:"uppercase",padding:"0 16px 8px",opacity:.8,display:"block"}}>Navigation</span>
      {(navs[role]||[]).map(n=><div key={n.k} className={`dq-nav${page===n.k?" act":""}`} onClick={()=>setPage(n.k)}><span>{n.i}</span>{n.l}</div>)}
      {isStaff&&semaine&&<>
        <div style={{borderTop:`1px solid ${DQ.border}`,margin:"12px 0 8px"}}/>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:3,color:DQ.accent,textTransform:"uppercase",padding:"0 16px 6px",opacity:.8}}>Effectif</div>
        <div className="srow2"><span style={{color:DQ.muted}}>Total membres</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.accent,fontWeight:500,fontSize:15}}>{roster.length}</span></div>
        {[["Expérimenté",roster.filter(r=>r.grade==="Expérimenté").length],["Confirmé",roster.filter(r=>r.grade==="Confirmé").length],["Stagiaire",roster.filter(r=>r.grade==="Stagiaire").length]].map(([l,v])=>(<div key={l} className="srow2"><span style={{color:DQ.muted}}>{l}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:DQ.text}}>{v}</span></div>))}
        <div style={{borderTop:`1px solid ${DQ.border}`,margin:"8px 0"}}/>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:3,color:DQ.accent,textTransform:"uppercase",padding:"0 16px 6px",opacity:.8}}>Effectif minerai</div>
        {["Charbon","Fer","Cuivre","Or","Aluminium"].map(cat=>{
          const mb=data.filter(m=>m.categorie===cat);
          const tot=mb.length,max=CAT_MAX[cat]||1,full=tot>=max,pct=Math.min(100,Math.round((tot/max)*100));
          const exp=mb.filter(m=>m.grade==="Expérimenté").length,conf=mb.filter(m=>m.grade==="Confirmé").length,stag=mb.filter(m=>m.grade==="Stagiaire").length;
          return(<div key={cat} style={{padding:"4px 16px",marginBottom:5}}>
            <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12,marginBottom:3}}><span style={{width:7,height:7,borderRadius:"50%",background:CAT_COL[cat],flexShrink:0,display:"inline-block"}}/><span style={{flex:1,color:DQ.text}}>{cat}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:full?"#d47070":DQ.accent}}>{tot}/{max}</span></div>
            <div className="eff-bw"><div className="eff-b" style={{width:pct+"%",background:full?"#B84040":CAT_COL[cat]}}/></div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{exp>0&&<span className="eff-gp">Exp:{exp}</span>}{conf>0&&<span className="eff-gp">Conf:{conf}</span>}{stag>0&&<span className="eff-gp">Stag:{stag}</span>}{full&&<span className="eff-gp" style={{color:"#d47070",borderColor:"rgba(184,64,64,.4)"}}>COMPLET</span>}</div>
          </div>);
        })}
        <div style={{borderTop:`1px solid ${DQ.border}`,margin:"8px 0"}}/>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:3,color:DQ.accent,textTransform:"uppercase",padding:"0 16px 6px",opacity:.8}}>Semaine courante</div>
        <div className="sbox"><div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>Total Salaires</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:500,color:DQ.accent}}>{fmt(totSal)} $</div></div>
        <div className="sbox"><div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>CA Carton</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:500,color:DQ.accent2}}>{fmt(totCA)} $</div></div>
        <div className="sbox"><div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>Notes de Frais</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:500,color:DQ.accent}}>{fmt(totF)} $</div></div>
        <div className="sbox"><div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:3}}>Primes</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:500,color:"#ce93d8"}}>{fmt(totP)} $</div></div>
        <div style={{borderTop:`1px solid ${DQ.border}`,margin:"8px 0"}}/>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:3,color:DQ.accent,textTransform:"uppercase",padding:"0 16px 6px",opacity:.8}}>Status semaine</div>
        {[["Présents",data.filter(m=>m.status!=="Absent"&&m.status!=="Licencié").length,DQ.text],["Absents",data.filter(m=>m.status==="Absent").length,DQ.blue],["Avert.",data.filter(m=>m.status==="Avertissement").length,DQ.accent],["Primes",data.filter(m=>m.status==="Prime").length,"#ce93d8"],["Nouveaux",data.filter(m=>m.status==="Nouveau").length,DQ.green]].map(([l,v,c])=>(<div key={l} className="srow2"><span style={{color:DQ.muted}}>{l}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:c}}>{v}</span></div>))}
      </>}
      {role==="employe"&&user?.minerai&&<div style={{margin:"16px 12px 0",padding:10,background:"rgba(212,160,23,.07)",border:`1px solid ${DQ.border}`,borderRadius:3}}><div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:4}}>Minerai affilié</div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:CAT_COL[user.minerai],flexShrink:0}}/><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:CAT_COL[user.minerai],fontWeight:500}}>{user.minerai}</span></div><div style={{fontSize:11,color:DQ.muted,marginTop:3}}>{user.grade}</div>{user.minerai==="Or"&&<div style={{fontSize:10,color:DQ.accent2,marginTop:3}}>+ Exports Cartons</div>}</div>}
    </aside>
  );
}

// ── Login ─────────────────────────────────────────
function Login({comptes,onLogin}){
  const [login,setLogin]=useState("");const [mdp,setMdp]=useState("");const [err,setErr]=useState("");
  function go(){const c=comptes.find(x=>x.login===login&&x.mdp===mdp);if(c)onLogin(c);else{setErr("⚠ Identifiants incorrects");setTimeout(()=>setErr(""),3000);}}
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,background:`radial-gradient(ellipse at 50% 30%,${DQ.dark},${DQ.darker} 70%)`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(160deg,${DQ.mid},${DQ.dark})`,border:"1px solid rgba(212,160,23,.35)",borderRadius:8,padding:"36px 40px",width:380,boxShadow:"0 20px 60px rgba(0,0,0,.7)"}}>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,letterSpacing:5,textTransform:"uppercase",textAlign:"center",color:DQ.white,marginBottom:6}}>
          <span style={{color:DQ.accent,opacity:.6,fontSize:11,verticalAlign:"middle",margin:"0 8px"}}>◆</span>DAVIS <span style={{color:DQ.accent}}>QUARTZ</span><span style={{color:DQ.accent,opacity:.6,fontSize:11,verticalAlign:"middle",margin:"0 8px"}}>◆</span>
        </div>
        <div style={{textAlign:"center",color:DQ.muted,fontSize:12,letterSpacing:2,textTransform:"uppercase",marginBottom:24}}>Système de Gestion</div>
        <div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginBottom:5}}>Identifiant</div>
        <input className="inp" value={login} onChange={e=>setLogin(e.target.value)} placeholder="Login" onKeyDown={e=>e.key==="Enter"&&go()}/>
        <div style={{fontSize:9,letterSpacing:2,color:DQ.muted,textTransform:"uppercase",marginTop:12,marginBottom:5}}>Mot de passe</div>
        <input className="inp" type="password" value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
        {err&&<div style={{color:"#d47070",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,textAlign:"center",marginTop:8}}>{err}</div>}
        <button className="btnP" style={{width:"100%",marginTop:20,padding:11,fontSize:14}} onClick={go}>⛏ Accéder</button>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {[{l:"direction",r:"Direction"},{l:"gestion",r:"Gestion"},{l:"jesse",r:"Employé (Or)"},{l:"adler",r:"Employé (Or)"}].map(x=>(
            <button key={x.l} onClick={()=>setLogin(x.l)} style={{flex:1,background:"rgba(212,160,23,.07)",border:`1px solid ${DQ.border}`,borderRadius:3,color:DQ.muted,fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",padding:7,cursor:"pointer"}}>{x.r}</button>
          ))}
        </div>
        <div style={{marginTop:12,padding:10,background:"rgba(212,160,23,.04)",border:`1px solid ${DQ.border}`,borderRadius:3,fontSize:11,color:DQ.muted,fontFamily:"'IBM Plex Mono',monospace"}}>
          <div style={{color:DQ.accent,letterSpacing:1,marginBottom:4}}>COMPTES DÉMO</div>
          <div>direction/admin · gestion/admin · jesse/emp · adler/emp</div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [page,setPage]=useState(null);
  const [comptes,setComptes]=useState(COMPTES_INIT);
  const [roster,setRoster]=useState(ROSTER_FULL);
  const [decls,setDecls]=useState(DECLS_INIT);
  const initWeek={num:"23",date:today(),locked:false,data:ROSTER_FULL.map(r=>mkRow(r))};
  const [weeks,setWeeks]=useState([initWeek]);
  const [curIdx,setCurIdx]=useState(0);
  const semaine=weeks[curIdx]||initWeek;
  function setSemaine(fn){setWeeks(ws=>ws.map((w,i)=>i===curIdx?(typeof fn==="function"?fn(w):fn):w));}

  function onLogin(u){setUser(u);setPage({direction:"equipe",gestion:"equipe",employe:"declarer"}[u.role]||"equipe");}
  function onLogout(){setUser(null);setPage(null);}
  function addDecl({employeId,minerai,grade,qte,cartons,ventesCartons}){
    // 1. Ajoute la déclaration dans la liste
    setDecls(p=>[...p,{id:Math.max(...p.map(d=>d.id))+1,date:new Date().toISOString(),employeId,minerai,grade,qte,cartons}]);
    // 2. Répercute dans le tableau semaine
    const emp=comptes.find(c=>c.id===employeId);
    if(!emp) return;
    // Cherche la ligne dans la semaine : match par nom (prénom + nom)
    const nomComplet=`${emp.prenom} ${emp.nom}`.toLowerCase();
    setWeeks(ws=>ws.map((w,i)=>{
      if(i!==curIdx) return w;
      let matched=false;
      const newData=w.data.map(m=>{
        const mNom=(m.nom||"").toLowerCase();
        // Match si le nom de la ligne contient prénom ET nom de l'employé
        const match=mNom.includes(emp.prenom.toLowerCase())&&mNom.includes(emp.nom.toLowerCase());
        if(!match) return m;
        matched=true;
        return{
          ...m,
          quantite:(m.quantite||0)+qte,
          exports:(m.exports||0)+(ventesCartons||0),
        };
      });
      return {...w,data:newData};
    }));
  }

  if(!user) return <><style>{CSS}</style><Login comptes={comptes} onLogin={onLogin}/></>;

  const rcCol={direction:DQ.red,gestion:DQ.accent,employe:DQ.blue};
  const rcLbl={direction:"Direction",gestion:"Gestion",employe:"Employé"};

  const pages={
    equipe:         <PageEquipe roster={roster} setRoster={setRoster} semaine={semaine} setSemaine={setSemaine} weeks={weeks} setWeeks={setWeeks} curIdx={curIdx} comptes={comptes} setComptes={setComptes}/>,
    archives:       <PageArchives weeks={weeks}/>,
    avertissements: <PageAvertissements weeks={weeks}/>,
    declarations:   <PageDeclarations decls={decls} setDecls={setDecls} comptes={comptes}/>,
    recap:          <PageRecap decls={decls} comptes={comptes}/>,
    impots:         <PageImpots semaine={semaine} decls={decls}/>,
    tchat:          <PageTchat user={user} comptes={comptes}/>,
    declarer:       <PageDeclarer user={user} onAdd={addDecl}/>,
    "mes-decls":    <PageMesDecls user={user} decls={decls}/>,
  };

  return(
    <><style>{CSS}</style>
    <div className="dqapp">
      <header style={{background:`linear-gradient(135deg,${DQ.darker},${DQ.dark} 50%,${DQ.mid})`,borderBottom:`3px solid ${DQ.accent}`,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 24px rgba(0,0,0,.7)"}}>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:24,fontWeight:700,letterSpacing:5,textTransform:"uppercase",color:DQ.white}}>
          <span style={{color:DQ.accent,opacity:.6,fontSize:10,verticalAlign:"middle",margin:"0 6px"}}>◆</span>DAVIS <span style={{color:DQ.accent}}>QUARTZ</span><span style={{color:DQ.accent,opacity:.6,fontSize:10,verticalAlign:"middle",margin:"0 6px"}}>◆</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{display:"inline-block",padding:"2px 7px",borderRadius:2,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:(rcCol[user.role]||DQ.muted)+"22",color:rcCol[user.role]||DQ.muted,border:`1px solid ${(rcCol[user.role]||DQ.muted)}44`}}>{rcLbl[user.role]||user.role}</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:DQ.text}}>{user.prenom} {user.nom}</span>
          <button className="btnG" style={{fontSize:11,padding:"5px 10px"}} onClick={onLogout}>⎋ Déco</button>
        </div>
      </header>
      <div style={{display:"flex",minHeight:"calc(100vh - 56px)"}}>
        <Sidebar user={user} page={page} setPage={setPage} semaine={semaine} roster={roster}/>
        <main style={{flex:1,padding:"18px 22px",overflow:"auto"}}>{pages[page]||<div className="empty" style={{padding:60}}>Page introuvable</div>}</main>
      </div>
    </div>
    </>
  );
}
