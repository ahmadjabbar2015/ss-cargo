/* =====================================================================
   S&S CARGO — FREIGHT OS   (prototype, single file, no backend)
   ===================================================================== */
const App = (function(){
"use strict";
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- money / date helpers ---------- */
const TODAY=new Date(2026,8,23);
const fmt=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2});
const money=n=>fmt.format(Math.round(n||0));
const money2=n=>fmt2.format(n||0);
const kmoney=n=>{const a=Math.abs(n);return (n<0?"-$":"$")+(a>=1e6?(a/1e6).toFixed(2)+"M":a>=1e3?(a/1e3).toFixed(1)+"k":Math.round(a));};
const pct=(n,d)=>d?((n/d)*100):0;
const d=(y,m,day)=>new Date(y,m-1,day);
const iso=dt=>dt.toISOString().slice(0,10);
const fdate=dt=>dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fdateY=dt=>dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const days=(a,b)=>Math.round((a-b)/864e5);
const addDays=(dt,n)=>new Date(dt.getTime()+n*864e5);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=p=>p+"-"+Math.floor(1000+Math.random()*9000);

/* ---------- seed data ---------- */
const CUSTOMERS=[
 {id:"C-101",name:"Bradford Foods Inc.",contact:"Dana Ruiz",email:"ap@bradfordfoods.example",phone:"(312) 555-0148",terms:30,credit:150000,method:{type:"ACH",last4:"4471"},since:"2024"},
 {id:"C-102",name:"Kestrel Produce",contact:"Marta Oyelaran",email:"billing@kestrel.example",phone:"(559) 555-0112",terms:21,credit:120000,method:{type:"ACH",last4:"8820"},since:"2024"},
 {id:"C-103",name:"Tallgrass Steel",contact:"Ray Whitcomb",email:"ap@tallgrass.example",phone:"(912) 555-0190",terms:45,credit:200000,method:{type:"Check",last4:"—"},since:"2023"},
 {id:"C-104",name:"Marlow Distribution",contact:"Priya Nandakumar",email:"finance@marlow.example",phone:"(973) 555-0177",terms:30,credit:90000,method:{type:"ACH",last4:"3310"},since:"2025"},
 {id:"C-105",name:"Verde Home Goods",contact:"Owen Castellanos",email:"ap@verdehome.example",phone:"(213) 555-0166",terms:30,credit:60000,method:{type:"Card",last4:"1042"},since:"2025"},
 {id:"C-106",name:"Northfield Beverage",contact:"Alicia Grant",email:"ap@northfieldbev.example",phone:"(305) 555-0134",terms:30,credit:140000,method:{type:"ACH",last4:"7765"},since:"2023"},
 {id:"C-107",name:"Halsey Components",contact:"Tom Brennan",email:"ap@halsey.example",phone:"(317) 555-0121",terms:15,credit:75000,method:{type:"Wire",last4:"—"},since:"2026"},
 {id:"C-108",name:"Cedar Ridge Lumber",contact:"Janine Cobb",email:"ap@cedarridge.example",phone:"(503) 555-0159",terms:30,credit:110000,method:{type:"ACH",last4:"2218"},since:"2024"}
];
const CARRIERS=[
 {id:"V-201",name:"Sierra Vista Logistics",mc:"1042118",dot:"3210998",base:"Phoenix, AZ",equip:["Dry Van 53'"],insExp:d(2027,3,14),factoring:null,quickPay:false,rating:4.9,onTime:99.2,hauled:64,status:"active"},
 {id:"V-202",name:"Cardinal Line Carriers",mc:"1143908",dot:"3771260",base:"Springfield, MO",equip:["Reefer"],insExp:d(2026,10,4),factoring:"TAFS",quickPay:true,rating:4.6,onTime:97.6,hauled:41,status:"active"},
 {id:"V-203",name:"Vasquez Transport LLC",mc:"1187442",dot:"3844091",base:"Laredo, TX",equip:["Dry Van 53'","Power Only"],insExp:d(2027,6,2),factoring:null,quickPay:true,rating:4.8,onTime:98.9,hauled:28,status:"active"},
 {id:"V-204",name:"Great Lakes Haulage",mc:"0984551",dot:"3118220",base:"Toledo, OH",equip:["Flatbed","Step Deck"],insExp:d(2026,9,12),factoring:"RTS",quickPay:false,rating:3.6,onTime:94.1,hauled:19,status:"active"},
 {id:"V-205",name:"Mesa Ridge Trucking",mc:"1209773",dot:"3902114",base:"Tucson, AZ",equip:["Flatbed"],insExp:d(2027,1,30),factoring:null,quickPay:false,rating:4.7,onTime:100,hauled:11,status:"active"},
 {id:"V-206",name:"Blue Ridge Freightways",mc:"1255410",dot:"3955012",base:"Knoxville, TN",equip:["Dry Van 53'","Reefer"],insExp:d(2027,4,8),factoring:"Apex",quickPay:true,rating:4.4,onTime:96.3,hauled:22,status:"active"},
 {id:"V-207",name:"Halden Freight Co.",mc:"0998120",dot:"3218844",base:"Toledo, OH",equip:["Dry Van 53'"],insExp:d(2027,2,19),factoring:null,quickPay:false,rating:0,onTime:0,hauled:0,status:"review",note:"Conditional safety rating — manager review required"},
 {id:"V-208",name:"Rio Bravo Carriers",mc:"1288301",dot:"4011277",base:"El Paso, TX",equip:["Hotshot","Power Only"],insExp:d(2027,5,22),factoring:null,quickPay:true,rating:0,onTime:0,hauled:0,status:"pending",note:"Authority active · insurance current"},
 {id:"V-209",name:"Copper State Express",mc:"1301447",dot:"4055190",base:"Yuma, AZ",equip:["Reefer"],insExp:d(2026,11,1),factoring:"TAFS",quickPay:true,rating:0,onTime:0,hauled:0,status:"pending",note:"Authority active · COI expires in 39 days"}
];
const TRUCKS=[
 {id:"T-01",unit:"Unit 114",driver:"Luis Vasquez",phone:"(956) 555-0173",carrier:"V-203",status:"On load",loc:"Laredo, TX"},
 {id:"T-02",unit:"Unit 119",driver:"Ramona Ellis",phone:"(602) 555-0144",carrier:"V-201",status:"On load",loc:"Phoenix, AZ"},
 {id:"T-03",unit:"Unit 207",driver:"Dale Okonkwo",phone:"(417) 555-0128",carrier:"V-202",status:"On load",loc:"Fresno, CA"},
 {id:"T-04",unit:"Unit 088",driver:"Marcus Feld",phone:"(419) 555-0182",carrier:"V-204",status:"On load",loc:"Amarillo, TX"},
 {id:"T-05",unit:"Unit 311",driver:"Sofia Ibarra",phone:"(520) 555-0119",carrier:"V-205",status:"Available",loc:"Tucson, AZ"},
 {id:"T-06",unit:"Unit 402",driver:"Grant Mbeki",phone:"(865) 555-0163",carrier:"V-206",status:"Available",loc:"Knoxville, TN"},
 {id:"T-07",unit:"Unit 155",driver:"Hank Pereira",phone:"(956) 555-0198",carrier:"V-203",status:"Available",loc:"San Antonio, TX"},
 {id:"T-08",unit:"Unit 260",driver:"Yara Stepanek",phone:"(602) 555-0107",carrier:"V-201",status:"Out of service",loc:"Phoenix, AZ"}
];
const LANES=[
 ["Laredo, TX","Chicago, IL",1383,"Dry Van 53'",42100,"Palletized dry goods"],
 ["Fresno, CA","Denver, CO",1178,"Reefer",38600,"Fresh produce"],
 ["Savannah, GA","Memphis, TN",585,"Flatbed",44000,"Steel coil"],
 ["Newark, NJ","Charlotte, NC",626,"Power Only",31400,"Consumer goods"],
 ["Dallas, TX","Atlanta, GA",781,"Dry Van 53'",40200,"Packaged food"],
 ["Los Angeles, CA","Phoenix, AZ",373,"Dry Van 53'",28900,"Home furnishings"],
 ["Seattle, WA","Salt Lake City, UT",832,"Reefer",36700,"Frozen goods"],
 ["Houston, TX","New Orleans, LA",348,"Step Deck",46500,"Pipe"],
 ["Indianapolis, IN","Newark, NJ",698,"Dry Van 48'",33100,"Auto components"],
 ["Miami, FL","Atlanta, GA",662,"Reefer",39800,"Beverages"],
 ["Kansas City, MO","Denver, CO",602,"Flatbed",43200,"Structural steel"],
 ["El Paso, TX","Phoenix, AZ",431,"Hotshot",12400,"Expedite parts"],
 ["Portland, OR","Boise, ID",430,"Flatbed",41000,"Dimensional lumber"],
 ["Amarillo, TX","Kansas City, MO",535,"Flatbed",42800,"Steel plate"]
];
const STATUSES=["Booked","At pickup","In transit","Delivered","Invoiced","Paid"];

function buildLoads(){
  const out=[];
  const plan=[
    // [laneIdx, custIdx, carrIdx, status, pickupOffset, rev, cost, flags]
    [13,2,3,"At risk",-1,2180,1840,{risk:"Breakdown outside Amarillo — consignee appointment 14:00"}],
    [1,1,1,"Paid",-9,3890,3180,{}],
    [0,0,2,"In transit",-1,3240,2650,{}],
    [5,4,0,"In transit",-1,1120,890,{}],
    [9,5,5,"At pickup",0,1985,1620,{}],
    [2,2,4,"Delivered",-3,1620,1310,{}],
    [3,3,2,"Paid",-12,1410,1150,{}],
    [6,7,0,"Booked",1,2195,1790,{}],
    [4,0,5,"Invoiced",-5,1875,1520,{}],
    [8,6,2,"Invoiced",-6,1540,1290,{}],
    [10,2,4,"Delivered",-2,1450,1180,{}],
    [11,6,7,"Booked",1,1290,1010,{}],
    [12,7,4,"Invoiced",-8,1180,930,{}],
    [7,3,3,"Paid",-15,1120,880,{}],
    [0,0,2,"Paid",-22,3180,2590,{}],
    [1,1,5,"Paid",-19,3760,3090,{}],
    [4,0,0,"Paid",-26,1810,1460,{}],
    [9,5,1,"Invoiced",-11,2040,1660,{}],
    [2,2,3,"Paid",-30,1590,1300,{}],
    [3,3,2,"Delivered",-4,1380,1120,{}],
    [5,4,0,"Paid",-17,1065,860,{}],
    [8,6,5,"Paid",-24,1495,1220,{}]
  ];
  plan.forEach(function(p,i){
    const L=LANES[p[0]], c=CUSTOMERS[p[1]], v=CARRIERS[p[2]];
    const pick=addDays(TODAY,p[4]);
    const del=addDays(pick,Math.max(1,Math.round(L[2]/550)));
    const acc=[];
    if(i===0) acc.push({label:"Detention — 3.5 hrs at consignee",amt:210,side:"cust"},{label:"Detention pass-through",amt:175,side:"carr"});
    if(i===4) acc.push({label:"Lumper fee",amt:165,side:"cust"},{label:"Lumper reimbursement",amt:165,side:"carr"});
    if(i===8) acc.push({label:"Driver assist",amt:120,side:"cust"});
    if(i===2) acc.push({label:"Fuel advance",amt:-400,side:"carr"});
    out.push({
      id:"SS-"+(4770+i*3),cust:c.id,carrier:v.id,orig:L[0],dest:L[1],miles:L[2],equip:L[3],weight:L[4],commodity:L[5],
      pickup:pick,delivery:del,status:p[3],rev:p[5],cost:p[6],acc:acc,
      invoiceId:null,settlementId:null,risk:p[7].risk||null,
      ref:"PO "+(88100+i*7),
      docs:(["Delivered","Invoiced","Paid"].indexOf(p[3])>=0)
        ? [{n:"Rate confirmation",t:"PDF"},{n:"Bill of lading",t:"PDF"},{n:"Proof of delivery",t:"PDF"}]
        : [{n:"Rate confirmation",t:"PDF"}]
    });
  });
  return out;
}

const QUOTES=[
 {id:"Q-1184",cust:"C-101",orig:"Laredo, TX",dest:"Chicago, IL",equip:"Dry Van 53'",miles:1383,weight:42100,ready:addDays(TODAY,1),target:3200,status:"New",recv:"05:52 today",notes:"Dock hours 07:00–15:00. Appointment required at delivery."},
 {id:"Q-1183",cust:"C-102",orig:"Fresno, CA",dest:"Denver, CO",equip:"Reefer",miles:1178,weight:38600,ready:addDays(TODAY,1),target:3750,status:"New",recv:"04:31 today",notes:"Continuous 34°F. Pulp temp on load and unload."},
 {id:"Q-1182",cust:"C-108",orig:"Portland, OR",dest:"Boise, ID",equip:"Flatbed",miles:430,weight:41000,ready:addDays(TODAY,2),target:1150,status:"New",recv:"Yesterday",notes:"Tarps required. 4 straps minimum."},
 {id:"Q-1181",cust:"C-103",orig:"Savannah, GA",dest:"Memphis, TN",equip:"Flatbed",miles:585,weight:44000,ready:addDays(TODAY,2),target:1600,status:"Quoted",recv:"Yesterday",notes:"Coil racks in place."},
 {id:"Q-1180",cust:"C-107",orig:"Indianapolis, IN",dest:"Newark, NJ",equip:"Dry Van 48'",miles:698,weight:33100,ready:addDays(TODAY,3),target:1500,status:"Quoted",recv:"Yesterday",notes:""},
 {id:"Q-1178",cust:"C-104",orig:"Newark, NJ",dest:"Charlotte, NC",equip:"Power Only",miles:626,weight:31400,ready:addDays(TODAY,2),target:1380,status:"Won",recv:"21 Sep",notes:""},
 {id:"Q-1176",cust:"C-105",orig:"Los Angeles, CA",dest:"Phoenix, AZ",equip:"Dry Van 53'",miles:373,weight:28900,ready:addDays(TODAY,-1),target:980,status:"Lost",recv:"20 Sep",notes:"Lost on price — customer took $915 elsewhere."},
 {id:"Q-1174",cust:"C-106",orig:"Miami, FL",dest:"Atlanta, GA",equip:"Reefer",miles:662,weight:39800,ready:addDays(TODAY,1),target:2050,status:"Quoted",recv:"20 Sep",notes:""}
];

/* ================= STATE ================= */
let DB=null;

function seed(){
  const loads=buildLoads();
  const invoices=[],settlements=[],payments=[];
  loads.forEach(function(l,i){
    const cust=CUSTOMERS.find(c=>c.id===l.cust);
    const carr=CARRIERS.find(c=>c.id===l.carrier);
    const custAcc=l.acc.filter(a=>a.side==="cust").reduce((s,a)=>s+a.amt,0);
    const carrAcc=l.acc.filter(a=>a.side==="carr").reduce((s,a)=>s+a.amt,0);

    if(["Invoiced","Paid"].indexOf(l.status)>=0){
      const issued=addDays(l.delivery,1);
      const amount=l.rev+custAcc;
      let paid=0;
      if(l.status==="Paid") paid=amount;
      const inv={id:"INV-"+(3300+i*2),cust:l.cust,loads:[l.id],issued:issued,due:addDays(issued,cust.terms),
        amount:amount,paid:paid,terms:cust.terms,sent:true,disputed:false,note:""};
      if(i===12){ inv.disputed=true; inv.note="Customer disputes the driver-assist charge."; }
      if(i===9){ inv.paid=Math.round(amount*0.45); }
      invoices.push(inv); l.invoiceId=inv.id;
      if(inv.paid>0){
        payments.push({id:uid("PMT"),date:addDays(issued,Math.min(cust.terms-3,18)),dir:"in",party:cust.name,
          method:cust.method.type,ref:"DEP"+(72100+i),amount:inv.paid,link:inv.id});
      }
    }
    if(["Delivered","Invoiced","Paid"].indexOf(l.status)>=0){
      const ded=[];
      const adv=l.acc.find(a=>a.side==="carr"&&a.amt<0);
      if(adv) ded.push({label:"Fuel advance recovery",amt:-adv.amt});
      const gross=l.cost+Math.max(0,carrAcc);
      const qp=!!carr.quickPay;
      const fee=qp?Math.round(gross*0.03):0;
      const net=gross-fee-ded.reduce((s,x)=>s+x.amt,0);
      const st={id:"SET-"+(5100+i*2),carrier:l.carrier,loads:[l.id],gross:gross,ded:ded,quickPay:qp,fee:fee,net:net,
        status:l.status==="Paid"?"Paid":(l.status==="Invoiced"?"Approved":"Pending"),
        method:carr.factoring?"ACH to factor":"ACH",factor:carr.factoring,
        paidOn:l.status==="Paid"?addDays(l.delivery,qp?1:12):null};
      settlements.push(st); l.settlementId=st.id;
      if(st.status==="Paid"){
        payments.push({id:uid("PMT"),date:st.paidOn,dir:"out",party:(carr.factoring?carr.name+" (via "+carr.factoring+")":carr.name),
          method:st.method,ref:"ACH"+(41000+i),amount:st.net,link:st.id});
      }
    }
  });
  // one badly overdue invoice for the aging story
  const old=CUSTOMERS[4];
  const oi={id:"INV-3288",cust:old.id,loads:[],issued:d(2026,7,14),due:d(2026,8,13),amount:8420,paid:0,terms:30,sent:true,disputed:false,note:"Second reminder sent 2 Sep."};
  invoices.push(oi);
  const oi2={id:"INV-3294",cust:CUSTOMERS[2].id,loads:[],issued:d(2026,7,29),due:d(2026,9,12),amount:6180,paid:2000,terms:45,sent:true,disputed:false,note:"Partial received, chasing balance."};
  invoices.push(oi2);
  payments.push({id:uid("PMT"),date:d(2026,9,5),dir:"in",party:CUSTOMERS[2].name,method:"Check",ref:"CHK 20418",amount:2000,link:oi2.id});
  // a draft invoice
  invoices.push({id:"INV-3399",cust:CUSTOMERS[1].id,loads:[],issued:TODAY,due:addDays(TODAY,21),amount:3760,paid:0,terms:21,sent:false,disputed:false,note:""});

  return {loads:loads,invoices:invoices,settlements:settlements,payments:payments,
    quotes:QUOTES.map(q=>Object.assign({},q)),carriers:CARRIERS.map(c=>Object.assign({},c)),
    customers:CUSTOMERS.map(c=>Object.assign({},c)),trucks:TRUCKS.map(t=>Object.assign({},t)),
    activity:[
      {t:"g",b:"Payment received",x:"$3,890 ACH from Kestrel Produce against INV-3302",w:"06:41 CT · today"},
      {t:"b",b:"Rate confirmation signed",x:"Cardinal Line Carriers on SS-4776",w:"06:18 CT · today"},
      {t:"b",b:"New quote request",x:"Bradford Foods — Laredo, TX → Chicago, IL",w:"05:52 CT · today"},
      {t:"w",b:"Detention filed",x:"SS-4770 — 3.5 hrs at consignee, $210 billed",w:"18:07 CT · yesterday"},
      {t:"g",b:"Carrier activated",x:"Mesa Ridge Trucking LLC, MC 1209773",w:"16:22 CT · yesterday"},
      {t:"r",b:"Invoice overdue",x:"INV-3288 Verde Home Goods passed 30 days late",w:"09:00 CT · yesterday"}
    ]};
}

