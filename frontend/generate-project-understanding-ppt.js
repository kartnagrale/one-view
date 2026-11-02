const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Agri-Analytix Team';
pptx.subject = 'NeML One-View project understanding';
pptx.title = 'NeML One-View | Project Understanding';
pptx.company = 'NeML';
pptx.lang = 'en-IN';
pptx.theme = {
  headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'en-IN'
};
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.defineSlideMaster({
  title: 'MASTER',
  background: { color: 'F8FAFC' },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.10, fill: { color: '4F46E5' }, line: { color: '4F46E5' } } },
    { line: { x: 0.55, y: 7.10, w: 12.2, h: 0, line: { color: 'DCE3EE', width: 0.6 } } },
    { text: { text: 'NeML One-View  |  Commodity Auction Intelligence', options: { x: 0.58, y: 7.17, w: 6.4, h: 0.16, fontFace: 'Aptos', fontSize: 7.5, color: '64748B', margin: 0 } } },
    { text: { text: 'Project Understanding', options: { x: 10.4, y: 7.17, w: 2.35, h: 0.16, align: 'right', fontFace: 'Aptos', fontSize: 7.5, color: '64748B', margin: 0 } } }
  ],
  slideNumber: { x: 12.78, y: 7.17, color: '64748B', fontFace: 'Aptos', fontSize: 7.5 }
});

const C = { indigo:'4F46E5', purple:'7C3AED', teal:'0F9D8A', green:'16A34A', orange:'F59E0B', navy:'0F172A', slate:'334155', muted:'64748B', line:'DCE3EE', pale:'EEF2FF', bg:'F8FAFC', white:'FFFFFF', red:'DC2626' };
const logo = path.join(__dirname, 'src', 'assets', 'nemlLogo.png');
const S = pptx.ShapeType;
function addText(slide, text, x, y, w, h, opts={}) { slide.addText(text, { x,y,w,h, margin:0, breakLine:false, fontFace:'Aptos', fontSize:14, color:C.slate, fit:'shrink', valign:'mid', ...opts }); }
function rect(slide,x,y,w,h,fill,line='FFFFFF',radius=0){ slide.addShape(radius ? S.roundRect : S.rect,{x,y,w,h,rectRadius:radius,fill:{color:fill},line:{color:line,transparency:line===fill?100:0}}); }
function line(slide,x,y,w,h,color=C.line,width=1,dash){ slide.addShape(S.line,{x,y,w,h,line:{color,width,dashType:dash}}); }
function title(slide, eyebrow, heading, sub){ addText(slide,eyebrow.toUpperCase(),0.6,0.40,4,0.22,{fontSize:9,color:C.indigo,bold:true,charSpacing:1.2}); addText(slide,heading,0.6,0.68,12,0.45,{fontSize:25,color:C.navy,bold:true}); if(sub) addText(slide,sub,0.6,1.18,11.9,0.32,{fontSize:11,color:C.muted}); }
function pill(slide,text,x,y,w,color=C.pale,txt=C.indigo){ rect(slide,x,y,w,0.30,color,color,0.15); addText(slide,text,x,y+0.03,w,0.18,{fontSize:8.5,bold:true,color:txt,align:'center'}); }
function card(slide,x,y,w,h,accent,heading,body){ rect(slide,x,y,w,h,C.white,C.line,0.12); rect(slide,x,y,0.07,h,accent,accent,0.04); addText(slide,heading,x+0.25,y+0.22,w-0.4,0.26,{fontSize:13,bold:true,color:C.navy}); addText(slide,body,x+0.25,y+0.57,w-0.42,h-0.68,{fontSize:10.2,color:C.muted,breakLine:true,fit:'shrink',valign:'top'}); }