/* ---------- persistence ---------- */
const KEY="ss-cargo-freight-os-v1";
function revive(o){
  const dk=["pickup","delivery","issued","due","date","paidOn","ready","insExp"];
  (function walk(v){
    if(Array.isArray(v)) return v.forEach(walk);
    if(v&&typeof v==="object"){
      Object.keys(v).forEach(function(k){
        if(dk.indexOf(k)>=0&&typeof v[k]==="string") v[k]=new Date(v[k]);
        else walk(v[k]);
      });
    }
  })(o);
  return o;
}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(DB)); }catch(e){} }
function restore(){ try{ const r=localStorage.getItem(KEY); return r?revive(JSON.parse(r)):null; }catch(e){ return null; } }
function resetData(){ DB=seed(); save(); render(); toast("Demo data reset."); }

/* ---------- lookups & derived ---------- */
const cust=id=>DB.customers.find(c=>c.id===id)||{name:"—",terms:30,method:{type:"—",last4:""}};
const carr=id=>DB.carriers.find(c=>c.id===id)||{name:"—",equip:[]};
const load=id=>DB.loads.find(l=>l.id===id);
const inv=id=>DB.invoices.find(i=>i.id===id);
const sett=id=>DB.settlements.find(s=>s.id===id);

function accSum(l,side){ return l.acc.filter(a=>a.side===side).reduce((s,a)=>s+a.amt,0); }
function loadRevenue(l){ return l.rev+accSum(l,"cust"); }
function loadCost(l){ return l.cost+accSum(l,"carr"); }
function loadMargin(l){ return loadRevenue(l)-loadCost(l); }
function invBalance(i){ return Math.max(0,i.amount-i.paid); }
function invStatus(i){
  if(!i.sent) return "Draft";
  if(i.disputed) return "Disputed";
  if(invBalance(i)<=0.5) return "Paid";
  if(days(TODAY,i.due)>0) return "Overdue";
  if(i.paid>0) return "Partial";
  return "Sent";
}
const INV_TONE={Draft:"",Sent:"info",Partial:"warn",Paid:"ok",Overdue:"bad",Disputed:"bad"};
const SET_TONE={Pending:"warn",Approved:"info",Paid:"ok",Held:"bad"};
const LOAD_TONE={"Booked":"info","At pickup":"warn","In transit":"warn","Delivered":"ok","Invoiced":"info","Paid":"ok","At risk":"bad"};

function arOpen(){ return DB.invoices.filter(i=>i.sent&&invBalance(i)>0.5); }
function arTotal(){ return arOpen().reduce((s,i)=>s+invBalance(i),0); }
function apOpen(){ return DB.settlements.filter(s=>s.status!=="Paid"); }
function apTotal(){ return apOpen().reduce((s,x)=>s+x.net,0); }
function overdue(){ return arOpen().filter(i=>days(TODAY,i.due)>0); }
function arAging(){
  const b=[{k:"Current",v:0,c:"g"},{k:"1–30 days",v:0,c:""},{k:"31–60 days",v:0,c:"w"},{k:"61–90 days",v:0,c:"r"},{k:"90+ days",v:0,c:"r"}];
  arOpen().forEach(function(i){
    const n=days(TODAY,i.due);
    const k=n<=0?0:n<=30?1:n<=60?2:n<=90?3:4;
    b[k].v+=invBalance(i);
  });
  return b;
}
function creditUsed(cid){
  return DB.invoices.filter(i=>i.cust===cid&&i.sent).reduce((s,i)=>s+invBalance(i),0);
}
function custRevenue(cid){
  return DB.loads.filter(l=>l.cust===cid).reduce((s,l)=>s+loadRevenue(l),0);
}
function activeLoads(){ return DB.loads.filter(l=>["Booked","At pickup","In transit","At risk"].indexOf(l.status)>=0); }
function uninvoiced(){ return DB.loads.filter(l=>l.status==="Delivered"&&!l.invoiceId); }
function pendingSettlements(){ return DB.settlements.filter(s=>s.status==="Pending"); }
function pendingCarriers(){ return DB.carriers.filter(c=>c.status==="pending"||c.status==="review"); }
function newQuotes(){ return DB.quotes.filter(q=>q.status==="New"); }
function insuranceRisk(){ return DB.carriers.filter(c=>c.status==="active"&&days(addDays(TODAY,30),c.insExp)>=0); }
function mtd(){
  const loads=DB.loads.filter(l=>l.pickup>=d(2026,9,1));
  const rev=loads.reduce((s,l)=>s+loadRevenue(l),0);
  const cost=loads.reduce((s,l)=>s+loadCost(l),0);
  return {rev:rev,cost:cost,margin:rev-cost,pct:pct(rev-cost,rev),count:loads.length};
}
function weeklySeries(){
  const out=[];
  for(let w=7;w>=0;w--){
    const end=addDays(TODAY,-w*7), start=addDays(end,-6);
    const ls=DB.loads.filter(l=>l.pickup>=start&&l.pickup<=end);
    const rev=ls.reduce((s,l)=>s+loadRevenue(l),0);
    const cost=ls.reduce((s,l)=>s+loadCost(l),0);
    const pin=DB.payments.filter(p=>p.dir==="in"&&p.date>=start&&p.date<=end).reduce((s,p)=>s+p.amount,0);
    const pout=DB.payments.filter(p=>p.dir==="out"&&p.date>=start&&p.date<=end).reduce((s,p)=>s+p.amount,0);
    out.push({label:fdate(end),rev:rev,margin:rev-cost,in:pin,out:pout});
  }
  return out;
}
function laneMargins(){
  const m={};
  DB.loads.forEach(function(l){
    const k=l.orig.split(",")[0]+" → "+l.dest.split(",")[0];
    m[k]=m[k]||{k:k,rev:0,margin:0,n:0};
    m[k].rev+=loadRevenue(l); m[k].margin+=loadMargin(l); m[k].n++;
  });
  return Object.values(m).sort((a,b)=>b.margin-a.margin);
}
function attention(){
  const a=[];
  DB.loads.filter(l=>l.status==="At risk").forEach(l=>a.push({sv:"hi",b:l.id+" — "+(l.risk||"behind schedule"),x:l.orig+" → "+l.dest+" · "+carr(l.carrier).name,go:()=>openLoad(l.id),cta:"Open load"}));
  overdue().sort((x,y)=>days(TODAY,y.due)-days(TODAY,x.due)).slice(0,3).forEach(i=>a.push({
    sv:days(TODAY,i.due)>45?"hi":"md",b:i.id+" overdue by "+days(TODAY,i.due)+" days",
    x:cust(i.cust).name+" · "+money(invBalance(i))+" outstanding",go:()=>openInvoice(i.id),cta:"Collect"}));
  insuranceRisk().forEach(c=>a.push({sv:"md",b:c.name+" — insurance expires "+fdateY(c.insExp),
    x:days(c.insExp,TODAY)<0?"Expired. Carrier must be blocked from new loads.":days(c.insExp,TODAY)+" days left · "+c.hauled+" loads hauled",
    go:()=>go("carriers"),cta:"Review"}));
  if(uninvoiced().length) a.push({sv:"lo",b:uninvoiced().length+" delivered loads not yet invoiced",
    x:money(uninvoiced().reduce((s,l)=>s+loadRevenue(l),0))+" of revenue sitting uninvoiced",go:()=>go("invoices"),cta:"Invoice now"});
  if(pendingSettlements().length) a.push({sv:"lo",b:pendingSettlements().length+" carrier settlements awaiting approval",
    x:money(pendingSettlements().reduce((s,x)=>s+x.net,0))+" in carrier pay",go:()=>go("settlements"),cta:"Approve"});
  newQuotes().slice(0,1).forEach(q=>a.push({sv:"lo",b:q.id+" unpriced — "+cust(q.cust).name,
    x:q.orig+" → "+q.dest+" · target "+money(q.target),go:()=>openQuote(q.id),cta:"Price it"}));
  return a;
}

/* ================= SHELL ================= */
const I={
 dash:'<rect x="3" y="3" width="7" height="8" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
 quote:'<path d="M4 4h16v13H7l-3 3z"/><path d="M8 9h8M8 13h5"/>',
 load:'<rect x="2" y="7" width="13" height="9" rx="1"/><path d="M15 10h3l3 3v3h-6z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
 disp:'<circle cx="12" cy="10" r="3"/><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/>',
 inv:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 sett:'<path d="M3 6h18v12H3z"/><circle cx="12" cy="12" r="2.5"/><path d="M7 12h.01M17 12h.01"/>',
 pay:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 cust:'<path d="M3 21V9l7-5 7 5v12"/><path d="M9 21v-6h4v6"/>',
 carr:'<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/>',
 rep:'<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
 set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6 1.6 1.6 0 0 0 8 1.1V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 14.7 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
 chk:'<path d="M20 6 9 17l-5-5"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', warn:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18.4A2 2 0 0 0 3.5 21.4h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
 dl:'<path d="M12 3v12M7 11l5 5 5-5"/><path d="M4 19h16"/>', mail:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 7 10 6 10-6"/>'
};
const ic=(k,s)=>'<svg width="'+(s||16)+'" height="'+(s||16)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[k]+'</svg>';

const NAV=[
 {g:"Operations",items:[
   {k:"dashboard",t:"Dashboard",i:"dash"},
   {k:"quotes",t:"Quotes",i:"quote",b:()=>newQuotes().length},
   {k:"loads",t:"Loads",i:"load",b:()=>activeLoads().length},
   {k:"dispatch",t:"Dispatch",i:"disp"}]},
 {g:"Finance",items:[
   {k:"invoices",t:"Invoices (AR)",i:"inv",b:()=>overdue().length,alert:true},
   {k:"settlements",t:"Carrier pay (AP)",i:"sett",b:()=>pendingSettlements().length},
   {k:"payments",t:"Payments",i:"pay"}]},
 {g:"Network",items:[
   {k:"customers",t:"Customers",i:"cust"},
   {k:"carriers",t:"Carriers",i:"carr",b:()=>pendingCarriers().length}]},
 {g:"Company",items:[
   {k:"reports",t:"Reports",i:"rep"},
   {k:"settings",t:"Settings",i:"set"}]}
];
const TITLES={
 dashboard:["Dashboard","Everything that needs a decision today, and the money behind it."],
 quotes:["Quotes","Price incoming freight and turn it into booked loads."],
 loads:["Loads","Every load from booking to POD, with live margin."],
 dispatch:["Dispatch board","Trucks, drivers and who is covering what."],
 customers:["Customers","Accounts, credit exposure, payment terms and lane history."],
 carriers:["Carriers","Roster, onboarding queue and compliance."],
 invoices:["Invoices — accounts receivable","Bill customers, chase balances, record payments."],
 settlements:["Carrier pay — accounts payable","Approve settlements, apply deductions, pay carriers and factors."],
 payments:["Payments","Every dollar in and out, with cash position."],
 reports:["Reports","Margin, lanes, customers and carrier performance."],
 settings:["Settings","Company profile, users, rates and integrations."]
};
let route="dashboard", ROLE="ops", drawerState=null;

function renderNav(){
  $("#sideNav").innerHTML=NAV.map(function(grp){
    return '<p class="side-lbl">'+esc(grp.g)+'</p><nav class="side-nav">'+grp.items.map(function(it){
      const n=it.b?it.b():0;
      return '<button data-route="'+it.k+'"'+(route===it.k?' aria-current="true"':'')+'>'+ic(it.i)+
        '<span class="txt">'+esc(it.t)+'</span>'+(n?'<span class="bdg'+(it.alert?" alert":"")+'">'+n+'</span>':'')+'</button>';
    }).join("")+'</nav>';
  }).join("");
}
function go(r){ route=r; closeDrawer(); render(); window.scrollTo({top:0,behavior:"auto"}); $("#app").classList.remove("mobile-open"); $("#navScrim").hidden=true; }

function render(){
  renderNav();
  const t=TITLES[route]||["",""];
  $("#pagehead").innerHTML='<div><h1>'+esc(t[0])+'</h1><p>'+esc(t[1])+'</p></div>'+
    '<div class="btn-row" id="pageActions"></div>';
  $("#content").innerHTML=(VIEWS[route]||(()=>""))();
  (AFTER[route]||function(){})();
  save();
}

/* ---------- toast / modal / drawer ---------- */
let tT;
function toast(m){ const t=$("#toast"); $("#toastMsg").textContent=m; t.classList.add("on"); clearTimeout(tT); tT=setTimeout(()=>t.classList.remove("on"),2700); }
function modal(html,wide){
  $("#modal").className="modal"+(wide?" wide":"");
  $("#modal").innerHTML='<button class="xbtn" data-close>'+ic("x",17)+'</button>'+html;
  $("#modalScrim").hidden=false;
  const f=$("#modal input,#modal select,#modal textarea"); if(f) setTimeout(()=>f.focus(),40);
}
function closeModal(){ $("#modalScrim").hidden=true; $("#modal").innerHTML=""; }
function openDrawer(html){ $("#drawer").innerHTML=html; $("#drawer").hidden=false; }
function closeDrawer(){ $("#drawer").hidden=true; $("#drawer").innerHTML=""; drawerState=null; }

/* ---------- small builders ---------- */
function stat(lbl,val,opt){
  opt=opt||{};
  return '<div class="stat'+(opt.hi?" hi":"")+(opt.danger?" danger":"")+'">'+
    '<span class="lbl">'+esc(lbl)+'</span>'+
    '<span class="val'+(opt.sm?" sm":"")+'">'+val+'</span>'+
    (opt.dlt?'<span class="dlt '+(opt.tone||"")+'">'+opt.dlt+'</span>':"")+
    (opt.spark?spark(opt.spark):"")+'</div>';
}
function spark(pts){
  const max=Math.max.apply(null,pts),min=Math.min.apply(null,pts);
  const rng=(max-min)||1;
  const p=pts.map((v,i)=>[(i/(pts.length-1))*118+1,25-((v-min)/rng)*22].map(x=>x.toFixed(1)).join(",")).join(" ");
  const last=p.split(" ").pop().split(",");
  return '<svg class="spark" viewBox="0 0 120 28" role="img" aria-label="Recent trend">'+
   '<polyline points="'+p+'" fill="none" style="stroke:var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
   '<circle cx="'+last[0]+'" cy="'+last[1]+'" r="2.8" style="fill:var(--brand);stroke:var(--surface)" stroke-width="2"/></svg>';
}
function tag(text,tone){ return '<span class="tag '+(tone||"")+'"><i></i>'+esc(text)+'</span>'; }
function meters(rows){
  const max=Math.max.apply(null,rows.map(r=>Math.abs(r.v)))||1;
  return '<div class="mb">'+rows.map(r=>'<div class="mb-r"><span title="'+esc(r.k)+'">'+esc(r.k)+'</span>'+
    '<div class="trk"><em class="'+(r.c||"")+'" style="width:'+Math.max(2,Math.abs(r.v)/max*100).toFixed(1)+'%"></em></div>'+
    '<b>'+r.l+'</b></div>').join("")+'</div>';
}
function table(cols,rows,opt){
  opt=opt||{};
  const head='<thead><tr>'+cols.map(c=>'<th class="'+(c.r?"r ":"")+(c.s?"s":"")+'"'+(c.s?' data-sort="'+c.s+'"':"")+'>'+esc(c.t)+(c.s?' <span class="ar">▾</span>':"")+'</th>').join("")+'</tr></thead>';
  const body=rows.length? '<tbody>'+rows.map(function(r){
      return '<tr class="'+(opt.click?"clickable":"")+'"'+(r._id?' data-id="'+esc(r._id)+'"':"")+'>'+
        cols.map(c=>'<td class="'+(c.r?"r ":"")+(c.n?"n ":"")+'">'+(c.f(r)||"")+'</td>').join("")+'</tr>';
    }).join("")+'</tbody>'
    : '<tbody><tr><td colspan="'+cols.length+'"><div class="empty">'+esc(opt.empty||"Nothing here.")+'</div></td></tr></tbody>';
  return '<div class="tw"><table>'+head+body+'</table></div>';
}

/* ---------- charts ---------- */
function barChart(id,data,opt){
  opt=opt||{};
  const W=520,H=190,L=54,R=14,T=12,B=30, iw=W-L-R, ih=H-T-B;
  const series=opt.series||[{key:"v",color:"var(--brand)",name:""}];
  const max=Math.max.apply(null,data.map(d=>Math.max.apply(null,series.map(s=>d[s.key]||0))))||1;
  const step=iw/data.length, gw=step*0.62, bw=gw/series.length;
  const ticks=[0,.25,.5,.75,1].map(f=>max*f);
  let s='';
  ticks.forEach(function(t){
    const y=T+ih-(t/max)*ih;
    s+='<line x1="'+L+'" y1="'+y.toFixed(1)+'" x2="'+(W-R)+'" y2="'+y.toFixed(1)+'" style="stroke:var(--line)" stroke-width="1"/>'+
       '<text x="'+(L-8)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end" style="fill:var(--ink-3);font-size:9.5px;font-family:var(--f-num)">'+(opt.fmt?opt.fmt(t):Math.round(t))+'</text>';
  });
  data.forEach(function(dd,i){
    const gx=L+i*step+(step-gw)/2;
    series.forEach(function(se,j){
      const v=dd[se.key]||0, h=Math.max(1,(v/max)*ih), x=gx+j*bw, y=T+ih-h;
      s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" style="fill:'+se.color+'"><title>'+esc(dd.label+" · "+(se.name?se.name+" ":"")+(opt.fmt?opt.fmt(v):v))+'</title></rect>';
    });
    if(i%(data.length>8?2:1)===0)
      s+='<text x="'+(L+i*step+step/2).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" style="fill:var(--ink-3);font-size:9.5px;font-family:var(--f-num)">'+esc(dd.label)+'</text>';
  });
  return '<div class="chart-wrap"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.alt||"Bar chart")+'">'+s+'</svg></div>';
}
function lineChart(data,opt){
  opt=opt||{};
  const W=520,H=190,L=54,R=22,T=14,B=28, iw=W-L-R, ih=H-T-B;
  const vals=data.map(d=>d.v);
  const max=Math.max.apply(null,vals)*1.08||1, min=Math.min(0,Math.min.apply(null,vals));
  const X=i=>L+(i/(data.length-1))*iw, Y=v=>T+ih-((v-min)/(max-min))*ih;
  let s='<defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--brand)" stop-opacity=".22"/><stop offset="100%" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>';
  [0,.33,.66,1].forEach(function(f){
    const v=min+(max-min)*f, y=Y(v);
    s+='<line x1="'+L+'" y1="'+y.toFixed(1)+'" x2="'+(W-R)+'" y2="'+y.toFixed(1)+'" style="stroke:var(--line)" stroke-width="1"/>'+
       '<text x="'+(L-8)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end" style="fill:var(--ink-3);font-size:9.5px;font-family:var(--f-num)">'+(opt.fmt?opt.fmt(v):Math.round(v))+'</text>';
  });
  const pth=data.map((dd,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(dd.v).toFixed(1)).join(" ");
  s+='<path d="'+pth+' L'+X(data.length-1).toFixed(1)+' '+(T+ih)+' L'+X(0).toFixed(1)+' '+(T+ih)+' Z" fill="url(#lg1)"/>';
  s+='<path d="'+pth+'" fill="none" style="stroke:var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  data.forEach(function(dd,i){
    s+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(dd.v).toFixed(1)+'" r="3" style="fill:var(--surface);stroke:var(--brand)" stroke-width="2"><title>'+esc(dd.label+" · "+(opt.fmt?opt.fmt(dd.v):dd.v))+'</title></circle>';
    if(i%2===0) s+='<text x="'+X(i).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" style="fill:var(--ink-3);font-size:9.5px;font-family:var(--f-num)">'+esc(dd.label)+'</text>';
  });
  const last=data[data.length-1];
  s+='<text x="'+(X(data.length-1)-4).toFixed(1)+'" y="'+(Y(last.v)-10).toFixed(1)+'" text-anchor="end" style="fill:var(--ink);font-size:11px;font-weight:700;font-family:var(--f-num)">'+(opt.fmt?opt.fmt(last.v):last.v)+'</text>';
  return '<div class="chart-wrap"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.alt||"Line chart")+'">'+s+'</svg></div>';
}

/* ================= VIEWS ================= */
const F={loadStatus:"",loadQ:"",invStatus:"",invQ:"",setStatus:"",payDir:"",quoteStatus:"",carrStatus:"",sel:[]};
const VIEWS={},AFTER={};

/* ---------- DASHBOARD ---------- */
VIEWS.dashboard=function(){
  const m=mtd(), wk=weeklySeries();
  const cash=arTotal()-apTotal();
  const due30=arOpen().filter(i=>days(addDays(TODAY,30),i.due)>=0&&days(TODAY,i.due)<=0).reduce((s,i)=>s+invBalance(i),0);
  const att=attention();
  return '<div class="stack">'+

  (att.length?'<div class="note warn">'+ic("warn",16)+'<div><b>'+att.length+' item'+(att.length>1?"s":"")+' need attention.</b> '+
   'Overdue receivables, compliance and at-risk freight are listed below — every row is actionable.</div></div>':"")+

  '<div class="grid g4">'+
    stat("Cash position",kmoney(cash),{hi:true,dlt:money(arTotal())+" in · "+money(apTotal())+" out",sm:true})+
    stat("Receivables open",money(arTotal()),{dlt:overdue().length+" invoices overdue",tone:overdue().length?"down":"",sm:true})+
    stat("Carrier pay due",money(apTotal()),{dlt:pendingSettlements().length+" awaiting approval",sm:true})+
    stat("Collecting next 30 days",money(due30),{dlt:"Invoices coming due",tone:"up",sm:true})+
  '</div>'+

  '<div class="grid g4">'+
    stat("Revenue MTD",money(m.rev),{spark:wk.map(w=>w.rev),dlt:m.count+" loads booked"})+
    stat("Gross margin MTD",money(m.margin),{spark:wk.map(w=>w.margin),dlt:m.pct.toFixed(1)+"% of revenue",tone:"up"})+
    stat("Active loads",activeLoads().length,{dlt:DB.loads.filter(l=>l.status==="At risk").length+" at risk",tone:DB.loads.filter(l=>l.status==="At risk").length?"down":""})+
    stat("Avg margin / load",money(m.count?m.margin/m.count:0),{dlt:"Target $420"})+
  '</div>'+

  '<div class="grid g-2-1">'+
    '<div class="card"><div class="card-h"><h3>Needs action</h3><span class="sub">sorted by risk</span></div>'+
      (att.length?att.map((a,i)=>'<div class="att"><i class="sv '+a.sv+'"></i><div><b>'+esc(a.b)+'</b><span>'+esc(a.x)+'</span></div>'+
        '<button class="btn btn-s btn-x" data-att="'+i+'">'+esc(a.cta)+'</button></div>').join("")
        :'<div class="empty">Nothing outstanding. Good day.</div>')+
    '</div>'+
    '<div class="card"><div class="card-h"><h3>Activity</h3></div><ul class="feed">'+
      DB.activity.map(a=>'<li><i class="'+a.t+'"></i><div><b>'+esc(a.b)+'</b> '+esc(a.x)+'<time>'+esc(a.w)+'</time></div></li>').join("")+
    '</ul></div>'+
  '</div>'+

  '<div class="grid g2">'+
    '<div class="card"><div class="card-h"><h3>Cash in vs. cash out</h3><span class="sub">8 weeks</span></div>'+
      '<div class="legend"><span><i style="background:var(--brand)"></i>Received from customers</span><span><i style="background:var(--warn)"></i>Paid to carriers</span></div>'+
      barChart("cash",wk,{series:[{key:"in",color:"var(--brand)",name:"in"},{key:"out",color:"var(--warn)",name:"out"}],fmt:kmoney,alt:"Weekly cash received versus paid out over eight weeks"})+
    '</div>'+
    '<div class="card"><div class="card-h"><h3>Receivables aging</h3><span class="sub">'+money(arTotal())+' open</span></div>'+
      '<div class="card-b">'+meters(arAging().map(b=>({k:b.k,v:b.v,l:kmoney(b.v),c:b.c})))+'</div>'+
    '</div>'+
  '</div>'+

  '<div class="grid g2">'+
    '<div class="card"><div class="card-h"><h3>Gross margin by week</h3><span class="sub">$ per week</span></div>'+
      lineChart(wk.map(w=>({label:w.label,v:w.margin})),{fmt:kmoney,alt:"Gross margin per week over eight weeks"})+'</div>'+
    '<div class="card"><div class="card-h"><h3>Most profitable lanes</h3><span class="sub">all time</span></div>'+
      '<div class="card-b">'+meters(laneMargins().slice(0,6).map(l=>({k:l.k,v:l.margin,l:money(l.margin),c:"c"})))+'</div></div>'+
  '</div></div>';
};
AFTER.dashboard=function(){
  const att=attention();
  $$("[data-att]").forEach(b=>b.addEventListener("click",()=>att[+b.dataset.att].go()));
  $("#pageActions").innerHTML='<button class="btn btn-s btn-x" data-act="reset">Reset demo data</button>'+
    '<button class="btn btn-s btn-x" data-act="newInvoice">Create invoice</button>'+
    '<button class="btn btn-p btn-x" data-act="newLoad">+ New load</button>';
};

/* ---------- QUOTES ---------- */
VIEWS.quotes=function(){
  const rows=DB.quotes.filter(q=>!F.quoteStatus||q.status===F.quoteStatus);
  const tone={New:"info",Quoted:"warn",Won:"ok",Lost:""};
  const won=DB.quotes.filter(q=>q.status==="Won").length, total=DB.quotes.length;
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Unpriced",newQuotes().length,{dlt:"Promise: under 30 min",sm:true,hi:newQuotes().length>0})+
    stat("Out for decision",DB.quotes.filter(q=>q.status==="Quoted").length,{dlt:"Awaiting the customer",sm:true})+
    stat("Win rate",pct(won,total).toFixed(0)+"%",{dlt:won+" of "+total+" quotes",sm:true})+
    stat("Pipeline value",money(DB.quotes.filter(q=>["New","Quoted"].indexOf(q.status)>=0).reduce((s,q)=>s+q.target,0)),{dlt:"Customer targets",sm:true})+
  '</div>'+
  '<div class="card"><div class="bar">'+
    '<div class="seg" data-seg="quoteStatus">'+["","New","Quoted","Won","Lost"].map(s=>'<button data-v="'+s+'" aria-pressed="'+(F.quoteStatus===s)+'">'+(s||"All")+'</button>').join("")+'</div>'+
    '<div style="margin-left:auto"><button class="btn btn-p btn-x" data-act="newQuote">+ New quote</button></div>'+
  '</div>'+
  table([
    {t:"Ref",f:q=>'<span class="t-id">'+esc(q.id)+'</span>'},
    {t:"Customer",f:q=>'<span class="t-main">'+esc(cust(q.cust).name)+'</span>'},
    {t:"Lane",f:q=>esc(q.orig)+' → '+esc(q.dest)+'<div class="t-sub">'+q.miles.toLocaleString()+' mi · '+esc(q.equip)+'</div>'},
    {t:"Ready",f:q=>'<span class="t-id">'+fdate(q.ready)+'</span>'},
    {t:"Received",f:q=>'<span class="t-sub">'+esc(q.recv)+'</span>'},
    {t:"Target",r:1,n:1,f:q=>money(q.target)},
    {t:"Status",f:q=>tag(q.status,tone[q.status])},
    {t:"",r:1,f:q=>'<button class="btn btn-s btn-x" data-quote="'+q.id+'">'+(q.status==="New"?"Price it":"Open")+'</button>'}
  ],rows.map(q=>Object.assign({_id:q.id},q)),{click:true,empty:"No quotes in that state."})+
  '</div></div>';
};
AFTER.quotes=function(){
  $$("[data-quote]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openQuote(b.dataset.quote);}));
  $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openQuote(r.dataset.id)));
};

/* ---------- LOADS ---------- */
VIEWS.loads=function(){
  const q=F.loadQ.toLowerCase();
  const rows=DB.loads.filter(function(l){
    if(F.loadStatus&&l.status!==F.loadStatus) return false;
    if(q&&(l.id+" "+l.orig+" "+l.dest+" "+cust(l.cust).name+" "+carr(l.carrier).name+" "+l.ref).toLowerCase().indexOf(q)<0) return false;
    return true;
  }).sort((a,b)=>b.pickup-a.pickup);
  const rev=rows.reduce((s,l)=>s+loadRevenue(l),0), cost=rows.reduce((s,l)=>s+loadCost(l),0);
  const stages=["Booked","At pickup","In transit","Delivered"];
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Loads shown",rows.length,{dlt:activeLoads().length+" active right now",sm:true})+
    stat("Revenue",money(rev),{dlt:"Customer side",sm:true})+
    stat("Carrier cost",money(cost),{dlt:"Linehaul + accessorials",sm:true})+
    stat("Gross margin",money(rev-cost),{hi:true,dlt:pct(rev-cost,rev).toFixed(1)+"% of revenue",tone:"up",sm:true})+
  '</div>'+
  '<div class="card"><div class="bar">'+
    '<input class="grow" type="search" id="loadQ" placeholder="Search load, lane, customer, carrier, PO…" value="'+esc(F.loadQ)+'">'+
    '<select data-filter="loadStatus">'+["","Booked","At pickup","In transit","Delivered","Invoiced","Paid","At risk"]
      .map(s=>'<option value="'+s+'"'+(F.loadStatus===s?" selected":"")+'>'+(s||"All statuses")+'</option>').join("")+'</select>'+
    '<button class="btn btn-s btn-x" data-act="exportLoads">'+ic("dl",14)+' Export</button>'+
    '<button class="btn btn-p btn-x" data-act="newLoad">+ New load</button>'+
  '</div>'+
  table([
    {t:"Load",f:l=>'<span class="t-id">'+esc(l.id)+'</span><div class="t-sub">'+esc(l.ref)+'</div>'},
    {t:"Lane",f:l=>'<span class="t-main">'+esc(l.orig)+' → '+esc(l.dest)+'</span><div class="t-sub">'+l.miles.toLocaleString()+' mi · '+esc(l.equip)+'</div>'},
    {t:"Customer",f:l=>esc(cust(l.cust).name)},
    {t:"Carrier",f:l=>esc(carr(l.carrier).name)},
    {t:"Pickup",f:l=>'<span class="t-id">'+fdate(l.pickup)+'</span>'},
    {t:"Progress",f:function(l){
      if(l.status==="At risk") return '<div class="prog"><i class="dn"></i><i class="rk"></i><i></i><i></i></div>';
      const n=Math.max(1,stages.indexOf(l.status)+1)||4, done=["Invoiced","Paid"].indexOf(l.status)>=0;
      let h="";for(let i=1;i<=4;i++) h+='<i class="'+(done||i<n?"dn":(i===n?"on":""))+'"></i>';
      return '<div class="prog">'+h+'</div>';
    }},
    {t:"Revenue",r:1,n:1,f:l=>money(loadRevenue(l))},
    {t:"Margin",r:1,n:1,f:l=>'<b style="color:var(--good)">'+money(loadMargin(l))+'</b><div class="t-sub">'+pct(loadMargin(l),loadRevenue(l)).toFixed(1)+'%</div>'},
    {t:"Status",f:l=>tag(l.status,LOAD_TONE[l.status])}
  ],rows.map(l=>Object.assign({_id:l.id},l)),{click:true,empty:"No loads match those filters."})+
  '</div></div>';
};
AFTER.loads=function(){
  $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openLoad(r.dataset.id)));
  const s=$("#loadQ"); if(s) s.addEventListener("input",function(){ F.loadQ=this.value; const p=this.selectionStart; render(); const n=$("#loadQ"); if(n){n.focus();n.setSelectionRange(p,p);} });
};

/* ---------- DISPATCH ---------- */
VIEWS.dispatch=function(){
  const byStatus=s=>DB.trucks.filter(t=>t.status===s);
  const cols=[["Available","ok"],["On load","info"],["Out of service","bad"]];
  const openLoads=DB.loads.filter(l=>["Booked","At pickup","In transit","At risk"].indexOf(l.status)>=0);
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Trucks available",byStatus("Available").length,{sm:true,dlt:"Ready to assign",hi:true})+
    stat("Under load",byStatus("On load").length,{sm:true,dlt:"Moving now"})+
    stat("Out of service",byStatus("Out of service").length,{sm:true,dlt:"Maintenance / down",tone:"down"})+
    stat("Loads needing a truck",openLoads.filter(l=>l.status==="Booked").length,{sm:true,dlt:"Booked, not yet at pickup"})+
  '</div>'+
  '<div class="grid g3">'+cols.map(function(c){
    return '<div class="card"><div class="card-h"><h3>'+c[0]+'</h3><span class="sub">'+byStatus(c[0]).length+'</span></div>'+
      (byStatus(c[0]).length?byStatus(c[0]).map(function(t){
        const l=DB.loads.find(x=>x.carrier===t.carrier&&["At pickup","In transit","At risk"].indexOf(x.status)>=0);
        return '<div class="att"><i class="sv '+(c[1]==="bad"?"hi":c[1]==="ok"?"lo":"md")+'"></i><div style="min-width:0">'+
          '<b>'+esc(t.unit)+' · '+esc(t.driver)+'</b>'+
          '<span>'+esc(carr(t.carrier).name)+' · '+esc(t.loc)+'</span>'+
          (l?'<span class="t-sub">On '+esc(l.id)+' → '+esc(l.dest)+'</span>':"")+
        '</div>'+(c[0]==="Available"?'<button class="btn btn-s btn-x" data-assign="'+t.id+'">Assign</button>':"")+'</div>';
      }).join(""):'<div class="empty">None.</div>')+'</div>';
  }).join("")+'</div>'+
  '<div class="card"><div class="card-h"><h3>Loads in motion</h3><span class="sub">'+openLoads.length+' open</span></div>'+
  table([
    {t:"Load",f:l=>'<span class="t-id">'+esc(l.id)+'</span>'},
    {t:"Lane",f:l=>'<span class="t-main">'+esc(l.orig)+' → '+esc(l.dest)+'</span>'},
    {t:"Carrier",f:l=>esc(carr(l.carrier).name)},
    {t:"Pickup",f:l=>'<span class="t-id">'+fdate(l.pickup)+'</span>'},
    {t:"Delivery",f:l=>'<span class="t-id">'+fdate(l.delivery)+'</span>'},
    {t:"Status",f:l=>tag(l.status,LOAD_TONE[l.status])},
    {t:"",r:1,f:l=>'<button class="btn btn-s btn-x" data-adv="'+l.id+'">Advance</button>'}
  ],openLoads.map(l=>Object.assign({_id:l.id},l)),{click:true,empty:"Nothing moving."})+
  '</div></div>';
};
AFTER.dispatch=function(){
  $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openLoad(r.dataset.id)));
  $$("[data-adv]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();advanceLoad(b.dataset.adv);}));
  $$("[data-assign]").forEach(b=>b.addEventListener("click",()=>assignModal(b.dataset.assign)));
};