// 1. Cover
{
 const s=pptx.addSlide('MASTER');
 s.background={color:'F8FAFC'};
 s.addShape(S.rect,{x:0,y:0,w:13.333,h:7.5,fill:{color:'F8FAFC'},line:{color:'F8FAFC'}});
 s.addShape(S.arc,{x:8.5,y:-1.1,w:5.7,h:5.7,adjustPoint:0.25,fill:{color:'E0E7FF',transparency:15},line:{color:'E0E7FF',transparency:100},rotate:30});
 s.addShape(S.arc,{x:9.5,y:3.0,w:4.1,h:4.1,adjustPoint:0.25,fill:{color:'CCFBF1',transparency:15},line:{color:'CCFBF1',transparency:100},rotate:200});
 if(require('fs').existsSync(logo)) s.addImage({path:logo,x:0.65,y:0.55,w:1.25,h:0.52});
 pill(s,'PROJECT UNDERSTANDING',0.7,1.70,2.05);
 addText(s,'NeML One-View',0.68,2.17,6.9,0.7,{fontSize:34,bold:true,color:C.navy});
 addText(s,'Commodity Auction Intelligence',0.70,2.95,6.8,0.40,{fontSize:20,bold:true,color:C.indigo});
 addText(s,'A unified decision layer that brings Market, Sugar, and NCDFI data together for faster, clearer auction intelligence.',0.70,3.58,6.2,0.72,{fontSize:15,color:C.slate,breakLine:true,valign:'top'});
 addText(s,'Frontend overview  •  Angular 17  •  September 2026',0.70,5.75,5.8,0.24,{fontSize:10.5,color:C.muted});
 // dashboard illustration
 rect(s,7.60,1.35,4.75,4.65,'FFFFFF','CBD5E1',0.18); rect(s,7.60,1.35,4.75,0.37,'F1F5F9','F1F5F9',0.18);
 ['EF4444','F59E0B','22C55E'].forEach((c,i)=>s.addShape(S.ellipse,{x:7.88+i*.18,y:1.47,w:.10,h:.10,fill:{color:c},line:{color:c}}));
 addText(s,'NeML One-View',7.92,1.87,2.4,.22,{fontSize:12,bold:true,color:C.navy}); pill(s,'LIVE SNAPSHOT',10.63,1.83,1.25,'DCFCE7',C.green);
 ['Trade Value','Auctions','Participants'].forEach((t,i)=>{rect(s,7.92+i*1.39,2.28,1.19,.73,'F8FAFC','E2E8F0',0.08);addText(s,t,8.04+i*1.39,2.42,.95,.12,{fontSize:7.5,color:C.muted});addText(s,['₹ 2.8B','124+','1,240'][i],8.04+i*1.39,2.60,.95,.16,{fontSize:12,bold:true,color:C.navy});});
 rect(s,7.92,3.30,2.62,1.62,'F8FAFC','E2E8F0',0.08); addText(s,'Auction trend',8.10,3.47,1.5,.15,{fontSize:9,bold:true,color:C.navy});
 s.addShape(S.line,{x:8.12,y:4.58,w:1.95,h:-.78,line:{color:C.indigo,width:2.5,beginArrowType:'none',endArrowType:'none'}});
 [0,1,2,3,4].forEach(i=>s.addShape(S.ellipse,{x:8.1+i*.49,y:[4.57,4.32,4.40,4.05,3.80][i],w:.08,h:.08,fill:{color:C.indigo},line:{color:C.indigo}}));
 rect(s,10.72,3.30,1.18,1.62,'F8FAFC','E2E8F0',0.08); addText(s,'AI',10.94,3.54,.7,.15,{fontSize:9,bold:true,color:C.purple,align:'center'}); addText(s,'Insights\n& answers',10.84,3.92,.95,.48,{fontSize:9,color:C.slate,align:'center',breakLine:true});
}