/* ---------- INVOICES (AR) ---------- */
function dso(){
  const paid=DB.payments.filter(p=>p.dir==="in"&&p.link&&inv(p.link));
  if(!paid.length) return 0;
  return paid.reduce((s,p)=>s+Math.max(0,days(p.date,inv(p.link).issued)),0)/paid.length;
}
VIEWS.invoices=function(){
  const q=F.invQ.toLowerCase();
  const rows=DB.invoices.filter(function(i){
    const st=invStatus(i);
    if(F.invStatus&&st!==F.invStatus) return false;
    if(q&&(i.id+" "+cust(i.cust).name+" "+i.loads.join(" ")).toLowerCase().indexOf(q)<0) return false;
    return true;
  }).sort((a,b)=>b.issued-a.issued);
  const un=uninvoiced();
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Receivables open",money(arTotal()),{hi:true,dlt:arOpen().length+" invoices",sm:true})+
    stat("Overdue",money(overdue().reduce((s,i)=>s+invBalance(i),0)),{danger:overdue().length>0,dlt:overdue().length+" invoices past due",tone:"down",sm:true})+
    stat("Average days to pay",dso().toFixed(0)+" days",{dlt:"Terms average "+Math.round(DB.customers.reduce((s,c)=>s+c.terms,0)/DB.customers.length)+" days",sm:true})+
    stat("Disputed",money(DB.invoices.filter(i=>i.disputed).reduce((s,i)=>s+invBalance(i),0)),{dlt:DB.invoices.filter(i=>i.disputed).length+" in dispute",sm:true})+
  '</div>'+

  (un.length?'<div class="note">'+ic("info",16)+'<div><b>'+un.length+' delivered load'+(un.length>1?"s are":" is")+' ready to invoice</b> — '+
    money(un.reduce((s,l)=>s+loadRevenue(l),0))+' of revenue. '+
    '<button class="btn btn-p btn-x" style="margin-left:6px" data-act="newInvoice">Create invoice</button></div></div>':"")+

  '<div class="card">'+
    '<div class="bar">'+
      '<input class="grow" type="search" id="invQ" placeholder="Search invoice, customer, load…" value="'+esc(F.invQ)+'">'+
      '<div class="seg" data-seg="invStatus">'+["","Draft","Sent","Partial","Overdue","Paid","Disputed"].map(s=>'<button data-v="'+s+'" aria-pressed="'+(F.invStatus===s)+'">'+(s||"All")+'</button>').join("")+'</div>'+
      '<button class="btn btn-s btn-x" data-act="exportAR">'+ic("dl",14)+' Export</button>'+
    '</div>'+
    (F.sel.length?'<div class="selbar">'+F.sel.length+' selected · '+money(F.sel.map(id=>inv(id)).filter(Boolean).reduce((s,i)=>s+invBalance(i),0))+' outstanding'+
      '<span class="right"><button class="btn btn-s btn-x" data-act="sendSel">'+ic("mail",13)+' Send / remind</button>'+
      '<button class="btn btn-p btn-x" data-act="paySel">Record payments</button>'+
      '<button class="btn btn-g btn-x" data-act="clearSel">Clear</button></span></div>':"")+
    table([
      {t:"",f:i=>'<input class="chk" type="checkbox" data-sel="'+i.id+'"'+(F.sel.indexOf(i.id)>=0?" checked":"")+' aria-label="Select '+esc(i.id)+'">'},
      {t:"Invoice",f:i=>'<span class="t-id">'+esc(i.id)+'</span>'+(i.loads.length?'<div class="t-sub">'+esc(i.loads.join(", "))+'</div>':'<div class="t-sub">Manual</div>')},
      {t:"Customer",f:i=>'<span class="t-main">'+esc(cust(i.cust).name)+'</span><div class="t-sub">Net '+i.terms+' · '+esc(cust(i.cust).method.type)+'</div>'},
      {t:"Issued",f:i=>'<span class="t-id">'+fdate(i.issued)+'</span>'},
      {t:"Due",f:function(i){ const n=days(TODAY,i.due); const st=invStatus(i);
        return '<span class="t-id">'+fdate(i.due)+'</span>'+(st!=="Paid"&&n>0?'<div class="t-sub" style="color:var(--bad)">'+n+' days late</div>':(st!=="Paid"&&st!=="Draft"?'<div class="t-sub">in '+(-n)+' days</div>':"")); }},
      {t:"Amount",r:1,n:1,f:i=>money(i.amount)},
      {t:"Paid",r:1,n:1,f:i=>i.paid?'<span style="color:var(--good)">'+money(i.paid)+'</span>':'<span class="dim">—</span>'},
      {t:"Balance",r:1,n:1,f:i=>'<b>'+money(invBalance(i))+'</b>'},
      {t:"Status",f:i=>tag(invStatus(i),INV_TONE[invStatus(i)])},
      {t:"",r:1,f:function(i){
        const st=invStatus(i);
        if(st==="Draft") return '<button class="btn btn-p btn-x" data-send="'+i.id+'">Send</button>';
        if(st==="Paid") return '<button class="btn btn-g btn-x" data-inv="'+i.id+'">View</button>';
        return '<button class="btn btn-s btn-x" data-pay="'+i.id+'">Record payment</button>';
      }}
    ],rows.map(i=>Object.assign({_id:i.id},i)),{click:true,empty:"No invoices match those filters."})+
  '</div>'+

  '<div class="grid g2">'+
    '<div class="card"><div class="card-h"><h3>Receivables aging</h3><span class="sub">'+money(arTotal())+' open</span></div>'+
      '<div class="card-b">'+meters(arAging().map(b=>({k:b.k,v:b.v,l:kmoney(b.v),c:b.c})))+'</div></div>'+
    '<div class="card"><div class="card-h"><h3>Exposure by customer</h3><span class="sub">open balance</span></div><div class="card-b">'+
      meters(DB.customers.map(c=>({k:c.name,v:creditUsed(c.id),l:kmoney(creditUsed(c.id)),c:creditUsed(c.id)>c.credit*0.8?"r":""}))
        .filter(r=>r.v>0).sort((a,b)=>b.v-a.v))+'</div></div>'+
  '</div></div>';
};
AFTER.invoices=function(){
  $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openInvoice(r.dataset.id)));
  $$("[data-pay]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();payModal(b.dataset.pay);}));
  $$("[data-send]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();sendInvoice(b.dataset.send);}));
  $$("[data-inv]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openInvoice(b.dataset.inv);}));
  $$("[data-sel]").forEach(b=>b.addEventListener("click",function(e){
    e.stopPropagation(); const id=this.dataset.sel, k=F.sel.indexOf(id);
    if(k>=0) F.sel.splice(k,1); else F.sel.push(id); render();
  }));
  const s=$("#invQ"); if(s) s.addEventListener("input",function(){ F.invQ=this.value; const p=this.selectionStart; render(); const n=$("#invQ"); if(n){n.focus();n.setSelectionRange(p,p);} });
  $("#pageActions").innerHTML='<button class="btn btn-s btn-x" data-act="statement">Send statements</button><button class="btn btn-p btn-x" data-act="newInvoice">+ Create invoice</button>';
};

/* ---------- SETTLEMENTS (AP) ---------- */
VIEWS.settlements=function(){
  const rows=DB.settlements.filter(s=>!F.setStatus||s.status===F.setStatus).sort((a,b)=>(b.paidOn||TODAY)-(a.paidOn||TODAY));
  const qpFees=DB.settlements.filter(s=>s.status==="Paid").reduce((s,x)=>s+x.fee,0);
  const paidMTD=DB.settlements.filter(s=>s.status==="Paid"&&s.paidOn&&s.paidOn>=d(2026,9,1)).reduce((s,x)=>s+x.net,0);
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Payable open",money(apTotal()),{hi:true,dlt:apOpen().length+" settlements",sm:true})+
    stat("Awaiting approval",money(pendingSettlements().reduce((s,x)=>s+x.net,0)),{dlt:pendingSettlements().length+" need a decision",tone:pendingSettlements().length?"down":"",sm:true})+
    stat("Paid month to date",money(paidMTD),{dlt:"Carriers and factors",sm:true})+
    stat("Quick-pay fees earned",money(qpFees),{dlt:"3% of linehaul, opt-in",tone:"up",sm:true})+
  '</div>'+
  '<div class="card">'+
    '<div class="bar">'+
      '<div class="seg" data-seg="setStatus">'+["","Pending","Approved","Paid"].map(s=>'<button data-v="'+s+'" aria-pressed="'+(F.setStatus===s)+'">'+(s||"All")+'</button>').join("")+'</div>'+
      '<div style="margin-left:auto" class="btn-row">'+
        '<button class="btn btn-s btn-x" data-act="approveAll">Approve all pending</button>'+
        '<button class="btn btn-p btn-x" data-act="payRun">Run payment batch</button></div>'+
    '</div>'+
    table([
      {t:"Settlement",f:s=>'<span class="t-id">'+esc(s.id)+'</span><div class="t-sub">'+esc(s.loads.join(", "))+'</div>'},
      {t:"Carrier",f:s=>'<span class="t-main">'+esc(carr(s.carrier).name)+'</span><div class="t-sub">MC '+esc(carr(s.carrier).mc)+(s.factor?' · factored to '+esc(s.factor):"")+'</div>'},
      {t:"Gross",r:1,n:1,f:s=>money(s.gross)},
      {t:"Deductions",r:1,n:1,f:s=>s.ded.length?'<span style="color:var(--bad)">-'+money(s.ded.reduce((a,x)=>a+x.amt,0))+'</span>':'<span class="dim">—</span>'},
      {t:"Quick pay",r:1,n:1,f:s=>s.quickPay?'<span style="color:var(--warn)">-'+money(s.fee)+'</span><div class="t-sub">1-day</div>':'<span class="dim">Net 30</span>'},
      {t:"Net pay",r:1,n:1,f:s=>'<b>'+money(s.net)+'</b>'},
      {t:"Method",f:s=>'<span class="t-sub">'+esc(s.method)+'</span>'},
      {t:"Status",f:s=>tag(s.status,SET_TONE[s.status])},
      {t:"",r:1,f:function(s){
        if(s.status==="Pending") return '<button class="btn btn-s btn-x" data-appr="'+s.id+'">Approve</button>';
        if(s.status==="Approved") return '<button class="btn btn-p btn-x" data-payc="'+s.id+'">Pay now</button>';
        return '<span class="t-sub">'+(s.paidOn?fdate(s.paidOn):"")+'</span>';
      }}
    ],rows.map(s=>Object.assign({_id:s.id},s)),{click:true,empty:"No settlements in that state."})+
  '</div>'+
  '<div class="grid g2">'+
   '<div class="card"><div class="card-h"><h3>Owed by carrier</h3><span class="sub">open settlements</span></div><div class="card-b">'+
    (apOpen().length?meters(DB.carriers.map(function(c){
      const v=apOpen().filter(s=>s.carrier===c.id).reduce((a,s)=>a+s.net,0);
      return {k:c.name,v:v,l:kmoney(v),c:"w"};
    }).filter(r=>r.v>0).sort((a,b)=>b.v-a.v)):'<div class="empty">Everyone is paid.</div>')+'</div></div>'+
   '<div class="card"><div class="card-h"><h3>How carriers get paid</h3></div><div class="card-b"><div class="rows">'+
    '<div class="row"><span class="rl">Standard terms</span><span class="rr">Net 30 after POD</span></div>'+
    '<div class="row"><span class="rl">Quick pay</span><span class="rr">Next business day · 3% fee</span></div>'+
    '<div class="row"><span class="rl">Factored carriers</span><span class="rr">Paid to factor on NOA</span></div>'+
    '<div class="row"><span class="rl">Fuel advances</span><span class="rr">Up to 40%, recovered at settlement</span></div>'+
    '<div class="row"><span class="rl">Carriers on quick pay</span><span class="rr">'+DB.carriers.filter(c=>c.quickPay).length+' of '+DB.carriers.length+'</span></div>'+
    '<div class="row total"><span class="rl">Open payable</span><span class="rr">'+money(apTotal())+'</span></div>'+
   '</div></div></div>'+
  '</div></div>';
};
AFTER.settlements=function(){
  $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openSettlement(r.dataset.id)));
  $$("[data-appr]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();approveSettlement(b.dataset.appr);}));
  $$("[data-payc]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();payCarrier(b.dataset.payc);}));
};

/* ---------- PAYMENTS ---------- */
VIEWS.payments=function(){
  const wk=weeklySeries();
  const rows=DB.payments.filter(p=>!F.payDir||p.dir===F.payDir).sort((a,b)=>b.date-a.date);
  const inM=DB.payments.filter(p=>p.dir==="in"&&p.date>=d(2026,9,1)).reduce((s,p)=>s+p.amount,0);
  const outM=DB.payments.filter(p=>p.dir==="out"&&p.date>=d(2026,9,1)).reduce((s,p)=>s+p.amount,0);
  const byMethod={};
  DB.payments.forEach(p=>{byMethod[p.method]=(byMethod[p.method]||0)+p.amount;});
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Received MTD",money(inM),{dlt:DB.payments.filter(p=>p.dir==="in"&&p.date>=d(2026,9,1)).length+" payments",tone:"up",sm:true})+
    stat("Paid out MTD",money(outM),{dlt:DB.payments.filter(p=>p.dir==="out"&&p.date>=d(2026,9,1)).length+" settlements",sm:true})+
    stat("Net cash MTD",kmoney(inM-outM),{hi:true,dlt:"In minus out",sm:true})+
    stat("Working capital gap",arTotal()-apTotal()>=0?money(arTotal()-apTotal()):money(arTotal()-apTotal()),{dlt:"AR "+kmoney(arTotal())+" · AP "+kmoney(apTotal()),sm:true})+
  '</div>'+
  '<div class="grid g-2-1">'+
    '<div class="card"><div class="card-h"><h3>Cash in vs. cash out</h3><span class="sub">8 weeks</span></div>'+
      '<div class="legend"><span><i style="background:var(--brand)"></i>In — customer payments</span><span><i style="background:var(--warn)"></i>Out — carrier pay</span></div>'+
      barChart("p",wk,{series:[{key:"in",color:"var(--brand)",name:"in"},{key:"out",color:"var(--warn)",name:"out"}],fmt:kmoney,alt:"Cash received versus paid out by week"})+'</div>'+
    '<div class="card"><div class="card-h"><h3>By method</h3><span class="sub">all time</span></div><div class="card-b">'+
      meters(Object.keys(byMethod).map(k=>({k:k,v:byMethod[k],l:kmoney(byMethod[k]),c:"c"})).sort((a,b)=>b.v-a.v))+'</div></div>'+
  '</div>'+
  '<div class="card">'+
    '<div class="bar"><div class="seg" data-seg="payDir">'+[["","All"],["in","Money in"],["out","Money out"]].map(x=>'<button data-v="'+x[0]+'" aria-pressed="'+(F.payDir===x[0])+'">'+x[1]+'</button>').join("")+'</div>'+
    '<span class="sub" style="margin-left:auto;color:var(--ink-3);font-size:11.5px">'+rows.length+' transactions</span></div>'+
    table([
      {t:"Date",f:p=>'<span class="t-id">'+fdateY(p.date)+'</span>'},
      {t:"Direction",f:p=>p.dir==="in"?tag("Received","ok"):tag("Paid out","warn")},
      {t:"Party",f:p=>'<span class="t-main">'+esc(p.party)+'</span>'},
      {t:"Method",f:p=>esc(p.method)},
      {t:"Reference",f:p=>'<span class="t-id">'+esc(p.ref)+'</span>'},
      {t:"Applied to",f:p=>p.link?'<span class="t-id">'+esc(p.link)+'</span>':'<span class="dim">—</span>'},
      {t:"Amount",r:1,n:1,f:p=>'<b style="color:'+(p.dir==="in"?"var(--good)":"var(--ink)")+'">'+(p.dir==="in"?"+":"−")+money2(p.amount).slice(1)+'</b>'}
    ],rows.map(p=>Object.assign({_id:p.id},p)),{empty:"No transactions."})+
  '</div>'+
  '<div class="card"><div class="card-h"><h3>Payment methods on file</h3><span class="sub">customers</span></div>'+
    table([
      {t:"Customer",f:c=>'<span class="t-main">'+esc(c.name)+'</span>'},
      {t:"Method",f:c=>esc(c.method.type)+(c.method.last4!=="—"?' <span class="t-id">•••• '+esc(c.method.last4)+'</span>':"")},
      {t:"Terms",f:c=>"Net "+c.terms},
      {t:"Open balance",r:1,n:1,f:c=>money(creditUsed(c.id))},
      {t:"",r:1,f:c=>'<button class="btn btn-s btn-x" data-method="'+c.id+'">Update</button>'}
    ],DB.customers.map(c=>Object.assign({_id:c.id},c)),{empty:""})+
  '</div></div>';
};
AFTER.payments=function(){
  $$("[data-method]").forEach(b=>b.addEventListener("click",()=>methodModal(b.dataset.method)));
};

/* ---------- CUSTOMERS ---------- */
VIEWS.customers=function(){
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Active customers",DB.customers.length,{sm:true,dlt:"Billing accounts"})+
    stat("Total exposure",money(DB.customers.reduce((s,c)=>s+creditUsed(c.id),0)),{sm:true,dlt:"Open receivables"})+
    stat("Credit granted",money(DB.customers.reduce((s,c)=>s+c.credit,0)),{sm:true,dlt:"Approved limits"})+
    stat("Over 80% of limit",DB.customers.filter(c=>creditUsed(c.id)>c.credit*0.8).length,{sm:true,dlt:"Watch list",tone:DB.customers.filter(c=>creditUsed(c.id)>c.credit*0.8).length?"down":""})+
  '</div>'+
  '<div class="card"><div class="card-h"><h3>Accounts</h3><span class="right"><button class="btn btn-p btn-x" data-act="newCustomer">+ Add customer</button></span></div>'+
  table([
    {t:"Customer",f:c=>'<span class="t-main">'+esc(c.name)+'</span><div class="t-sub">'+esc(c.contact)+' · since '+esc(c.since)+'</div>'},
    {t:"Terms",f:c=>"Net "+c.terms},
    {t:"Payment method",f:c=>esc(c.method.type)+(c.method.last4!=="—"?' <span class="t-id">••'+esc(c.method.last4)+'</span>':"")},
    {t:"Loads",r:1,n:1,f:c=>DB.loads.filter(l=>l.cust===c.id).length},
    {t:"Revenue",r:1,n:1,f:c=>money(custRevenue(c.id))},
    {t:"Credit used",f:function(c){
      const u=creditUsed(c.id), p=Math.min(100,pct(u,c.credit));
      return '<div class="mb-r" style="grid-template-columns:minmax(0,1fr) 84px;gap:8px"><div class="trk"><em class="'+(p>80?"r":p>60?"w":"g")+'" style="width:'+p.toFixed(0)+'%"></em></div>'+
        '<b>'+kmoney(u)+' / '+kmoney(c.credit)+'</b></div>';
    }},
    {t:"Open AR",r:1,n:1,f:c=>'<b>'+money(creditUsed(c.id))+'</b>'}
  ],DB.customers.map(c=>Object.assign({_id:c.id},c)),{click:true,empty:""})+
  '</div></div>';
};
AFTER.customers=function(){ $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openCustomer(r.dataset.id))); };

/* ---------- CARRIERS ---------- */
VIEWS.carriers=function(){
  const pend=pendingCarriers(), act=DB.carriers.filter(c=>c.status==="active");
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Active carriers",act.length,{sm:true,dlt:"In the network"})+
    stat("Awaiting decision",pend.length,{sm:true,hi:pend.length>0,dlt:"Applications"})+
    stat("Compliance flags",insuranceRisk().length,{sm:true,dlt:"Insurance within 30 days",tone:insuranceRisk().length?"down":""})+
    stat("Average on-time",(act.reduce((s,c)=>s+c.onTime,0)/(act.length||1)).toFixed(1)+"%",{sm:true,dlt:"Pickup and delivery"})+
  '</div>'+
  (pend.length?'<div class="card"><div class="card-h"><h3>Onboarding queue</h3><span class="sub">'+pend.length+' awaiting decision</span></div>'+
    pend.map(c=>'<div class="att"><i class="sv '+(c.status==="review"?"hi":"lo")+'"></i><div style="min-width:0">'+
      '<b>'+esc(c.name)+' <span class="t-id">MC '+esc(c.mc)+' · DOT '+esc(c.dot)+'</span></b>'+
      '<span>'+esc(c.base)+' · '+esc(c.equip.join(", "))+'</span>'+
      '<span class="t-sub" style="color:'+(c.status==="review"?"var(--bad)":"var(--ink-3)")+'">'+esc(c.note||"")+'</span></div>'+
      '<div class="btn-row"><button class="btn btn-p btn-x" data-appc="'+c.id+'">Approve</button>'+
      '<button class="btn btn-d btn-x" data-decc="'+c.id+'">Decline</button></div></div>').join("")+'</div>':"")+
  '<div class="card"><div class="card-h"><h3>Active roster</h3><span class="sub">'+act.length+' carriers</span></div>'+
  table([
    {t:"Carrier",f:c=>'<span class="t-main">'+esc(c.name)+'</span><div class="t-sub">MC '+esc(c.mc)+' · '+esc(c.base)+'</div>'},
    {t:"Equipment",f:c=>'<span class="t-sub">'+esc(c.equip.join(", "))+'</span>'},
    {t:"Loads",r:1,n:1,f:c=>c.hauled},
    {t:"On-time",r:1,n:1,f:c=>c.onTime.toFixed(1)+"%"},
    {t:"Rating",f:c=>'<span style="color:var(--warn)">'+"★".repeat(Math.round(c.rating))+'</span> <span class="t-id">'+c.rating.toFixed(1)+'</span>'},
    {t:"Pay terms",f:c=>c.quickPay?tag("Quick pay 3%","warn"):tag("Net 30")},
    {t:"Factoring",f:c=>c.factor||c.factoring?esc(c.factoring):'<span class="dim">Direct</span>'},
    {t:"Insurance",f:function(c){
      const n=days(c.insExp,TODAY);
      const tone=n<0?"bad":n<30?"warn":"";
      return '<span class="tag '+tone+'"><i></i>'+(n<0?"Expired":fdate(c.insExp))+'</span>';
    }},
    {t:"Owed",r:1,n:1,f:c=>{const v=apOpen().filter(s=>s.carrier===c.id).reduce((a,s)=>a+s.net,0);return v?money(v):'<span class="dim">—</span>';}}
  ],act.map(c=>Object.assign({_id:c.id},c)),{click:true,empty:""})+
  '</div></div>';
};
AFTER.carriers=function(){
  $$("[data-appc]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();setCarrier(b.dataset.appc,"active");}));
  $$("[data-decc]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();setCarrier(b.dataset.decc,"declined");}));
  $$("#content tbody tr[data-id]").forEach(r=>r.addEventListener("click",()=>openCarrier(r.dataset.id)));
};

/* ---------- REPORTS ---------- */
VIEWS.reports=function(){
  const wk=weeklySeries(), lanes=laneMargins();
  const byCust=DB.customers.map(function(c){
    const ls=DB.loads.filter(l=>l.cust===c.id);
    const rev=ls.reduce((s,l)=>s+loadRevenue(l),0), mg=ls.reduce((s,l)=>s+loadMargin(l),0);
    return {name:c.name,n:ls.length,rev:rev,mg:mg,pct:pct(mg,rev)};
  }).filter(x=>x.n).sort((a,b)=>b.rev-a.rev);
  const eq={};
  DB.loads.forEach(l=>{eq[l.equip]=(eq[l.equip]||0)+loadRevenue(l);});
  const m=mtd();
  return '<div class="stack">'+
  '<div class="grid g4">'+
    stat("Revenue MTD",money(m.rev),{sm:true,dlt:m.count+" loads"})+
    stat("Margin MTD",money(m.margin),{sm:true,dlt:m.pct.toFixed(1)+"%",tone:"up"})+
    stat("Revenue per load",money(m.count?m.rev/m.count:0),{sm:true,dlt:"Average"})+
    stat("Revenue per mile",'$'+(DB.loads.reduce((s,l)=>s+loadRevenue(l),0)/DB.loads.reduce((s,l)=>s+l.miles,0)).toFixed(2),{sm:true,dlt:"All equipment"})+
  '</div>'+
  '<div class="grid g2">'+
    '<div class="card"><div class="card-h"><h3>Revenue by week</h3><span class="sub">8 weeks</span></div>'+
      barChart("rw",wk,{series:[{key:"rev",color:"var(--brand)"}],fmt:kmoney,alt:"Revenue booked per week over eight weeks"})+'</div>'+
    '<div class="card"><div class="card-h"><h3>Margin by week</h3><span class="sub">8 weeks</span></div>'+
      lineChart(wk.map(w=>({label:w.label,v:w.margin})),{fmt:kmoney,alt:"Gross margin per week"})+'</div>'+
  '</div>'+
  '<div class="grid g2">'+
   '<div class="card"><div class="card-h"><h3>Customer profitability</h3></div>'+
    table([
      {t:"Customer",f:r=>'<span class="t-main">'+esc(r.name)+'</span>'},
      {t:"Loads",r:1,n:1,f:r=>r.n},
      {t:"Revenue",r:1,n:1,f:r=>money(r.rev)},
      {t:"Margin",r:1,n:1,f:r=>money(r.mg)},
      {t:"Margin %",r:1,n:1,f:r=>'<b style="color:'+(r.pct>=18?"var(--good)":r.pct>=14?"var(--warn)":"var(--bad)")+'">'+r.pct.toFixed(1)+'%</b>'}
    ],byCust,{empty:""})+'</div>'+
   '<div class="card"><div class="card-h"><h3>Lane profitability</h3><span class="sub">total margin</span></div><div class="card-b">'+
    meters(lanes.slice(0,8).map(l=>({k:l.k,v:l.margin,l:money(l.margin),c:"c"})))+'</div></div>'+
  '</div>'+
  '<div class="grid g2">'+
   '<div class="card"><div class="card-h"><h3>Revenue by equipment</h3></div><div class="card-b">'+
    meters(Object.keys(eq).map(k=>({k:k,v:eq[k],l:kmoney(eq[k])})).sort((a,b)=>b.v-a.v))+'</div></div>'+
   '<div class="card"><div class="card-h"><h3>Carrier scorecard</h3></div>'+
    table([
      {t:"Carrier",f:c=>'<span class="t-main">'+esc(c.name)+'</span>'},
      {t:"Loads",r:1,n:1,f:c=>c.hauled},
      {t:"On-time",r:1,n:1,f:c=>c.onTime.toFixed(1)+"%"},
      {t:"Rating",r:1,n:1,f:c=>c.rating.toFixed(1)},
      {t:"Status",f:c=>c.rating>=4.5?tag("Preferred","ok"):c.rating>=4?tag("Approved","info"):tag("Watch","warn")}
    ],DB.carriers.filter(c=>c.status==="active").sort((a,b)=>b.rating-a.rating),{empty:""})+'</div>'+
  '</div></div>';
};

/* ---------- SETTINGS ---------- */
VIEWS.settings=function(){
  if(!DB.users||!DB.users.length) DB.users=DEFAULT_USERS.map(u=>u.slice());
  const users=DB.users;
  const acc=[["Detention","$55 / hr after 2 free hrs","Billed to customer"],["Layover","$250 / day","Billed to customer"],["TONU","$150 flat","Paid to carrier"],["Lumper","At cost","Pass-through"],["Driver assist","$120","Billed to customer"],["Tarps","$100","Paid to carrier"]];
  const integ=[["QuickBooks Online","Sync invoices, payments and settlements","Connected"],["Stripe / ACH","Collect customer payments online","Connected"],["FMCSA SAFER","Authority and safety verification","Connected"],["Macropoint tracking","Load location updates","Not connected"],["TAFS factoring","NOA and factor payouts","Connected"],["Twilio SMS","Driver check calls","Not connected"]];
  return '<div class="stack"><div class="grid g2">'+
   '<div class="card"><div class="card-h"><h3>Company</h3></div><div class="card-b"><div class="rows">'+
     '<div class="row"><span class="rl">Legal name</span><span class="rr">S&amp;S Cargo LLC</span></div>'+
     '<div class="row"><span class="rl">Broker authority</span><span class="rr">MC 1187442</span></div>'+
     '<div class="row"><span class="rl">USDOT</span><span class="rr">3844091</span></div>'+
     '<div class="row"><span class="rl">Surety bond</span><span class="rr">BMC-84 · $75,000</span></div>'+
     '<div class="row"><span class="rl">Cargo / liability</span><span class="rr">$2,000,000 / $1,000,000</span></div>'+
     '<div class="row"><span class="rl">Remit-to</span><span class="rr">Dallas, TX</span></div>'+
   '</div></div></div>'+
   '<div class="card"><div class="card-h"><h3>Default terms</h3></div><div class="card-b"><div class="rows">'+
     '<div class="row"><span class="rl">Customer payment terms</span><span class="rr">Net 30</span></div>'+
     '<div class="row"><span class="rl">Carrier payment terms</span><span class="rr">Net 30 after POD</span></div>'+
     '<div class="row"><span class="rl">Quick-pay fee</span><span class="rr">3.0%</span></div>'+
     '<div class="row"><span class="rl">Target gross margin</span><span class="rr">15.0%</span></div>'+
     '<div class="row"><span class="rl">Manager override below</span><span class="rr">10.0%</span></div>'+
     '<div class="row"><span class="rl">Fuel advance ceiling</span><span class="rr">40% of linehaul</span></div>'+
   '</div></div></div></div>'+
   '<div class="card"><div class="card-h"><h3>Users &amp; roles</h3><span class="right"><button class="btn btn-s btn-x" data-act="inviteUser">+ Invite user</button></span></div>'+
     table([{t:"Name",f:u=>'<span class="t-main">'+esc(u[0])+'</span>'},{t:"Role",f:u=>esc(u[1])},{t:"Permissions",f:u=>'<span class="t-sub">'+esc(u[2])+'</span>'},
       {t:"",r:1,f:u=>'<button class="btn btn-g btn-x" data-act="editUser" data-id="'+esc(u[3]||"")+'">Edit</button>'}],users,{empty:""})+'</div>'+
   '<div class="card"><div class="card-h"><h3>Accessorial catalog</h3><span class="sub">applied on loads and invoices</span></div>'+
     table([{t:"Charge",f:a=>'<span class="t-main">'+esc(a[0])+'</span>'},{t:"Rate",f:a=>esc(a[1])},{t:"Treatment",f:a=>'<span class="t-sub">'+esc(a[2])+'</span>'}],acc,{empty:""})+'</div>'+
   '<div class="card"><div class="card-h"><h3>Integrations</h3></div>'+
     table([{t:"Service",f:x=>'<span class="t-main">'+esc(x[0])+'</span>'},{t:"What it does",f:x=>'<span class="t-sub">'+esc(x[1])+'</span>'},
       {t:"Status",f:x=>x[2]==="Connected"?tag("Connected","ok"):tag("Not connected")},
       {t:"",r:1,f:x=>{var on=(DB.integrations&&DB.integrations[x[0]]!==undefined)?DB.integrations[x[0]]:(x[2]==="Connected");return '<button class="btn btn-'+(on?"g":"s")+' btn-x" data-act="integration" data-id="'+esc(x[0])+'">'+(on?"Disconnect":"Connect")+'</button>';}}],integ,{empty:""})+'</div>'+
   '<div class="note">'+ic("info",16)+'<div><b>Prototype.</b> Settings are display-only in this build; everything in Operations and Finance is fully interactive and recalculates live.</div></div>'+
  '</div>';
};

/* ================= DRAWERS ================= */
function drawer(title,sub,tabs,panes,foot){
  return '<div class="drawer-h"><div style="flex:1;min-width:0"><h3>'+title+'</h3><div class="sub">'+sub+'</div></div>'+
    '<button class="btn btn-g btn-x" data-dclose>'+ic("x",15)+'</button></div>'+
    (tabs.length>1?'<div class="tabs">'+tabs.map((t,i)=>'<button data-tab="'+i+'" aria-selected="'+(i===0)+'">'+esc(t)+'</button>').join("")+'</div>':"")+
    '<div class="drawer-b">'+panes.map((p,i)=>'<div class="tabpane" data-pane="'+i+'"'+(i?" hidden":"")+'>'+p+'</div>').join("")+'</div>'+
    (foot?'<div class="modal-f">'+foot+'</div>':"");
}
function wireDrawer(){
  $$("[data-dclose]").forEach(b=>b.addEventListener("click",closeDrawer));
  $$("#drawer [data-tab]").forEach(function(b){
    b.addEventListener("click",function(){
      $$("#drawer [data-tab]").forEach(x=>x.setAttribute("aria-selected",x===b));
      $$("#drawer [data-pane]").forEach(p=>p.hidden=p.dataset.pane!==b.dataset.tab);
    });
  });
}
function kv(pairs){ return '<div class="kv">'+pairs.map(p=>'<div><span class="k">'+esc(p[0])+'</span><span class="v">'+p[1]+'</span></div>').join("")+'</div>'; }
function rows(list){ return '<div class="rows">'+list.map(r=>'<div class="row'+(r[2]?" total":"")+'"><span class="rl">'+r[0]+'</span><span class="rr">'+r[1]+'</span></div>').join("")+'</div>'; }

function openLoad(id){
  const l=load(id); if(!l) return;
  const c=cust(l.cust), v=carr(l.carrier);
  const stages=["Booked","At pickup","In transit","Delivered"];
  const si=l.status==="At risk"?1:Math.max(0,stages.indexOf(l.status));
  const done=["Invoiced","Paid"].indexOf(l.status)>=0;
  const tl=stages.map(function(s,i){
    const cls=done||i<si?"done":(i===si?"now":"");
    const when=i===0?fdateY(addDays(l.pickup,-1)):i===1?fdateY(l.pickup):i===2?fdateY(l.pickup):fdateY(l.delivery);
    return '<div class="tl-i '+cls+'"><div class="tl-d">'+(done||i<si?ic("chk",12):"")+'</div><div><b>'+s+'</b>'+
      '<span>'+(i===0?"Rate confirmation signed by "+esc(v.name):i===1?"Arrived "+esc(l.orig):i===2?"Departed, ETA "+fdate(l.delivery):"POD collected at "+esc(l.dest))+'</span>'+
      '<time>'+when+'</time></div></div>';
  }).join("");
  const accRows=l.acc.length?l.acc.map(a=>[esc(a.label)+' <span class="t-sub">('+(a.side==="cust"?"billed":"carrier")+')</span>',(a.amt<0?"−":"")+money(Math.abs(a.amt))]):[["No accessorials",'<span class="dim">—</span>']];
  openDrawer(drawer(
    esc(l.id)+' <span class="tag '+(LOAD_TONE[l.status]||"")+'"><i></i>'+esc(l.status)+'</span>',
    esc(l.orig)+' → '+esc(l.dest)+' · '+l.miles.toLocaleString()+' mi · '+esc(l.equip),
    ["Overview","Financials","Timeline","Documents"],
    [
      kv([["Customer",esc(c.name)],["Customer ref",esc(l.ref)],["Carrier",esc(v.name)],["MC number",esc(v.mc)],
          ["Pickup",fdateY(l.pickup)],["Delivery",fdateY(l.delivery)],["Weight",l.weight.toLocaleString()+" lb"],["Commodity",esc(l.commodity)]])+
      (l.risk?'<div class="note bad">'+ic("warn",16)+'<div><b>At risk.</b> '+esc(l.risk)+'</div></div>':"")+
      '<div class="btn-row"><button class="btn btn-p btn-x" data-act="advance" data-id="'+l.id+'">Advance status</button>'+
      '<button class="btn btn-s btn-x" data-act="addAcc" data-id="'+l.id+'">Add accessorial</button></div>',

      rows([["Customer linehaul",money(l.rev)]].concat(l.acc.filter(a=>a.side==="cust").map(a=>["+ "+esc(a.label),money(a.amt)]))
        .concat([["<b>Total billed</b>","<b>"+money(loadRevenue(l))+"</b>"]]))+
      rows([["Carrier linehaul","−"+money(l.cost)]].concat(l.acc.filter(a=>a.side==="carr").map(a=>[(a.amt<0?"− ":"+ ")+esc(a.label),(a.amt<0?"+":"−")+money(Math.abs(a.amt))]))
        .concat([["<b>Total carrier pay</b>","<b>−"+money(loadCost(l))+"</b>"]]))+
      rows([["Gross margin",'<b style="color:var(--good)">'+money(loadMargin(l))+'</b>',1],
            ["Margin %",pct(loadMargin(l),loadRevenue(l)).toFixed(1)+"%"],
            ["Revenue per mile","$"+(loadRevenue(l)/l.miles).toFixed(2)],
            ["Invoice",l.invoiceId?'<a href="#" data-goinv="'+l.invoiceId+'">'+esc(l.invoiceId)+'</a>':'<span class="dim">Not invoiced</span>'],
            ["Carrier settlement",l.settlementId?'<a href="#" data-goset="'+l.settlementId+'">'+esc(l.settlementId)+'</a>':'<span class="dim">Not created</span>']]),

      '<div class="tl">'+tl+'</div>',

      l.docs.map(dd=>'<div class="att"><i class="sv lo"></i><div><b>'+esc(dd.n)+'</b><span>'+esc(dd.t)+' · uploaded by dispatch</span></div>'+
        '<button class="btn btn-g btn-x" data-act="docDl" data-id="'+esc(l.id+"|"+dd.t)+'">'+ic("dl",13)+'</button></div>').join("")+
      '<div class="btn-row" style="margin-top:12px"><button class="btn btn-s btn-x" data-act="docUp" data-id="'+l.id+'">Upload document</button></div>'
    ],
    '<span class="left">Margin <b>'+money(loadMargin(l))+'</b> · '+pct(loadMargin(l),loadRevenue(l)).toFixed(1)+'%</span>'+
    (l.status==="Delivered"&&!l.invoiceId?'<button class="btn btn-p btn-x" data-act="invoiceLoad" data-id="'+l.id+'">Invoice this load</button>':"")+
    (l.invoiceId?'<button class="btn btn-s btn-x" data-goinv="'+l.invoiceId+'">Open invoice</button>':"")
  ));
  wireDrawer();
}

function openInvoice(id){
  const i=inv(id); if(!i) return;
  const c=cust(i.cust), st=invStatus(i);
  const pays=DB.payments.filter(p=>p.link===i.id);
  const n=days(TODAY,i.due);
  openDrawer(drawer(
    esc(i.id)+' <span class="tag '+(INV_TONE[st]||"")+'"><i></i>'+st+'</span>',
    esc(c.name)+' · Net '+i.terms+' · issued '+fdateY(i.issued),
    ["Invoice","Payments"],
    [
      kv([["Customer",esc(c.name)],["Contact",esc(c.contact)],["Billing email",esc(c.email)],["Terms","Net "+i.terms],
          ["Issued",fdateY(i.issued)],["Due",fdateY(i.due)+(st!=="Paid"&&n>0?' <span style="color:var(--bad)">('+n+' days late)</span>':"")],
          ["Payment method",esc(c.method.type)+(c.method.last4!=="—"?" ••"+esc(c.method.last4):"")],["Loads",i.loads.length?esc(i.loads.join(", ")):"Manual invoice"]])+
      (i.note?'<div class="note '+(i.disputed?"bad":"")+'">'+ic(i.disputed?"warn":"info",16)+'<div>'+esc(i.note)+'</div></div>':"")+
      (i.loads.length?rows(i.loads.map(function(lid){
        const l=load(lid); if(!l) return ["Load "+lid,"—"];
        return [esc(l.id)+' <span class="t-sub">'+esc(l.orig)+' → '+esc(l.dest)+'</span>',money(loadRevenue(l))];
      })):"")+
      rows([["Invoice total",money(i.amount)],["Payments received",'<span style="color:var(--good)">'+(i.paid?"−"+money(i.paid):money(0))+'</span>'],
            ["Balance due",'<b>'+money(invBalance(i))+'</b>',1]]),

      (pays.length?table([
        {t:"Date",f:p=>fdateY(p.date)},{t:"Method",f:p=>esc(p.method)},{t:"Reference",f:p=>'<span class="t-id">'+esc(p.ref)+'</span>'},
        {t:"Amount",r:1,n:1,f:p=>money2(p.amount)}],pays,{empty:""})
        :'<div class="empty">No payments recorded yet.</div>')+
      '<div class="btn-row" style="margin-top:12px">'+(invBalance(i)>0?'<button class="btn btn-p btn-x" data-act="pay" data-id="'+i.id+'">Record a payment</button>':"")+
      (st!=="Paid"&&st!=="Draft"?'<button class="btn btn-s btn-x" data-act="remind" data-id="'+i.id+'">Send reminder</button>':"")+'</div>'
    ],
    '<span class="left">Balance <b>'+money(invBalance(i))+'</b></span>'+
    (st==="Draft"?'<button class="btn btn-p btn-x" data-act="send" data-id="'+i.id+'">Send invoice</button>':"")+
    (invBalance(i)>0&&st!=="Draft"?'<button class="btn btn-p btn-x" data-act="pay" data-id="'+i.id+'">Record payment</button>':"")+
    (i.disputed?'<button class="btn btn-s btn-x" data-act="resolve" data-id="'+i.id+'">Resolve dispute</button>':"")
  ));
  wireDrawer();
}

function openSettlement(id){
  const s=sett(id); if(!s) return;
  const v=carr(s.carrier);
  openDrawer(drawer(
    esc(s.id)+' <span class="tag '+(SET_TONE[s.status]||"")+'"><i></i>'+s.status+'</span>',
    esc(v.name)+' · MC '+esc(v.mc)+(s.factor?' · factored to '+esc(s.factor):""),
    ["Settlement"],
    [ kv([["Carrier",esc(v.name)],["Loads",esc(s.loads.join(", "))],["Pay method",esc(s.method)],
          ["Terms",s.quickPay?"Quick pay — next business day":"Net 30 after POD"],
          ["Status",s.status],["Paid on",s.paidOn?fdateY(s.paidOn):"—"]])+
      rows([["Gross pay",money(s.gross)]]
        .concat(s.ded.map(x=>["− "+esc(x.label),"−"+money(x.amt)]))
        .concat(s.quickPay?[["− Quick-pay fee (3%)","−"+money(s.fee)]]:[])
        .concat([["Net to carrier",'<b>'+money(s.net)+'</b>',1]]))+
      (s.factor?'<div class="note">'+ic("info",16)+'<div>Notice of assignment on file. Funds go to <b>'+esc(s.factor)+'</b>, not the carrier directly.</div></div>':"")+
      (s.quickPay?'<div class="note">'+ic("info",16)+'<div>Carrier opted into quick pay. We keep <b>'+money(s.fee)+'</b> and fund next business day.</div></div>':"")
    ],
    '<span class="left">Net '+money(s.net)+'</span>'+
    (s.status==="Pending"?'<button class="btn btn-p btn-x" data-act="approve" data-id="'+s.id+'">Approve</button>':"")+
    (s.status==="Approved"?'<button class="btn btn-p btn-x" data-act="payc" data-id="'+s.id+'">Pay now</button>':"")
  ));
  wireDrawer();
}

function openQuote(id){
  const q=DB.quotes.find(x=>x.id===id); if(!q) return;
  const c=cust(q.cust);
  const guessCost=Math.round(q.target*0.82/10)*10;
  openDrawer(drawer(
    esc(q.id)+' <span class="tag '+({New:"info",Quoted:"warn",Won:"ok",Lost:""}[q.status])+'"><i></i>'+q.status+'</span>',
    esc(c.name)+' · '+esc(q.orig)+' → '+esc(q.dest),
    ["Price this lane"],
    [ kv([["Customer",esc(c.name)],["Equipment",esc(q.equip)],["Miles",q.miles.toLocaleString()],["Weight",q.weight.toLocaleString()+" lb"],
          ["Ready",fdateY(q.ready)],["Customer target",money(q.target)],["Received",esc(q.recv)],["Credit available",money(Math.max(0,c.credit-creditUsed(q.cust)))]])+
      (q.notes?'<div class="note">'+ic("info",16)+'<div>'+esc(q.notes)+'</div></div>':"")+
      '<div class="card" style="box-shadow:none"><div class="card-b">'+
        '<div class="fg"><div class="f"><label for="pcust">Customer rate ($)</label><input id="pcust" type="number" step="10" value="'+q.target+'"></div>'+
        '<div class="f"><label for="pcarr">Carrier cost ($)</label><input id="pcarr" type="number" step="10" value="'+guessCost+'"></div></div>'+
        '<div class="grid g3" style="margin-top:14px">'+
          stat("Margin",'<span id="pm">—</span>',{sm:true})+stat("Margin %",'<span id="pmp">—</span>',{sm:true})+stat("Rate / mile",'<span id="prpm">—</span>',{sm:true})+
        '</div><p class="hint" id="pwarn" style="margin-top:10px;font-size:11.5px;color:var(--ink-3)"></p>'+
      '</div></div>'
    ],
    '<span class="left">Target margin 15% · override under 10%</span>'+
    (q.status!=="Won"&&q.status!=="Lost"?'<button class="btn btn-s btn-x" data-act="lose" data-id="'+q.id+'">Mark lost</button>'+
      '<button class="btn btn-p btn-x" data-act="quoteSend" data-id="'+q.id+'">'+(q.status==="New"?"Send quote":"Win &amp; book load")+'</button>':"")
  ));
  wireDrawer();
  function calc(){
    const a=+$("#pcust").value||0,b=+$("#pcarr").value||0,m=a-b,p=a?m/a*100:0;
    $("#pm").textContent=money(m); $("#pmp").textContent=p.toFixed(1)+"%";
    $("#prpm").textContent="$"+(a/q.miles).toFixed(2);
    $("#pm").style.color=$("#pmp").style.color=p<10?"var(--bad)":p<15?"var(--warn)":"var(--good)";
    $("#pwarn").textContent=p<10?"Below 10% — a manager must approve before this goes out.":p<15?"Under the 15% target.":"Healthy margin.";
  }
  $("#pcust").addEventListener("input",calc); $("#pcarr").addEventListener("input",calc); calc();
}

function openCustomer(id){
  const c=cust(id);
  const ls=DB.loads.filter(l=>l.cust===id), ivs=DB.invoices.filter(i=>i.cust===id);
  openDrawer(drawer(esc(c.name),esc(c.contact)+' · '+esc(c.email)+' · '+esc(c.phone),["Account","Loads","Invoices"],[
    kv([["Terms","Net "+c.terms],["Payment method",esc(c.method.type)+(c.method.last4!=="—"?" ••"+esc(c.method.last4):"")],
        ["Credit limit",money(c.credit)],["Credit used",money(creditUsed(id))],["Available",money(Math.max(0,c.credit-creditUsed(id)))],["Customer since",esc(c.since)]])+
    rows([["Lifetime revenue",money(custRevenue(id))],["Loads moved",String(ls.length)],
          ["Gross margin",money(ls.reduce((s,l)=>s+loadMargin(l),0))],
          ["Open receivables",'<b>'+money(creditUsed(id))+'</b>',1]])+
    '<div class="btn-row"><button class="btn btn-s btn-x" data-act="method" data-id="'+id+'">Update payment method</button></div>',
    table([{t:"Load",f:l=>'<span class="t-id">'+esc(l.id)+'</span>'},{t:"Lane",f:l=>esc(l.orig)+' → '+esc(l.dest)},
      {t:"Revenue",r:1,n:1,f:l=>money(loadRevenue(l))},{t:"Status",f:l=>tag(l.status,LOAD_TONE[l.status])}],ls,{empty:"No loads yet."}),
    table([{t:"Invoice",f:i=>'<span class="t-id">'+esc(i.id)+'</span>'},{t:"Due",f:i=>fdate(i.due)},
      {t:"Amount",r:1,n:1,f:i=>money(i.amount)},{t:"Balance",r:1,n:1,f:i=>money(invBalance(i))},
      {t:"Status",f:i=>tag(invStatus(i),INV_TONE[invStatus(i)])}],ivs,{empty:"No invoices yet."})
  ],""));
  wireDrawer();
}
function openCarrier(id){
  const c=carr(id);
  const ls=DB.loads.filter(l=>l.carrier===id), ss=DB.settlements.filter(s=>s.carrier===id);
  const n=days(c.insExp,TODAY);
  openDrawer(drawer(esc(c.name),'MC '+esc(c.mc)+' · DOT '+esc(c.dot)+' · '+esc(c.base),["Profile","Loads","Settlements"],[
    kv([["Equipment",esc(c.equip.join(", "))],["On-time",c.onTime.toFixed(1)+"%"],["Rating",c.rating.toFixed(1)+" / 5"],
        ["Loads hauled",String(c.hauled)],["Pay terms",c.quickPay?"Quick pay (3%)":"Net 30"],["Factoring",c.factoring||"Direct"]])+
    (n<0?'<div class="note bad">'+ic("warn",16)+'<div><b>Insurance expired '+fdateY(c.insExp)+'.</b> Block this carrier from new loads until a current COI is on file.</div></div>'
      :n<30?'<div class="note warn">'+ic("warn",16)+'<div><b>Insurance expires in '+n+' days</b> ('+fdateY(c.insExp)+'). Request a renewed certificate.</div></div>'
      :'<div class="note">'+ic("chk",16)+'<div>Authority active, insurance current through '+fdateY(c.insExp)+'.</div></div>')+
    rows([["Total paid",money(ss.filter(s=>s.status==="Paid").reduce((a,s)=>a+s.net,0))],
          ["Quick-pay fees earned",money(ss.reduce((a,s)=>a+s.fee,0))],
          ["Currently owed",'<b>'+money(ss.filter(s=>s.status!=="Paid").reduce((a,s)=>a+s.net,0))+'</b>',1]]),
    table([{t:"Load",f:l=>'<span class="t-id">'+esc(l.id)+'</span>'},{t:"Lane",f:l=>esc(l.orig)+' → '+esc(l.dest)},
      {t:"Carrier pay",r:1,n:1,f:l=>money(loadCost(l))},{t:"Status",f:l=>tag(l.status,LOAD_TONE[l.status])}],ls,{empty:"No loads yet."}),
    table([{t:"Settlement",f:s=>'<span class="t-id">'+esc(s.id)+'</span>'},{t:"Net",r:1,n:1,f:s=>money(s.net)},
      {t:"Method",f:s=>esc(s.method)},{t:"Status",f:s=>tag(s.status,SET_TONE[s.status])}],ss,{empty:"None yet."})
  ],""));
  wireDrawer();
}

/* ================= MODALS & ACTIONS ================= */
function f(label,inner,id){ return '<div class="f"><label for="'+id+'">'+esc(label)+'</label>'+inner+'</div>'; }
const METHODS=["ACH","Wire","Check","Card","Cash"];
const DEFAULT_USERS=[
  ["Dana Whitfield","Operations manager","Full access","dana@sscargo.example"],
  ["Marcus Oyelaran","Dispatcher","Loads, dispatch","marcus@sscargo.example"],
  ["Priya Raman","Billing","Invoices, settlements, payments","priya@sscargo.example"],
  ["Colin Frazier","Carrier sales","Quotes, loads, carriers","colin@sscargo.example"],
  ["Sam Achebe","Accounting","Reports and payments","sam@sscargo.example"]
];

function payModal(id){
  const i=inv(id); if(!i) return;
  const c=cust(i.cust);
  modal('<div class="modal-h"><h3>Record a payment</h3><p>'+esc(i.id)+' · '+esc(c.name)+' · balance '+money(invBalance(i))+'</p></div>'+
  '<div class="modal-b">'+
    '<div class="fg">'+
      f("Amount received ($)",'<input id="pa" type="number" step="0.01" min="0" value="'+invBalance(i).toFixed(2)+'">',"pa")+
      f("Date received",'<input id="pd" type="date" value="'+iso(TODAY)+'">',"pd")+
      f("Method",'<select id="pm2">'+METHODS.map(m=>'<option'+(m===c.method.type?" selected":"")+'>'+m+'</option>').join("")+'</select>',"pm2")+
      f("Reference",'<input id="pr" type="text" value="'+(c.method.type==="Check"?"CHK ":"DEP")+Math.floor(10000+Math.random()*89999)+'">',"pr")+
    '</div>'+
    '<div class="note" id="presult">'+ic("info",16)+'<div>Applying this payment will close the invoice and mark its load paid.</div></div>'+
  '</div>'+
  '<div class="modal-f"><span class="left">Balance after: <b id="pafter">'+money(0)+'</b></span>'+
    '<button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="applyPay" data-id="'+i.id+'">Record payment</button></div>');
  const upd=function(){
    const a=+$("#pa").value||0, after=Math.max(0,i.amount-i.paid-a);
    $("#pafter").textContent=money(after);
    $("#presult").innerHTML=ic("info",16)+'<div>'+(after<=0.5
      ? 'This closes <b>'+esc(i.id)+'</b> in full.'+(i.loads.length?' Load '+esc(i.loads.join(", "))+' will be marked paid.':"")
      : 'Partial payment — <b>'+money(after)+'</b> will remain outstanding.')+'</div>';
  };
  $("#pa").addEventListener("input",upd); upd();
}
function applyPayment(id){
  const i=inv(id); if(!i) return;
  const a=+$("#pa").value||0;
  if(a<=0){ toast("Enter an amount greater than zero."); return; }
  const dt=$("#pd").value?new Date($("#pd").value+"T12:00:00"):TODAY;
  const m=$("#pm2").value, ref=$("#pr").value||"—";
  i.paid=Math.min(i.amount,i.paid+a);
  DB.payments.push({id:uid("PMT"),date:dt,dir:"in",party:cust(i.cust).name,method:m,ref:ref,amount:a,link:i.id});
  if(invBalance(i)<=0.5) i.loads.forEach(function(lid){ const l=load(lid); if(l) l.status="Paid"; });
  DB.activity.unshift({t:"g",b:"Payment received",x:money(a)+" "+m+" from "+cust(i.cust).name+" against "+i.id,w:"just now"});
  closeModal(); closeDrawer(); F.sel=[]; render();
  toast("Recorded "+money(a)+" against "+i.id+".");
}
function sendInvoice(id){
  const i=inv(id); if(!i) return;
  i.sent=true; i.issued=TODAY; i.due=addDays(TODAY,i.terms);
  DB.activity.unshift({t:"b",b:"Invoice sent",x:i.id+" to "+cust(i.cust).name+" for "+money(i.amount),w:"just now"});
  render(); toast(i.id+" sent to "+cust(i.cust).email+".");
}
function newInvoiceModal(){
  const un=uninvoiced();
  if(!un.length){ toast("Nothing to invoice — every delivered load is billed."); return; }
  modal('<div class="modal-h"><h3>Create invoice</h3><p>Pick delivered loads to bill. Loads are grouped by customer.</p></div>'+
  '<div class="modal-b">'+DB.customers.filter(c=>un.some(l=>l.cust===c.id)).map(function(c){
    const ls=un.filter(l=>l.cust===c.id);
    return '<div><p style="font-weight:700;font-size:13px;margin-bottom:6px">'+esc(c.name)+' <span class="t-sub">· Net '+c.terms+'</span></p>'+
      ls.map(l=>'<label class="att" style="cursor:pointer;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;padding:9px 11px">'+
        '<input class="chk" type="checkbox" data-inv-load="'+l.id+'" data-cust="'+c.id+'" checked>'+
        '<div><b>'+esc(l.id)+' — '+esc(l.orig)+' → '+esc(l.dest)+'</b><span>Delivered '+fdateY(l.delivery)+' · '+esc(l.ref)+'</span></div>'+
        '<b class="money" style="margin-left:auto">'+money(loadRevenue(l))+'</b></label>').join("")+'</div>';
  }).join("")+'</div>'+
  '<div class="modal-f"><span class="left">Total: <b id="invTotal">'+money(un.reduce((s,l)=>s+loadRevenue(l),0))+'</b></span>'+
   '<button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="createInvoice">Create &amp; send</button></div>',true);
  const upd=()=>{ const t=$$("[data-inv-load]:checked").reduce((s,b)=>s+loadRevenue(load(b.dataset.invLoad)),0); $("#invTotal").textContent=money(t); };
  $$("[data-inv-load]").forEach(b=>b.addEventListener("change",upd));
}
function createInvoice(){
  const picked=$$("[data-inv-load]:checked");
  if(!picked.length){ toast("Select at least one load."); return; }
  const byCust={};
  picked.forEach(function(b){ (byCust[b.dataset.cust]=byCust[b.dataset.cust]||[]).push(b.dataset.invLoad); });
  let made=0,total=0;
  Object.keys(byCust).forEach(function(cid){
    const c=cust(cid), ids=byCust[cid];
    const amount=ids.reduce((s,id)=>s+loadRevenue(load(id)),0);
    const i={id:uid("INV"),cust:cid,loads:ids,issued:TODAY,due:addDays(TODAY,c.terms),amount:amount,paid:0,terms:c.terms,sent:true,disputed:false,note:""};
    DB.invoices.unshift(i); made++; total+=amount;
    ids.forEach(function(id){ const l=load(id); l.invoiceId=i.id; l.status="Invoiced"; });
    DB.activity.unshift({t:"b",b:"Invoice created",x:i.id+" · "+c.name+" · "+money(amount),w:"just now"});
  });
  closeModal(); go("invoices"); toast(made+" invoice"+(made>1?"s":"")+" created and sent — "+money(total)+".");
}
function invoiceLoad(id){
  const l=load(id); if(!l||l.invoiceId) return;
  const c=cust(l.cust), amount=loadRevenue(l);
  const i={id:uid("INV"),cust:l.cust,loads:[l.id],issued:TODAY,due:addDays(TODAY,c.terms),amount:amount,paid:0,terms:c.terms,sent:true,disputed:false,note:""};
  DB.invoices.unshift(i); l.invoiceId=i.id; l.status="Invoiced";
  DB.activity.unshift({t:"b",b:"Invoice created",x:i.id+" · "+c.name+" · "+money(amount),w:"just now"});
  closeDrawer(); go("invoices"); toast("Invoice "+i.id+" created for "+money(amount)+".");
}

/* settlements */
function approveSettlement(id){ const s=sett(id); if(!s) return; s.status="Approved"; closeDrawer(); render(); toast(s.id+" approved — "+money(s.net)+" queued for payment."); }
function payCarrier(id){
  const s=sett(id); if(!s) return;
  s.status="Paid"; s.paidOn=TODAY;
  DB.payments.unshift({id:uid("PMT"),date:TODAY,dir:"out",party:(s.factor?carr(s.carrier).name+" (via "+s.factor+")":carr(s.carrier).name),
    method:s.method,ref:"ACH"+Math.floor(10000+Math.random()*89999),amount:s.net,link:s.id});
  DB.activity.unshift({t:"g",b:"Carrier paid",x:money(s.net)+" to "+carr(s.carrier).name+" ("+s.id+")",w:"just now"});
  closeDrawer(); render(); toast("Paid "+money(s.net)+" to "+carr(s.carrier).name+".");
}
function approveAll(){
  const p=pendingSettlements(); if(!p.length){ toast("Nothing pending."); return; }
  p.forEach(s=>s.status="Approved"); render(); toast(p.length+" settlements approved — "+money(p.reduce((s,x)=>s+x.net,0))+".");
}
function payRun(){
  const ap=DB.settlements.filter(s=>s.status==="Approved");
  if(!ap.length){ toast("No approved settlements to pay. Approve them first."); return; }
  const total=ap.reduce((s,x)=>s+x.net,0), fees=ap.reduce((s,x)=>s+x.fee,0);
  modal('<div class="modal-h"><h3>Run payment batch</h3><p>'+ap.length+' approved settlements</p></div>'+
  '<div class="modal-b">'+
    table([{t:"Settlement",f:s=>'<span class="t-id">'+esc(s.id)+'</span>'},{t:"Carrier",f:s=>esc(carr(s.carrier).name)+(s.factor?' <span class="t-sub">via '+esc(s.factor)+'</span>':"")},
      {t:"Method",f:s=>esc(s.method)},{t:"Net",r:1,n:1,f:s=>money(s.net)}],ap,{empty:""})+
    rows([["Gross pay",money(ap.reduce((s,x)=>s+x.gross,0))],["Quick-pay fees retained","−"+money(fees)],["Total debit",'<b>'+money(total)+'</b>',1]])+
    '<div class="note">'+ic("info",16)+'<div>Funds leave the operating account today. Factored carriers are paid to their factor under the NOA on file.</div></div>'+
  '</div>'+
  '<div class="modal-f"><span class="left">'+ap.length+' payments · '+money(total)+'</span>'+
   '<button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doPayRun">Send '+money(total)+'</button></div>',true);
}
function doPayRun(){
  const ap=DB.settlements.filter(s=>s.status==="Approved");
  ap.forEach(function(s){
    s.status="Paid"; s.paidOn=TODAY;
    DB.payments.unshift({id:uid("PMT"),date:TODAY,dir:"out",party:(s.factor?carr(s.carrier).name+" (via "+s.factor+")":carr(s.carrier).name),
      method:s.method,ref:"BATCH"+Math.floor(1000+Math.random()*8999),amount:s.net,link:s.id});
  });
  const total=ap.reduce((s,x)=>s+x.net,0);
  DB.activity.unshift({t:"g",b:"Payment batch sent",x:ap.length+" carriers paid · "+money(total),w:"just now"});
  closeModal(); render(); toast("Batch sent — "+ap.length+" carriers paid, "+money(total)+".");
}

/* loads */
function advanceLoad(id){
  const l=load(id); if(!l) return;
  const seq=["Booked","At pickup","In transit","Delivered"];
  if(l.status==="At risk"){ l.status="In transit"; l.risk=null; toast(l.id+" back on schedule."); }
  else{
    const i=seq.indexOf(l.status);
    if(i<0||i>=3){ toast(l.id+" is already "+l.status.toLowerCase()+"."); return; }
    l.status=seq[i+1];
    if(l.status==="Delivered"){
      l.docs.push({n:"Proof of delivery",t:"PDF"});
      const v=carr(l.carrier), carrAcc=accSum(l,"carr");
      const ded=[]; const adv=l.acc.find(a=>a.side==="carr"&&a.amt<0);
      if(adv) ded.push({label:"Fuel advance recovery",amt:-adv.amt});
      const gross=l.cost+Math.max(0,carrAcc), fee=v.quickPay?Math.round(gross*0.03):0;
      const s={id:uid("SET"),carrier:l.carrier,loads:[l.id],gross:gross,ded:ded,quickPay:!!v.quickPay,fee:fee,
        net:gross-fee-ded.reduce((a,x)=>a+x.amt,0),status:"Pending",method:v.factoring?"ACH to factor":"ACH",factor:v.factoring,paidOn:null};
      DB.settlements.unshift(s); l.settlementId=s.id;
      DB.activity.unshift({t:"g",b:"POD received",x:l.id+" delivered · settlement "+s.id+" created",w:"just now"});
      toast(l.id+" delivered. Settlement "+s.id+" created and ready to invoice.");
    } else toast(l.id+" moved to "+l.status+".");
  }
  closeDrawer(); render();
}
function addAccModal(id){
  const l=load(id); if(!l) return;
  modal('<div class="modal-h"><h3>Add accessorial</h3><p>'+esc(l.id)+' · '+esc(l.orig)+' → '+esc(l.dest)+'</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Charge",'<select id="ac"><option>Detention</option><option>Layover</option><option>Lumper</option><option>Driver assist</option><option>Tarps</option><option>TONU</option><option>Fuel advance</option></select>',"ac")+
    f("Amount ($)",'<input id="aa" type="number" step="10" value="210">',"aa")+
    f("Side",'<select id="as"><option value="cust">Bill to customer</option><option value="carr">Pay to carrier</option></select>',"as")+
    f("Recover from carrier",'<select id="ag"><option value="no">No</option><option value="yes">Yes — deduct at settlement</option></select>',"ag")+
  '</div><div class="note">'+ic("info",16)+'<div>Customer-side charges raise the invoice total; carrier-side charges raise settlement pay. Recoveries are deducted.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doAcc" data-id="'+l.id+'">Add charge</button></div>');
}
function doAcc(id){
  const l=load(id); if(!l) return;
  const label=$("#ac").value, amt=+$("#aa").value||0, side=$("#as").value, rec=$("#ag").value==="yes";
  if(amt<=0){ toast("Enter an amount."); return; }
  l.acc.push({label:label,amt:(rec?-amt:amt),side:side});
  if(l.invoiceId&&side==="cust"){ const i=inv(l.invoiceId); if(i){ i.amount+=amt; } }
  if(l.settlementId){ const s=sett(l.settlementId); if(s&&side==="carr"){ if(rec){s.ded.push({label:label+" recovery",amt:amt}); s.net-=amt;} else {s.gross+=amt; s.net+=amt;} } }
  DB.activity.unshift({t:"w",b:label+" added",x:l.id+" · "+money(amt)+" ("+(side==="cust"?"billed to customer":"carrier")+")",w:"just now"});
  closeModal(); openLoad(l.id); render(); toast(label+" of "+money(amt)+" added to "+l.id+".");
}
function newLoadModal(){
  modal('<div class="modal-h"><h3>New load</h3><p>Book freight and assign a carrier. Margin is checked against the 15% target.</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Customer",'<select id="nc">'+DB.customers.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join("")+'</select>',"nc")+
    f("Carrier",'<select id="nv">'+DB.carriers.filter(c=>c.status==="active").map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join("")+'</select>',"nv")+
    f("Origin",'<input id="no" value="Dallas, TX">',"no")+f("Destination",'<input id="nd" value="Atlanta, GA">',"nd")+
    f("Miles",'<input id="nm" type="number" value="781">',"nm")+
    f("Equipment",'<select id="ne"><option>Dry Van 53\'</option><option>Dry Van 48\'</option><option>Reefer</option><option>Flatbed</option><option>Step Deck</option><option>Power Only</option><option>Hotshot</option></select>',"ne")+
    f("Weight (lb)",'<input id="nw" type="number" value="40000">',"nw")+
    f("Pickup date",'<input id="np" type="date" value="'+iso(addDays(TODAY,1))+'">',"np")+
    f("Customer rate ($)",'<input id="nr" type="number" step="10" value="1875">',"nr")+
    f("Carrier cost ($)",'<input id="nk" type="number" step="10" value="1520">',"nk")+
  '</div><div class="note" id="nwarn">'+ic("info",16)+'<div>—</div></div></div>'+
  '<div class="modal-f"><span class="left">Margin <b id="nmg">—</b></span><button class="btn btn-s" data-close>Cancel</button>'+
   '<button class="btn btn-p" data-act="doNewLoad">Book load</button></div>',true);
  const upd=function(){
    const r=+$("#nr").value||0,k=+$("#nk").value||0,m=r-k,p=r?m/r*100:0;
    $("#nmg").textContent=money(m)+" ("+p.toFixed(1)+"%)";
    $("#nmg").style.color=p<10?"var(--bad)":p<15?"var(--warn)":"var(--good)";
    const c=cust($("#nc").value), avail=c.credit-creditUsed(c.id);
    $("#nwarn").className="note"+(p<10||r>avail?" warn":"");
    $("#nwarn").innerHTML=ic(p<10||r>avail?"warn":"info",16)+'<div>'+
      (r>avail?'<b>Credit check:</b> '+esc(c.name)+' has '+money(Math.max(0,avail))+' of '+money(c.credit)+' available. This load exceeds it.'
             :'<b>Credit check passed.</b> '+esc(c.name)+' has '+money(Math.max(0,avail))+' available of a '+money(c.credit)+' limit.')+
      (p<10?' Margin is under 10% — a manager must approve.':"")+'</div>';
  };
  ["#nr","#nk","#nc"].forEach(s=>$(s).addEventListener("input",upd)); upd();
}
function doNewLoad(){
  const pk=$("#np").value?new Date($("#np").value+"T12:00:00"):addDays(TODAY,1);
  const miles=+$("#nm").value||500;
  const l={id:uid("SS"),cust:$("#nc").value,carrier:$("#nv").value,orig:$("#no").value||"—",dest:$("#nd").value||"—",
    miles:miles,equip:$("#ne").value,weight:+$("#nw").value||40000,commodity:"General freight",
    pickup:pk,delivery:addDays(pk,Math.max(1,Math.round(miles/550))),status:"Booked",
    rev:+$("#nr").value||0,cost:+$("#nk").value||0,acc:[],invoiceId:null,settlementId:null,risk:null,
    ref:"PO "+Math.floor(80000+Math.random()*19999),docs:[{n:"Rate confirmation",t:"PDF"}]};
  DB.loads.unshift(l);
  DB.activity.unshift({t:"b",b:"Load booked",x:l.id+" · "+l.orig+" → "+l.dest+" · "+money(loadMargin(l))+" margin",w:"just now"});
  closeModal(); go("loads"); toast("Load "+l.id+" booked — "+money(loadMargin(l))+" margin.");
}

/* quotes */
function quoteSend(id){
  const q=DB.quotes.find(x=>x.id===id); if(!q) return;
  const rate=+($("#pcust")||{}).value||q.target, cost=+($("#pcarr")||{}).value||Math.round(q.target*0.82);
  const p=rate?((rate-cost)/rate*100):0;
  if(q.status==="New"){
    if(p<10){ toast("Margin under 10% — needs a manager override before sending."); return; }
    q.status="Quoted"; q.target=rate; q.cost=cost;
    DB.activity.unshift({t:"b",b:"Quote sent",x:q.id+" · "+cust(q.cust).name+" · "+money(rate),w:"just now"});
    closeDrawer(); render(); toast("Quote "+q.id+" sent at "+money(rate)+" ("+p.toFixed(1)+"% margin).");
  } else {
    q.status="Won";
    const v=DB.carriers.filter(c=>c.status==="active")[0];
    const l={id:uid("SS"),cust:q.cust,carrier:v.id,orig:q.orig,dest:q.dest,miles:q.miles,equip:q.equip,weight:q.weight,
      commodity:"General freight",pickup:q.ready,delivery:addDays(q.ready,Math.max(1,Math.round(q.miles/550))),
      status:"Booked",rev:rate,cost:cost,acc:[],invoiceId:null,settlementId:null,risk:null,
      ref:"PO "+Math.floor(80000+Math.random()*19999),docs:[{n:"Rate confirmation",t:"PDF"}]};
    DB.loads.unshift(l);
    DB.activity.unshift({t:"g",b:"Quote won",x:q.id+" booked as "+l.id+" · "+money(rate),w:"just now"});
    closeDrawer(); go("loads"); toast("Won — booked as "+l.id+".");
  }
}
function loseQuote(id){ const q=DB.quotes.find(x=>x.id===id); if(!q) return; q.status="Lost"; closeDrawer(); render(); toast(q.id+" marked lost."); }

/* carriers / customers */
function setCarrier(id,st){
  const c=DB.carriers.find(x=>x.id===id); if(!c) return;
  c.status=st; c.note=st==="active"?"Activated "+fdateY(TODAY):"Declined "+fdateY(TODAY);
  DB.activity.unshift({t:st==="active"?"g":"r",b:st==="active"?"Carrier activated":"Carrier declined",x:c.name+" · MC "+c.mc,w:"just now"});
  render(); toast(c.name+(st==="active"?" activated.":" declined."));
}
function methodModal(id){
  const c=cust(id);
  modal('<div class="modal-h"><h3>Payment method</h3><p>'+esc(c.name)+'</p></div><div class="modal-b"><div class="fg">'+
    f("Method",'<select id="mm">'+METHODS.map(m=>'<option'+(m===c.method.type?" selected":"")+'>'+m+'</option>').join("")+'</select>',"mm")+
    f("Account / card last 4",'<input id="ml" maxlength="4" value="'+esc(c.method.last4==="—"?"":c.method.last4)+'">',"ml")+
    f("Payment terms",'<select id="mt">'+[15,21,30,45,60].map(t=>'<option'+(t===c.terms?" selected":"")+'>'+t+'</option>').join("")+'</select>',"mt")+
    f("Credit limit ($)",'<input id="mc2" type="number" step="5000" value="'+c.credit+'">',"mc2")+
  '</div><div class="note">'+ic("info",16)+'<div>Prototype — no real payment credentials are stored. Only the last four digits are ever shown.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doMethod" data-id="'+id+'">Save</button></div>');
}
function doMethod(id){
  const c=cust(id);
  c.method={type:$("#mm").value,last4:($("#ml").value||"").replace(/\D/g,"").slice(-4)||"—"};
  c.terms=+$("#mt").value||c.terms; c.credit=+$("#mc2").value||c.credit;
  closeModal(); render(); toast(c.name+" billing profile updated.");
}

/* ================= EVENTS ================= */

/* ================= NEW CUSTOMER ================= */
function newCustomerModal(){
  modal('<div class="modal-h"><h3>Add customer</h3><p>Onboard a billing account. Credit limit and terms drive the AR exposure checks.</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Company name",'<input id="cu_name" placeholder="Acme Freight Inc.">',"cu_name")+
    f("Billing contact",'<input id="cu_contact" placeholder="Jane Doe">',"cu_contact")+
    f("AP email",'<input id="cu_email" type="email" placeholder="ap@acme.example">',"cu_email")+
    f("Phone",'<input id="cu_phone" placeholder="(555) 555-0100">',"cu_phone")+
    f("Payment terms",'<select id="cu_terms"><option value="15">Net 15</option><option value="21">Net 21</option><option value="30" selected>Net 30</option><option value="45">Net 45</option><option value="60">Net 60</option></select>',"cu_terms")+
    f("Credit limit ($)",'<input id="cu_credit" type="number" step="5000" value="50000">',"cu_credit")+
    f("Payment method",'<select id="cu_method">'+METHODS.map(m=>'<option'+(m==="ACH"?" selected":"")+'>'+m+'</option>').join("")+'</select>',"cu_method")+
    f("Account last 4",'<input id="cu_last4" maxlength="4" inputmode="numeric" placeholder="4471">',"cu_last4")+
  '</div><div class="note">'+ic("info",16)+'<div>Only the last four digits are kept — no full account or card number is stored. The account is live immediately and can be quoted against.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doNewCustomer">Add customer</button></div>');
}

function doNewCustomer(){
  const name=$("#cu_name").value.trim();
  if(!name){ toast("Enter a company name."); $("#cu_name").focus(); return; }
  if(DB.customers.some(c=>c.name.toLowerCase()===name.toLowerCase())){
    toast("A customer called "+name+" already exists."); $("#cu_name").focus(); return;
  }
  const credit=+$("#cu_credit").value||0;
  if(credit<0){ toast("Credit limit cannot be negative."); return; }
  const last4=($("#cu_last4").value||"").replace(/\D/g,"").slice(-4);

  const c={
    id:"C-"+(DB.customers.reduce((m,x)=>Math.max(m,parseInt(String(x.id).slice(2),10)||0),100)+1),
    name:name,
    contact:$("#cu_contact").value.trim(),
    email:$("#cu_email").value.trim(),
    phone:$("#cu_phone").value.trim(),
    terms:+$("#cu_terms").value||30,
    credit:credit,
    method:{type:$("#cu_method").value,last4:last4||"—"},
    since:String(TODAY.getFullYear())
  };

  DB.customers.push(c);
  DB.activity.unshift({t:"g",b:"Customer added",x:c.name+" · Net "+c.terms+" · "+money(c.credit)+" limit",w:"just now"});
  save(); closeModal(); render();
  toast(c.name+" added.");

  /* Persist to MySQL so it survives a browser reset. Failure is non-fatal —
     the customer stays in this session and the toast says so. */
  persist("api/customers.php",c,function(saved){
    if(saved&&saved.id&&saved.id!==c.id){ c.id=saved.id; save(); render(); }
  });
}

/* ================= NEW QUOTE ================= */
function newQuoteModal(){
  if(!DB.customers.length){ toast("Add a customer first."); return; }
  modal('<div class="modal-h"><h3>New quote</h3><p>Price a lane for a customer. Won quotes book straight through to a load.</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Customer",'<select id="q_cust">'+DB.customers.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join("")+'</select>',"q_cust")+
    f("Origin",'<input id="q_orig" value="Dallas, TX">',"q_orig")+
    f("Destination",'<input id="q_dest" value="Atlanta, GA">',"q_dest")+
    f("Equipment",'<select id="q_equip"><option>Dry Van 53\'</option><option>Dry Van 48\'</option><option>Reefer</option><option>Flatbed</option><option>Step Deck</option><option>Power Only</option><option>Hotshot</option></select>',"q_equip")+
    f("Miles",'<input id="q_miles" type="number" value="781">',"q_miles")+
    f("Weight (lb)",'<input id="q_weight" type="number" step="500" value="40000">',"q_weight")+
    f("Ready date",'<input id="q_ready" type="date" value="'+iso(addDays(TODAY,1))+'">',"q_ready")+
    f("Target rate ($)",'<input id="q_target" type="number" step="50" value="1900">',"q_target")+
  '</div><div class="f" style="margin-top:12px"><label for="q_notes">Notes</label><textarea id="q_notes" rows="2" placeholder="Dock hours, appointment requirements, temperature…"></textarea></div>'+
  '<div class="note">'+ic("info",16)+'<div>The quote lands in the pipeline as <b>New</b>. Price it there to see margin before sending.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doNewQuote">Create quote</button></div>');
}

function doNewQuote(){
  const orig=$("#q_orig").value.trim(), dest=$("#q_dest").value.trim();
  if(!orig||!dest){ toast("Enter both an origin and a destination."); return; }
  const miles=+$("#q_miles").value||0;
  if(miles<=0){ toast("Enter the mileage."); $("#q_miles").focus(); return; }
  const target=+$("#q_target").value||0;
  if(target<=0){ toast("Enter a target rate."); $("#q_target").focus(); return; }

  const ready=$("#q_ready").value?isoDate($("#q_ready").value):addDays(TODAY,1);
  const q={
    id:"Q-"+(DB.quotes.reduce((m,x)=>Math.max(m,parseInt(String(x.id).slice(2),10)||0),1100)+1),
    cust:$("#q_cust").value,
    orig:orig, dest:dest,
    equip:$("#q_equip").value,
    miles:miles,
    weight:+$("#q_weight").value||0,
    ready:ready,
    target:target,
    status:"New",
    recv:"just now",
    notes:$("#q_notes").value.trim()
  };

  DB.quotes.unshift(q);
  DB.activity.unshift({t:"b",b:"New quote request",x:cust(q.cust).name+" — "+q.orig+" → "+q.dest,w:"just now"});
  save(); closeModal(); go("quotes");
  toast("Quote "+q.id+" created.");
}

/* Fire-and-forget write to the PHP API. The app has already updated its own
   state by the time this runs, so a failure only costs server persistence. */
function persist(path,body,done){
  const cfg=window.FREIGHT_OS||{};
  if(!cfg.dbConnected||typeof fetch!=="function") return;
  fetch((cfg.baseUrl||"/")+path,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  }).then(r=>r.json()).then(function(res){
    if(res&&res.ok){ if(done) done(res.customer||res.record||null); }
    else toast("Saved locally — server said: "+((res&&res.reason)||"unavailable"));
  }).catch(function(){ toast("Saved locally — could not reach the server."); });
}

/* ================= CSV EXPORT ================= */
function csvCell(v){
  const s=v==null?"":String(v);
  return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
}
function downloadBlob(filename,text,mime){
  const blob=new Blob(["﻿"+text],{type:(mime||"text/plain")+";charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); },0);
}
function downloadCSV(filename,rows){
  downloadBlob(filename,rows.map(r=>r.map(csvCell).join(",")).join("\r\n"),"text/csv");
}

function exportARCsv(){
  const rows=[["Invoice","Customer","Issued","Due","Terms","Amount","Paid","Balance","Status","Note"]];
  DB.invoices.forEach(function(i){
    rows.push([i.id,cust(i.cust).name,i.issued?iso(i.issued):"",i.due?iso(i.due):"","Net "+i.terms,
      (i.amount||0).toFixed(2),(i.paid||0).toFixed(2),((i.amount||0)-(i.paid||0)).toFixed(2),
      invStatus(i),i.note||""]);
  });
  downloadCSV("ss-cargo-ar-"+iso(TODAY)+".csv",rows);
  toast("Exported "+DB.invoices.length+" invoices.");
}

function exportLoadsCsv(){
  const rows=[["Load","Customer","Carrier","Origin","Destination","Equipment","Miles","Weight",
               "Pickup","Delivery","Revenue","Carrier cost","Margin","Margin %","Status","Invoice"]];
  DB.loads.forEach(function(l){
    const rev=loadRevenue(l), mar=loadMargin(l);
    rows.push([l.id,cust(l.cust).name,carr(l.carrier).name,l.orig,l.dest,l.equip,l.miles,l.weight,
      l.pickup?iso(l.pickup):"",l.delivery?iso(l.delivery):"",
      rev.toFixed(2),(l.cost||0).toFixed(2),mar.toFixed(2),pct(mar,rev).toFixed(1),l.status,l.invoiceId||""]);
  });
  downloadCSV("ss-cargo-loads-"+iso(TODAY)+".csv",rows);
  toast("Exported "+DB.loads.length+" loads.");
}

function sendStatements(){
  const rows=[["Customer","Contact","Email","Terms","Open invoices","Open AR","Credit limit","Credit used %"]];
  let n=0;
  DB.customers.forEach(function(c){
    const open=DB.invoices.filter(i=>i.cust===c.id&&(i.amount-i.paid)>0.005);
    if(!open.length) return;
    n++;
    const bal=open.reduce((s,i)=>s+(i.amount-i.paid),0);
    rows.push([c.name,c.contact||"",c.email||"","Net "+c.terms,open.length,
      bal.toFixed(2),(c.credit||0).toFixed(2),c.credit?((bal/c.credit)*100).toFixed(1):"0.0"]);
  });
  if(!n){ toast("No customer has an open balance."); return; }
  downloadCSV("ss-cargo-statements-"+iso(TODAY)+".csv",rows);
  toast("Statements for "+n+" customer"+(n===1?"":"s")+" downloaded.");
}

/* ================= ASSIGN TRUCK ================= */
function assignModal(tid){
  const t=DB.trucks.find(x=>x.id===tid); if(!t) return;
  const open=DB.loads.filter(l=>["Booked","At pickup"].indexOf(l.status)>=0);
  if(!open.length){ toast("No unassigned loads to cover right now."); return; }
  modal('<div class="modal-h"><h3>Assign '+esc(t.unit)+'</h3><p>'+esc(t.driver||"Driver")+' &middot; '+esc(t.loc||"")+'</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Load",'<select id="as_load">'+open.map(l=>'<option value="'+l.id+'">'+esc(l.id)+' &mdash; '+esc(l.orig)+' to '+esc(l.dest)+'</option>').join("")+'</select>',"as_load")+
    f("Status after assign",'<select id="as_status"><option value="Booked">Booked</option><option value="At pickup">At pickup</option></select>',"as_status")+
  '</div><div class="note">'+ic("info",16)+'<div>Assigning sets the truck to <b>On load</b> and points the load at this truck.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doAssign" data-id="'+t.id+'">Assign</button></div>');
}
function doAssign(tid){
  const t=DB.trucks.find(x=>x.id===tid); if(!t) return;
  const l=load($("#as_load").value); if(!l){ toast("Pick a load."); return; }
  l.truck=t.id; l.status=$("#as_status").value;
  t.status="On load"; t.loc=l.orig;
  DB.activity.unshift({t:"b",b:"Truck assigned",x:t.unit+" to "+l.id,w:"just now"});
  save(); closeModal(); render();
  toast(t.unit+" assigned to "+l.id+".");
}

/* ================= SETTINGS: USERS ================= */
function inviteUserModal(){
  modal('<div class="modal-h"><h3>Invite user</h3><p>Adds a person to the roster. Give them a password with bin/make-user.php on the server.</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Full name",'<input id="iu_name" placeholder="Jane Doe">',"iu_name")+
    f("Email",'<input id="iu_email" type="email" placeholder="jane@sscargo.example">',"iu_email")+
    f("Role",'<select id="iu_role"><option>Operations manager</option><option>Dispatcher</option><option>Billing</option><option>Carrier sales</option><option>Accounting</option></select>',"iu_role")+
  '</div><div class="note">'+ic("info",16)+'<div>Until a password hash exists in the <b>users</b> table this person cannot sign in &mdash; that is deliberate.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doInviteUser">Add user</button></div>');
}
function doInviteUser(){
  const name=$("#iu_name").value.trim(), email=$("#iu_email").value.trim();
  if(!name){ toast("Enter a name."); return; }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ toast("Enter a valid email."); return; }
  if(DB.users.some(u=>String(u[3]||"").toLowerCase()===email.toLowerCase())){ toast("That email is already on the roster."); return; }
  const role=$("#iu_role").value;
  const perms=role==="Operations manager"?"Full access":
              role==="Dispatcher"?"Loads and dispatch":
              role==="Billing"?"Invoices, settlements, payments":
              role==="Carrier sales"?"Quotes, loads, carriers":"Reports and payments";
  DB.users.push([name,role,perms,email]);
  DB.activity.unshift({t:"b",b:"User added",x:name+" - "+role,w:"just now"});
  save(); closeModal(); render();
  toast(name+" added to the roster.");
}
function editUserModal(email){
  const u=DB.users.find(x=>String(x[3]||"")===email);
  if(!u){ toast("This user has no email on file and cannot be edited."); return; }
  modal('<div class="modal-h"><h3>Edit user</h3><p>'+esc(u[0])+'</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Role",'<select id="eu_role">'+["Operations manager","Dispatcher","Billing","Carrier sales","Accounting"]
      .map(r=>'<option'+(r===u[1]?" selected":"")+'>'+r+'</option>').join("")+'</select>',"eu_role")+
  '</div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button>'+
  '<button class="btn btn-p" data-act="doEditUser" data-id="'+esc(email)+'">Save</button></div>');
}
function doEditUser(email){
  const u=DB.users.find(x=>String(x[3]||"")===email); if(!u) return;
  u[1]=$("#eu_role").value;
  save(); closeModal(); render(); toast(u[0]+" updated to "+u[1]+".");
}

/* ================= SETTINGS: INTEGRATIONS ================= */
function toggleIntegration(name){
  DB.integrations=DB.integrations||{};
  const on=!DB.integrations[name];
  DB.integrations[name]=on;
  DB.activity.unshift({t:on?"g":"w",b:on?"Integration connected":"Integration disconnected",x:name,w:"just now"});
  save(); render();
  toast(name+(on?" connected.":" disconnected."));
}

/* ================= DOCUMENTS ================= */
function downloadDoc(key){
  const parts=String(key).split("|"), loadId=parts[0], docName=parts[1]||"document";
  const l=load(loadId);
  const lines=["S&S CARGO - "+docName,"","Load: "+loadId];
  if(l){
    lines.push("Customer: "+cust(l.cust).name,"Carrier: "+carr(l.carrier).name,
      "Lane: "+l.orig+" to "+l.dest,"Equipment: "+l.equip,
      "Miles: "+l.miles,"Weight: "+l.weight+" lb",
      "Pickup: "+(l.pickup?iso(l.pickup):"-"),"Delivery: "+(l.delivery?iso(l.delivery):"-"),
      "Customer rate: "+money(loadRevenue(l)),"Carrier pay: "+money(l.cost||0));
  }
  lines.push("","Generated "+iso(TODAY)+" - prototype document, not a legal instrument.");
  downloadBlob((loadId+"-"+docName).replace(/[^\w.-]+/g,"-")+".txt",lines.join("\r\n"),"text/plain");
  toast(docName+" downloaded.");
}
function uploadDocModal(loadId){
  modal('<div class="modal-h"><h3>Upload document</h3><p>'+esc(loadId)+'</p></div>'+
  '<div class="modal-b"><div class="fg">'+
    f("Document type",'<select id="ud_type"><option>Rate confirmation</option><option>Bill of lading</option><option>Proof of delivery</option><option>Invoice copy</option><option>Lumper receipt</option><option>Other</option></select>',"ud_type")+
    f("File name",'<input id="ud_name" placeholder="pod-scan.pdf">',"ud_name")+
  '</div><div class="note">'+ic("info",16)+'<div>The file itself is not stored in this build &mdash; the document is recorded against the load so the paper trail is visible.</div></div></div>'+
  '<div class="modal-f"><button class="btn btn-s" data-close>Cancel</button><button class="btn btn-p" data-act="doUploadDoc" data-id="'+esc(loadId)+'">Add document</button></div>');
}
function doUploadDoc(loadId){
  const l=load(loadId); if(!l) return;
  const type=$("#ud_type").value;
  const name=$("#ud_name").value.trim()||type.toLowerCase().replace(/\s+/g,"-")+".pdf";
  l.docs=l.docs||[];
  l.docs.push({n:name,t:type});
  DB.activity.unshift({t:"b",b:"Document added",x:type+" on "+l.id,w:"just now"});
  save(); closeModal(); openLoad(l.id); render();
  toast(type+" recorded on "+l.id+".");
}
const ACTIONS={
  reset:resetData, newLoad:newLoadModal, doNewLoad:doNewLoad, newInvoice:newInvoiceModal, createInvoice:createInvoice,
  approveAll:approveAll, payRun:payRun, doPayRun:doPayRun, doAcc:e=>doAcc(e), applyPay:id=>applyPayment(id),
  pay:id=>payModal(id), send:id=>sendInvoice(id), advance:id=>advanceLoad(id), addAcc:id=>addAccModal(id),
  invoiceLoad:id=>invoiceLoad(id), approve:id=>approveSettlement(id), payc:id=>payCarrier(id),
  method:id=>methodModal(id), doMethod:id=>doMethod(id), quoteSend:id=>quoteSend(id), lose:id=>loseQuote(id),
  remind:id=>{ toast("Reminder emailed to "+cust(inv(id).cust).email+"."); },
  resolve:id=>{ const i=inv(id); i.disputed=false; i.note="Dispute resolved "+fdateY(TODAY)+"."; closeDrawer(); render(); toast("Dispute on "+id+" resolved."); },
  sendSel:()=>{ if(!F.sel.length) return; toast(F.sel.length+" reminders queued."); F.sel=[]; render(); },
  paySel:()=>{ if(!F.sel.length){toast("Select invoices first.");return;} const ids=F.sel.slice();
    let t=0; ids.forEach(function(id){ const i=inv(id); if(!i||invBalance(i)<=0) return; const b=invBalance(i); t+=b; i.paid=i.amount;
      DB.payments.unshift({id:uid("PMT"),date:TODAY,dir:"in",party:cust(i.cust).name,method:cust(i.cust).method.type,ref:"BATCH"+Math.floor(1000+Math.random()*8999),amount:b,link:i.id});
      i.loads.forEach(lid=>{const l=load(lid); if(l) l.status="Paid";}); });
    F.sel=[]; render(); toast("Recorded "+money(t)+" across "+ids.length+" invoices."); },
  clearSel:()=>{ F.sel=[]; render(); },
  statement:()=>sendStatements(),
  exportAR:()=>exportARCsv(),
  exportLoads:()=>exportLoadsCsv(),
  newQuote:()=>newQuoteModal(),
  newCustomer:()=>newCustomerModal(),
  doNewCustomer:()=>doNewCustomer(),
  doNewQuote:()=>doNewQuote(),
  doAssign:id=>doAssign(id),
  inviteUser:()=>inviteUserModal(),
  editUser:id=>editUserModal(id),
  doInviteUser:()=>doInviteUser(),
  doEditUser:id=>doEditUser(id),
  integration:id=>toggleIntegration(id),
  docDl:id=>downloadDoc(id),
  docUp:id=>uploadDocModal(id),
  doUploadDoc:id=>doUploadDoc(id),
  soon:()=>toast("Not wired in this prototype build.")
};
document.addEventListener("click",function(e){
  if(e.target.closest("[data-close]")){ closeModal(); return; }
  const r=e.target.closest("[data-route]"); if(r){ go(r.dataset.route); return; }
  const gi=e.target.closest("[data-goinv]"); if(gi){ e.preventDefault(); openInvoice(gi.dataset.goinv); return; }
  const gs=e.target.closest("[data-goset]"); if(gs){ e.preventDefault(); openSettlement(gs.dataset.goset); return; }
  const a=e.target.closest("[data-act]");
  if(a){ const fn=ACTIONS[a.dataset.act]; if(fn) fn(a.dataset.id); return; }
  const sg=e.target.closest("[data-seg] button");
  if(sg){ F[sg.parentNode.dataset.seg]=sg.dataset.v; F.sel=[]; render(); return; }
});
document.addEventListener("change",function(e){
  const fl=e.target.closest("[data-filter]");
  if(fl){ F[fl.dataset.filter]=fl.value; render(); }
});
$("#modalScrim").addEventListener("click",function(e){ if(e.target===this) closeModal(); });
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){ closeModal(); closeDrawer(); }
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){ e.preventDefault(); $("#gsearch").focus(); $("#gsearch").select(); }
});