// 2 problem/value
{
 const s=pptx.addSlide('MASTER'); title(s,'Why it exists','One screen for a fragmented auction landscape','The product replaces disconnected source views and repeat data requests with a governed, filterable intelligence layer.');
 card(s,.65,1.85,3.75,3.55,C.red,'The operating challenge','Market, Sugar, and NCDFI data sit in separate systems. Comparing performance, participation, prices, and outcomes can require manual extracts and reconciliation.');
 card(s,4.78,1.85,3.75,3.55,C.orange,'The insight gap','Different business units, commodities, contracts, locations, and UOMs make rolled-up views easy to misread without consistent dimensions and business rules.');
 card(s,8.91,1.85,3.75,3.55,C.indigo,'The One-View response','A shared dashboard, reusable reports, entity mapping, and AI-assisted analysis make decision-ready insight available from one place.');
 pill(s,'OUTCOME: FASTER, CONSISTENT, AUDITABLE DECISIONS',3.55,5.82,6.25,'E0E7FF',C.indigo);
}

// 3 source flow
{
 const s=pptx.addSlide('MASTER'); title(s,'Architecture at a glance','Three sources become one decision layer','The frontend consumes a versioned API and presents a synchronized, role-aware analytics experience.');
 const nodes=[['MARKET','Auction & trade data',C.indigo],['SUGAR','Sugar operations & trades',C.green],['NCDFI','Dairy & commodity data',C.orange]];
 nodes.forEach((n,i)=>{ const y=1.85+i*1.35; rect(s,.75,y,2.55,.86,'FFFFFF',C.line,.12); rect(s,.75,y,.10,.86,n[2],n[2],.05); addText(s,n[0],1.05,y+.17,1.5,.18,{fontSize:12,bold:true,color:C.navy});addText(s,n[1],1.05,y+.44,1.9,.14,{fontSize:8.5,color:C.muted}); line(s,3.32,y+.43,1.1,0,C.indigo,1.5,'dash'); });
 rect(s,4.42,2.34,3.05,1.95,'EEF2FF','C7D2FE',.15); addText(s,'NeML One-View',4.72,2.67,2.45,.24,{fontSize:16,bold:true,color:C.indigo,align:'center'});addText(s,'Normalized dimensions\n• unified filters\n• business rules\n• refreshed snapshot',4.82,3.15,2.25,.74,{fontSize:10,color:C.slate,align:'center',breakLine:true});
 line(s,7.47,3.31,1.05,0,C.teal,1.5,'dash');
 const outputs=[['Dashboard','KPIs, trends, price discovery'],['Reports','Reusable exportable MIS'],['AI Assistant','Narratives, insights, Q&A']];
 outputs.forEach((o,i)=>{const y=1.70+i*1.3; rect(s,8.53,y,3.95,.84,'FFFFFF',C.line,.12);rect(s,8.53,y,.09,.84,[C.indigo,C.teal,C.purple][i],[C.indigo,C.teal,C.purple][i],.04); addText(s,o[0],8.82,y+.15,1.6,.18,{fontSize:12,bold:true,color:C.navy}); addText(s,o[1],8.82,y+.43,3.15,.14,{fontSize:8.8,color:C.muted});});
 addText(s,'Data access is mediated through /api/v1 endpoints; the UI does not query production transaction tables directly.',.75,5.85,11.4,.27,{fontSize:10.5,color:C.muted,italic:true});
}

// 4 functional modules
{
 const s=pptx.addSlide('MASTER'); title(s,'Product map','Six connected workspaces','Navigation is organized around the questions an analyst or MarketWatch administrator needs to answer.');
 const m=[['Overview','Executive KPIs, UOM-safe quantity views, trend and price discovery.',C.indigo],['Auctions','Searchable, paginated auction-level records with filter context.',C.teal],['Participants','Counterparty visibility and participation activity across sources.',C.green],['Reports','Reusable MIS catalogue, source health, and Excel export.',C.orange],['Mappings','Admin-managed enrichment rules for clients, markets, commodities, and contracts.',C.purple],['AI Assistant','Analysis, alerts, suggested questions, and conversational exploration.',C.indigo]];
 m.forEach((a,i)=>{let x=.65+(i%3)*4.18,y=1.72+Math.floor(i/3)*2.18;card(s,x,y,3.72,1.72,a[2],a[0],a[1]);});
}

// 5 dashboard
{
 const s=pptx.addSlide('MASTER'); title(s,'Core experience','Dashboard: from filters to decision-ready signals','The overview is the analyst’s working surface: select context once, then read comparable KPIs, trends, and drill-downs.');
 rect(s,.68,1.72,11.98,4.92,'FFFFFF',C.line,.14); rect(s,.68,1.72,11.98,.45,'F8FAFC','F8FAFC',.14); addText(s,'Commodity Auction & Analytics Hub',.95,1.85,4,.18,{fontSize:12,bold:true,color:C.navy}); pill(s,'REFRESH SNAPSHOT',10.55,1.80,1.55,'EEF2FF',C.indigo);
 const filters=['Source','Client','Market','Commodity','Contract','State','Date range']; filters.forEach((f,i)=>{let x=.95+i*1.58;rect(s,x,2.35,1.36,.38,'F8FAFC','CBD5E1',.06);addText(s,f,x+.10,2.47,1.05,.12,{fontSize:8,color:C.slate});});
 ['Trade Value','Auctions','Participants','Approval Rate','Fwd / Reverse'].forEach((k,i)=>{let x=.95+i*2.23;rect(s,x,2.98,1.93,.70,'F8FAFC','E2E8F0',.08);addText(s,k,x+.12,3.11,1.4,.11,{fontSize:7.5,color:C.muted});addText(s,['₹ …','…','…','…%','… / …'][i],x+.12,3.30,1.3,.15,{fontSize:12,bold:true,color:C.navy});});
 rect(s,.95,3.94,5.65,2.22,'F8FAFC','E2E8F0',.08);addText(s,'Trading statistics & price discovery trend',1.18,4.15,3.6,.15,{fontSize:10,bold:true,color:C.navy});
 // stylized chart
 line(s,1.26,5.68,4.78,0,'CBD5E1',.6); line(s,1.26,4.55,0,1.13,'CBD5E1',.6); const pts=[[1.35,5.37],[2.05,5.10],[2.78,5.34],[3.47,4.65],[4.22,4.93],[5.10,4.39],[5.85,4.58]]; for(let i=0;i<pts.length-1;i++)line(s,pts[i][0],pts[i][1],pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1],C.indigo,2); pts.forEach(p=>s.addShape(S.ellipse,{x:p[0]-.04,y:p[1]-.04,w:.08,h:.08,fill:{color:C.indigo},line:{color:C.indigo}}));
 rect(s,6.84,3.94,5.54,2.22,'F8FAFC','E2E8F0',.08);addText(s,'Dual-auction price discovery',7.08,4.15,2.7,.15,{fontSize:10,bold:true,color:C.navy});card(s,7.10,4.55,2.30,1.10,C.green,'Forward','Highest sale prices');card(s,9.67,4.55,2.30,1.10,C.orange,'Reverse','Lowest procurement prices');
 addText(s,'UOM integrity is explicit: MT, KG, NOS, and other units are never combined in a single quantity metric.',.95,6.31,10,.14,{fontSize:8.8,bold:true,color:C.teal});
}

// 6 data intelligence & reporting
{
 const s=pptx.addSlide('MASTER'); title(s,'Governed intelligence','Reusable reports and configurable data mapping','The platform formalizes commonly repeated analysis while retaining business-controlled enrichment.');
 card(s,.68,1.75,3.55,3.70,C.orange,'Report Studio','• Health and readiness of each data source\n• Reusable report catalogue\n• Suggested business filters\n• Sensitivity badges for participant PII\n• Excel export for operational follow-up');
 card(s,4.89,1.75,3.55,3.70,C.purple,'Data Mapping Console','• Project + market code establishes enrichment\n• Commodity and contract add specificity\n• Most-specific active rule wins\n• Audit metadata supports governance\n• Restricted to MarketWatch role');
 card(s,9.10,1.75,3.55,3.70,C.teal,'Design principle','Normalize common dimensions once, refresh a read-only analytical snapshot, and reuse it across dashboard, drill-downs, reports, and AI.');
 pill(s,'LESS ONE-OFF SQL  •  MORE REPEATABLE BUSINESS ANSWERS',3.3,5.90,6.8,'CCFBF1',C.teal);
}