/* global search */
$("#gsearch").addEventListener("keydown",function(e){
  if(e.key!=="Enter") return;
  const q=this.value.trim().toLowerCase(); if(!q) return;
  const l=DB.loads.find(x=>(x.id+" "+x.orig+" "+x.dest+" "+x.ref).toLowerCase().indexOf(q)>=0);
  const i=DB.invoices.find(x=>x.id.toLowerCase().indexOf(q)>=0);
  const s=DB.settlements.find(x=>x.id.toLowerCase().indexOf(q)>=0);
  const c=DB.customers.find(x=>x.name.toLowerCase().indexOf(q)>=0);
  const v=DB.carriers.find(x=>(x.name+" "+x.mc).toLowerCase().indexOf(q)>=0);
  if(l) openLoad(l.id); else if(i) openInvoice(i.id); else if(s) openSettlement(s.id);
  else if(c) openCustomer(c.id); else if(v) openCarrier(v.id);
  else toast('Nothing matches "'+this.value+'".');
});

/* chrome */
$("#burger").addEventListener("click",function(){
  const on=!$("#app").classList.contains("mobile-open");
  if(window.innerWidth<=820){ $("#app").classList.toggle("mobile-open",on); $("#navScrim").hidden=!on; }
  else $("#app").classList.toggle("collapsed");
});
$("#navScrim").addEventListener("click",function(){ $("#app").classList.remove("mobile-open"); this.hidden=true; });
$("#quickNew").addEventListener("click",newLoadModal);
$("#bell").addEventListener("click",function(){ go("dashboard"); toast(attention().length+" items need attention — listed on the dashboard."); });
$("#themeBtn").addEventListener("click",function(){
  const cur=document.documentElement.getAttribute("data-theme");
  const dark=cur==="dark"||(!cur&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme",dark?"light":"dark");
  try{ localStorage.setItem("ss-theme",dark?"light":"dark"); }catch(e){}
});
$("#signout").addEventListener("click",function(){
  var cfg=window.FREIGHT_OS||{};
  if(cfg.authOn&&cfg.logoutUrl){ window.location.href=cfg.logoutUrl; return; }
  $("#app").hidden=true; $("#login").hidden=false;
});

/* login */
const ROLES=[["ops","Operations manager","Everything — the full console","DW","Dana Whitfield"],
             ["billing","Billing","Invoices, settlements and payments","PS","Priya Shah"],
             ["disp","Dispatcher","Loads and the dispatch board","SO","Sam Okafor"]];
$("#roles").innerHTML=ROLES.map((r,i)=>'<button class="role" data-role="'+r[0]+'" aria-pressed="'+(i===0)+'">'+
  '<span class="ri">'+ic("carr",15)+'</span><span><b>'+esc(r[1])+'</b><span>'+esc(r[2])+'</span></span></button>').join("");
$$("#roles .role").forEach(b=>b.addEventListener("click",function(){
  $$("#roles .role").forEach(x=>x.setAttribute("aria-pressed",x===b)); ROLE=b.dataset.role;
}));
$("#loginGo").addEventListener("click",function(){
  const r=ROLES.find(x=>x[0]===ROLE)||ROLES[0];
  $("#uav").textContent=r[3]; $("#uname").textContent=r[4]; $("#urole").textContent=r[1];
  $("#login").hidden=true; $("#app").hidden=false;
  go(ROLE==="billing"?"invoices":ROLE==="disp"?"dispatch":"dashboard");
});


/* When PHP auth is installed, the role picker is bypassed: the signed-in
   user from the session drives the sidebar and the landing view. */
(function(){
  const cfg=window.FREIGHT_OS||{}, u=cfg.user;
  if(!cfg.authOn||!u) return;
  $("#uav").textContent=u.initials||"--";
  $("#uname").textContent=u.name||u.email||"User";
  $("#urole").textContent=u.role||"";
  $("#login").hidden=true;
  $("#app").hidden=false;
  const r=String(u.role||"").toLowerCase();
  ROLE = r.indexOf("billing")>=0||r.indexOf("account")>=0 ? "billing"
       : r.indexOf("dispatch")>=0 ? "disp" : "ops";
  go(ROLE==="billing"?"invoices":ROLE==="disp"?"dispatch":"dashboard");
})();
/* login art */
(function(){
  const cv=$("#lanes"); if(!cv) return; const ctx=cv.getContext("2d"); let W=1,H=1,t=0;
  function size(){ const r=cv.getBoundingClientRect(); const dp=Math.min(devicePixelRatio||1,2);
    W=Math.max(r.width,1);H=Math.max(r.height,1); cv.width=W*dp; cv.height=H*dp; ctx.setTransform(dp,0,0,dp,0,0); }
  function frame(){
    ctx.clearRect(0,0,W,H);
    const hz=H*0.52, F=460, CY=70;
    const px=(x,z)=>({x:W/2+x*(F/z),y:hz+CY*(F/z),s:F/z});
    for(let gx=-900;gx<=900;gx+=150){
      const a=px(gx,120),b=px(gx,2600);
      const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      g.addColorStop(0,"rgba(90,150,225,.30)"); g.addColorStop(1,"rgba(90,150,225,0)");
      ctx.strokeStyle=g; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    const off=(t*0.16)%150;
    for(let k=0;k<22;k++){
      const z0=120+off+k*150,z1=z0+70; if(z0>2500) continue;
      const a=px(0,z0),b=px(0,z1),fd=Math.max(0,1-(z0-120)/2400);
      ctx.strokeStyle="rgba(120,200,255,"+(0.7*fd*fd).toFixed(3)+")";
      ctx.lineWidth=Math.min(9,Math.max(0.8,3*a.s)); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    const gl=ctx.createRadialGradient(W/2,hz,0,W/2,hz,Math.max(W,H)*0.5);
    gl.addColorStop(0,"rgba(20,170,255,.18)"); gl.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=gl; ctx.fillRect(0,0,W,H);
  }
  size(); window.addEventListener("resize",function(){size();frame();});
  if(reduce) frame(); else (function loop(){ t+=16; frame(); requestAnimationFrame(loop); })();
})();

/* ================= BOOT ================= */
try{ const th=localStorage.getItem("ss-theme"); if(th) document.documentElement.setAttribute("data-theme",th); }catch(e){}
const LOGO="data:image/png;base64,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";
$("#logoLogin").src=LOGO; $("#logoSide").src=LOGO;

/* ---------- optional hydration from MySQL (api/data.php) ----------
   The server injects window.FREIGHT_OS. When hydration is on and the
   database answers, the master-data arrays are replaced with the rows
   from MySQL before seed() derives loads, invoices and settlements.
   Any failure is swallowed and the built-in sample data is used. */
function isoDate(s){
  if(!s) return null;
  const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  return m?new Date(+m[1],+m[2]-1,+m[3]):null;
}
function applyServerData(d){
  if(!d||d.ok!==true) return false;
  const swap=(arr,rows)=>{ arr.length=0; rows.forEach(r=>arr.push(r)); };
  if(Array.isArray(d.customers)&&d.customers.length) swap(CUSTOMERS,d.customers);
  if(Array.isArray(d.carriers)&&d.carriers.length){
    swap(CARRIERS,d.carriers.map(c=>Object.assign({},c,{insExp:isoDate(c.insExp)})));
  }
  if(Array.isArray(d.trucks)&&d.trucks.length) swap(TRUCKS,d.trucks);
  if(Array.isArray(d.lanes)&&d.lanes.length) swap(LANES,d.lanes);
  if(Array.isArray(d.quotes)&&d.quotes.length){
    swap(QUOTES,d.quotes.map(q=>Object.assign({},q,{ready:isoDate(q.ready)||TODAY})));
  }
  return true;
}

function boot(){ DB=restore()||seed(); render(); }

(function start(){
  const cfg=window.FREIGHT_OS||{};
  if(!cfg.hydrate||!cfg.apiUrl||typeof fetch!=="function"){ boot(); return; }
  fetch(cfg.apiUrl,{cache:"no-store",headers:{Accept:"application/json"}})
    .then(r=>r.ok?r.json():null)
    .then(applyServerData)
    .catch(()=>false)
    .then(boot);
})();
return {go:go,DB:()=>DB,reset:resetData};
})();