// 7 AI
{
 const s=pptx.addSlide('MASTER'); title(s,'AI-assisted analysis','Turn the current filter context into a conversation','The assistant augments—not replaces—the dashboard by producing narrative, insight cards, suggested questions, and answers grounded in selected data.');
 rect(s,.72,1.75,5.55,4.65,'FFFFFF','C7D2FE',.15); addText(s,'AI Analysis',1.02,2.02,2.0,.20,{fontSize:14,bold:true,color:C.purple});pill(s,'Market health score',4.42,1.99,1.40,'F3E8FF',C.purple);addText(s,'Executive narrative',1.02,2.52,2.5,.16,{fontSize:10,bold:true,color:C.navy});rect(s,1.02,2.78,4.85,.76,'F8FAFC','E2E8F0',.07);addText(s,'A concise interpretation of the selected market context, including performance and the most relevant signals.',1.18,2.96,4.45,.34,{fontSize:9.5,color:C.slate,breakLine:true});
 ['Anomaly','Opportunity','Risk'].forEach((t,i)=>{rect(s,1.02,3.86+i*.57,4.85,.40,['FEF2F2','ECFDF5','FFF7ED'][i],['FECACA','A7F3D0','FED7AA'][i],.06);addText(s,t,1.16,3.98+i*.57,.95,.12,{fontSize:8.5,bold:true,color:[C.red,C.green,C.orange][i]});addText(s,'Insight with metric highlight and next question',2.20,3.98+i*.57,3.2,.12,{fontSize:8.2,color:C.slate});});
 rect(s,6.72,1.75,5.90,4.65,'FFFFFF','C7D2FE',.15);addText(s,'Ask One-View',7.02,2.02,2.2,.20,{fontSize:14,bold:true,color:C.purple});
 rect(s,7.02,2.55,4.85,.54,'EEF2FF','EEF2FF',.12);addText(s,'Which commodities have the highest clearance rate?',7.20,2.73,4.35,.14,{fontSize:9.5,color:C.indigo});
 rect(s,8.10,3.32,3.77,.95,'F8FAFC','E2E8F0',.12);addText(s,'Answer includes data badges, confidence, and suggested follow-ups—while retaining the active dashboard filters.',8.30,3.52,3.38,.45,{fontSize:9.4,color:C.slate,breakLine:true});
 pill(s,'Filter-aware',7.08,4.74,1.15,'DCFCE7',C.green);pill(s,'Suggested follow-ups',8.45,4.74,1.72,'EEF2FF',C.indigo);pill(s,'Confidence score',10.38,4.74,1.25,'F3E8FF',C.purple);
}

// 8 security
{
 const s=pptx.addSlide('MASTER'); title(s,'Access and controls','Secure, role-aware access to analytical data','Controls in the frontend make access status and privileged capabilities visible; the backend remains the authority for data and authorization.');
 const cols=[['Authentication','Basic credential token is held in session storage for the active browser session.','AuthService',C.indigo],['Route protection','Protected product areas sit behind an authentication guard.','authGuard',C.teal],['Role-based UI','MarketWatch users can access the Mapping Console and perform mapping edits.','MARKETWATCH role',C.purple],['Data awareness','Reports identify sensitive participant data with an Internal PII indicator.','PII labelling',C.orange]];
 cols.forEach((a,i)=>{let x=.63+i*3.16;rect(s,x,1.88,2.82,3.50,'FFFFFF',C.line,.13);rect(s,x,1.88,2.82,.10,a[3],a[3],.04);addText(s,a[0],x+.24,2.22,2.3,.28,{fontSize:13,bold:true,color:C.navy});addText(s,a[1],x+.24,2.79,2.3,1.25,{fontSize:10,color:C.muted,breakLine:true,valign:'top'});line(s,x+.24,4.54,2.25,0,C.line,.7);addText(s,a[2],x+.24,4.75,2.25,.18,{fontSize:9,bold:true,color:a[3]});});
 addText(s,'Note: the frontend describes the session and visibility model. Final authentication, authorization, and data protection should be enforced by the API and source systems.',.72,5.93,11.6,.30,{fontSize:10.2,color:C.muted,italic:true});
}

// 9 user journey
{
 const s=pptx.addSlide('MASTER'); title(s,'How a user works with it','A typical analyst journey','A single context travels with the user—from broad market view to records, report export, and a data-grounded follow-up question.');
 const steps=[['1','Sign in','Authenticated analyst enters the protected workspace.'],['2','Set context','Choose source, client, commodity, market, state, and period.'],['3','Read signals','Review KPIs, UOM-safe quantities, trends, and price discovery.'],['4','Investigate','Open auction or participant records to inspect details.'],['5','Act & share','Export a report or ask AI for an explanation and next question.']];
 steps.forEach((a,i)=>{let x=.62+i*2.53; if(i<4) line(s,x+2.09,3.16,.44,0,'A5B4FC',2);s.addShape(S.ellipse,{x:x+.82,y:2.25,w:.72,h:.72,fill:{color:[C.indigo,C.teal,C.green,C.orange,C.purple][i]},line:{color:[C.indigo,C.teal,C.green,C.orange,C.purple][i]}});addText(s,a[0],x+.82,2.43,.72,.18,{fontSize:13,bold:true,color:C.white,align:'center'});addText(s,a[1],x+.10,3.28,2.15,.22,{fontSize:12,bold:true,color:C.navy,align:'center'});addText(s,a[2],x+.10,3.65,2.15,.64,{fontSize:9.2,color:C.muted,align:'center',breakLine:true,valign:'top'});});
 rect(s,1.58,5.42,10.20,.63,'EEF2FF','C7D2FE',.12);addText(s,'The filter is the connective tissue: it keeps dashboard data, drill-downs, exports, and AI responses anchored to the same business question.',1.88,5.62,9.62,.18,{fontSize:10.5,bold:true,color:C.indigo,align:'center'});
}

// 10 close
{
 const s=pptx.addSlide('MASTER'); title(s,'Summary','What NeML One-View delivers','A practical foundation for unified commodity-auction intelligence across NeML’s connected markets.');
 const rows=[['Unify','Market, Sugar, and NCDFI sources in a single analytical experience.'],['Understand','Turn filters into clear KPIs, UOM-safe quantities, trends, price discovery, and records.'],['Govern','Use reusable reports, mapping rules, source health, PII awareness, and role-aware capabilities.'],['Explore','Pair the dashboard with AI-assisted narratives, insights, and contextual questions.']];
 rows.forEach((r,i)=>{let y=1.82+i*.89;rect(s,1.16,y,11.05,.64,'FFFFFF','E2E8F0',.10);rect(s,1.16,y,.13,.64,[C.indigo,C.teal,C.purple,C.orange][i],[C.indigo,C.teal,C.purple,C.orange][i],.05);addText(s,r[0],1.55,y+.20,1.35,.18,{fontSize:13,bold:true,color:C.navy});addText(s,r[1],3.0,y+.20,8.55,.18,{fontSize:10.5,color:C.slate});});
 pill(s,'NEXT: ALIGN KPI DEFINITIONS, SOURCE REFRESH SLAs, AND ROLE POLICY WITH BUSINESS OWNERS',1.77,5.85,9.75,'E0E7FF',C.indigo);
}

pptx.writeFile({ fileName: path.join(__dirname, 'NeML-One-View_Project-Understanding.pptx') });
