const pages=["home","presence","mindsets","body-language","strength-style","practice","summary"];
const storageKey="hftb-interview-skills-v1";
const emptyWorkbook=()=>({version:1,mindsets:{},body:{},styles:{},scenarios:{},choices:{}});
let workbook=emptyWorkbook();

const mindsets=[
  {id:"okay",title:"No matter what, I will be okay",meaning:"The interview matters, but one outcome does not determine your worth or future.",use:"Reduces threat and helps your personality remain available."},
  {id:"invite",title:"I do not need to convince anyone",meaning:"Present your background clearly and invite the employer to explore mutual fit.",use:"Replaces approval-seeking with professional confidence."},
  {id:"humanize",title:"Go first in humanizing the interaction",meaning:"Offer the first warm greeting, natural smile, or appropriate moment of connection.",use:"Helps the conversation feel human instead of rigid."},
  {id:"purpose",title:"Proactively share my purpose",meaning:"Explain what motivates your work and what problem you want to help solve.",use:"Connects your experience to a meaningful direction."},
  {id:"honesty",title:"Use impeccable honesty and integrity",meaning:"Discuss strengths, gaps, and mistakes truthfully without exaggeration or defensiveness.",use:"Supports trust and steadier answers."},
  {id:"character",title:"Character matters more than reputation",meaning:"Answer from your values instead of performing solely for approval or appearances.",use:"Keeps your message consistent and believable."},
];

const mechanics=[
  {id:"movement",icon:"↘",title:"Slow the movement",text:"Anxiety can create darting eyes, jerky gestures, and rushed motion. Deliberately slower movement appears more grounded and helps your body settle."},
  {id:"space",icon:"↔",title:"Use comfortable space",text:"Unpin your elbows and use natural gestures within your space. Open palms can communicate engagement; exaggerated gestures are unnecessary."},
  {id:"alignment",icon:"◎",title:"Turn the whole body",text:"When addressing someone, align your eyes, head, chest, and torso toward them instead of looking sideways while the body stays frozen."},
  {id:"silence",icon:"Ⅱ",title:"Replace fillers with pauses",text:"A short pause is stronger than repeated “um,” “ah,” or other crutch words. It gives you time and helps the interviewer follow your answer."},
  {id:"finish",icon:"●",title:"Finish the sentence",text:"Complete the thought clearly, lower the voice naturally at the end, and then pause. Do not let every answer trail away."},
  {id:"prime",icon:"⚡",title:"Prime the physical state",text:"Before entering, use movement, breathing, posture, or a vocal warm-up. A useful cue is: “I deserve to be here, and I am ready to have a conversation.”"},
];

const styleInfo={
  conviction:{name:"High Conviction",description:"You create confidence through certainty, decisive language, and clear belief in a direction.",strengths:["Confident delivery","Firm sentence endings","Clear goals"],watch:"Certainty can sound rigid if you do not show curiosity or openness to coaching.",practice:"Pair conviction with one thoughtful question and acknowledge where you are still learning."},
  authentic:{name:"Authentic",description:"You create trust through honesty, directness, and a willingness to discuss the real story.",strengths:["Credibility","Natural connection","Honest discussion of gaps"],watch:"Being genuine does not mean sharing every detail or speaking without professional boundaries.",practice:"Keep the truth relevant: situation, lesson, change, and current readiness."},
  funny:{name:"Warm & Lighthearted",description:"You reduce tension through warmth, appropriate humor, and an enjoyable conversational style.",strengths:["Rapport","Memorable interaction","Calm recovery from awkward moments"],watch:"Too much humor can distract from qualifications or feel poorly timed.",practice:"Use light humor sparingly, then return clearly to the question and evidence."},
  empathetic:{name:"Empathetic",description:"You create connection by listening carefully and showing that you understand the interviewer’s needs.",strengths:["Active listening","Strong questions","Relationship awareness"],watch:"You may focus so much on the other person that your own value and results become unclear.",practice:"After listening, connect their stated need to one specific example of what you can contribute."},
  energetic:{name:"Energetic",description:"You create momentum through enthusiasm, warmth, vocal variety, and visible interest.",strengths:["Positive first impression","Enthusiasm","Engaging delivery"],watch:"High energy can become rushed speech, interruption, or oversized gestures.",practice:"Keep the warmth while slowing the pace and allowing the interviewer to finish."},
};

const styleQuestions=[
  ["c1","conviction","I speak about my abilities and goals with clear belief."],["a1","authentic","I am comfortable giving an honest answer instead of a polished but untrue one."],["f1","funny","I naturally use appropriate warmth or light humor to reduce tension."],["e1","empathetic","I listen closely for what the interviewer or team truly needs."],["n1","energetic","My enthusiasm is visible in my voice and expression."],
  ["c2","conviction","I finish answers firmly instead of trailing off."],["a2","authentic","I can discuss a mistake or gap without becoming defensive."],["f2","funny","I can recover from an awkward moment without becoming rigid."],["e2","empathetic","I ask sincere questions that help me understand workplace priorities."],["n2","energetic","I bring positive energy that is slightly higher than the room."],
  ["c3","conviction","When challenged, I can stay steady and explain my reasoning."],["a3","authentic","My answers sound like me rather than memorized corporate language."],["f3","funny","People often find conversations with me comfortable and enjoyable."],["e3","empathetic","I make people feel heard before I respond."],["n3","energetic","I use vocal variety and open body language to stay engaging."],
];

const scenarios=[
  {id:"s1",question:"The interviewer asks about a gap in employment.",choices:["Avoid the question and immediately change the subject.","Give a brief honest explanation, state what you did during the period, and explain why you are ready now.","Invent a role so the timeline looks stronger.","Apologize repeatedly for the gap."],correct:1,why:"Honesty plus present readiness creates more trust than avoidance, exaggeration, or over-apologizing."},
  {id:"s2",question:"You need several seconds to organize a difficult answer.",choices:["Begin speaking immediately and use filler words until the answer appears.","Say, “That is a good question. Let me think for a moment,” pause, and then answer.","Tell the interviewer the question is unfair.","Give the shortest possible answer and look away."],correct:1,why:"A deliberate pause signals thoughtfulness and is stronger than rushing."},
  {id:"s3",question:"You do not have every qualification listed in the posting.",choices:["Claim that you have experience you do not have.","Focus only on the missing qualification.","Acknowledge the gap, connect related experience, and explain a realistic learning plan.","Tell the employer the requirement is unnecessary."],correct:2,why:"This combines integrity, confidence, transferable skills, and coachability."},
  {id:"s4",question:"The interviewer asks, “Why do you want this job?”",choices:["Give only a list of duties from the posting.","Say that you will take any available job.","Connect the employer’s needs with your experience, interests, and the contribution you want to make.","Describe only what you want the employer to give you."],correct:2,why:"A purpose-based answer shows both motivation and relevance."},
  {id:"s5",question:"The interviewer seems formal and reserved.",choices:["Force jokes into the conversation.","Match the professional tone, remain warm, and let rapport build naturally.","Assume they dislike you and become withdrawn.","Increase your volume and energy until they respond."],correct:1,why:"Adaptation means staying warm while respecting the other person’s pace and tone."},
  {id:"s6",question:"The interviewer asks whether you have questions.",choices:["Say no because asking questions could seem demanding.","Ask only how quickly you can be promoted.","Ask what success in the role would look like after the first several months.","Ask a question that was already answered clearly."],correct:2,why:"A thoughtful success question demonstrates listening, purpose, and interest in mutual fit."},
];

function loadSaved(){try{const saved=JSON.parse(localStorage.getItem(storageKey)||"null");if(saved&&saved.version===1)workbook={...emptyWorkbook(),...saved}}catch{}}
function save(){localStorage.setItem(storageKey,JSON.stringify(workbook));const n=document.getElementById("saveNotice");n.textContent="✓ Progress saved automatically in this browser.";clearTimeout(save.timer);save.timer=setTimeout(()=>n.textContent="Answers save automatically in this browser.",1800)}
function render(){
  document.getElementById("mindsetCards").innerHTML=mindsets.map((m,i)=>`<article><h2>${i+1}. ${m.title}</h2><p>${m.meaning}</p><strong>INTERVIEW VALUE</strong><p>${m.use}</p></article>`).join("");
  document.getElementById("mindsetQuestions").innerHTML=mindsets.map((m,i)=>ratingRow(`mindset-${m.id}`,`How useful would “${m.title}” be for you?`,i,workbook.mindsets[m.id])).join("");
  document.getElementById("mechanicCards").innerHTML=mechanics.map(m=>`<article><b>${m.icon}</b><h2>${m.title}</h2><p>${m.text}</p></article>`).join("");
  document.getElementById("bodyQuestions").innerHTML=mechanics.map(m=>`<div class="body-question"><p><strong>${m.title}</strong></p>${["Needs practice","Developing","Usually confident"].map(v=>`<label><input type="radio" name="body-${m.id}" value="${v}" ${workbook.body[m.id]===v?"checked":""}><span>${v}</span></label>`).join("")}</div>`).join("");
  document.getElementById("styleQuestions").innerHTML=styleQuestions.map((q,i)=>ratingRow(`style-${q[0]}`,q[2],i,workbook.styles[q[0]])).join("");
  document.getElementById("scenarioQuestions").innerHTML=scenarios.map((s,i)=>`<article class="scenario"><h2>${i+1}. ${s.question}</h2><p>Choose the strongest response.</p><div class="scenario-options">${s.choices.map((c,j)=>`<label class="${workbook.scenarios[s.id]===j?"selected":""}"><input type="radio" name="scenario-${s.id}" value="${j}" ${workbook.scenarios[s.id]===j?"checked":""}><span>${String.fromCharCode(65+j)}</span><b>${c}</b></label>`).join("")}</div><div class="scenario-feedback">${Number.isInteger(workbook.scenarios[s.id])?(workbook.scenarios[s.id]===s.correct?"✓ Strong choice. ":"Review this choice. ")+s.why:""}</div></article>`).join("");
  restoreSimpleChoices();bindInputs();updateStyleResult();updateSummary();
}
function ratingRow(name,text,index,value){return `<div class="rating-row"><p><span>${index+1}</span>${text}</p><div class="rating-options">${[1,2,3,4].map(n=>`<label><input type="radio" name="${name}" value="${n}" ${value===n?"checked":""}><span>${n}</span></label>`).join("")}</div></div>`}
function bindInputs(){
  document.querySelectorAll('input[name^="mindset-"]').forEach(el=>el.onchange=()=>{workbook.mindsets[el.name.replace("mindset-","")]=Number(el.value);save();updateSummary()});
  document.querySelectorAll('input[name^="body-"]').forEach(el=>el.onchange=()=>{workbook.body[el.name.replace("body-","")]=el.value;save();updateSummary()});
  document.querySelectorAll('input[name^="style-"]').forEach(el=>el.onchange=()=>{workbook.styles[el.name.replace("style-","")]=Number(el.value);save();updateStyleResult();updateSummary()});
  document.querySelectorAll('input[name^="scenario-"]').forEach(el=>el.onchange=()=>{workbook.scenarios[el.name.replace("scenario-","")]=Number(el.value);save();render()});
  document.querySelectorAll('.choice input').forEach(el=>el.onchange=()=>{workbook.choices[el.name]=el.value;save();restoreSimpleChoices();updateSummary()});
}
function restoreSimpleChoices(){document.querySelectorAll('.choice input').forEach(el=>{el.checked=workbook.choices[el.name]===el.value;el.closest("label").classList.toggle("selected",el.checked)})}
function styleScores(){const totals=Object.keys(styleInfo).map(key=>({key,total:styleQuestions.filter(q=>q[1]===key).reduce((n,q)=>n+(workbook.styles[q[0]]||0),0)}));return totals.sort((a,b)=>b.total-a.total)}
function updateStyleResult(){const box=document.getElementById("liveStyleResult"),count=Object.keys(workbook.styles).length;if(count<styleQuestions.length){box.innerHTML=`<strong>${count} of ${styleQuestions.length} completed.</strong> Finish every statement to calculate your interview strength style.`;return}const top=styleScores()[0],info=styleInfo[top.key];box.innerHTML=`<strong>Your leading interview strength: ${info.name}</strong><p>${info.description}</p>`}
function updateSummary(){
  const styleCount=Object.keys(workbook.styles).length,mindsetCount=Object.keys(workbook.mindsets).length,bodyCount=Object.keys(workbook.body).length,scenarioCount=Object.keys(workbook.scenarios).length;
  const topStyle=styleScores()[0],info=styleInfo[topStyle.key];
  const mindsetRank=mindsets.map(m=>({...m,value:workbook.mindsets[m.id]||0})).sort((a,b)=>b.value-a.value);
  const bodyNeeds=mechanics.filter(m=>workbook.body[m.id]==="Needs practice");
  const correct=scenarios.filter(s=>workbook.scenarios[s.id]===s.correct).length;
  const complete=styleCount===15&&mindsetCount===6;
  const topMindset=mindsetCount?mindsetRank[0]:null;
  const practiceTargets=bodyNeeds.length?bodyNeeds.slice(0,3):mechanics.filter(m=>workbook.body[m.id]==="Developing").slice(0,3);
  const actions=[];
  if(topMindset)actions.push(`Before the interview, repeat: “${topMindset.title}.”`);
  if(practiceTargets[0])actions.push(`Practice ${practiceTargets[0].title.toLowerCase()} in one recorded answer.`);
  if(complete)actions.push(`${info.practice}`);else actions.push("Complete the mindset and strength-style assessments.");
  document.getElementById("summaryContent").innerHTML=`
    <div class="summary-grid"><article class="summary-card highlight"><p class="kicker">MY INTERVIEW STRENGTH</p><h2>${styleCount===15?info.name:"Assessment not complete"}</h2><p>${styleCount===15?info.description:`Complete all 15 strength-style statements (${styleCount}/15 completed).`}</p></article><article class="summary-card alert"><p class="kicker">MY MOST USEFUL MINDSET</p><h2>${mindsetCount===6?topMindset.title:"Assessment not complete"}</h2><p>${mindsetCount===6?topMindset.use:`Complete all six mindset ratings (${mindsetCount}/6 completed).`}</p></article></div>
    <article class="summary-card"><h2>Strengths to Use</h2>${styleCount===15?`<ul>${info.strengths.map(x=>`<li>${x}</li>`).join("")}</ul><p><strong>Watch-out:</strong> ${info.watch}</p>`:"<p>Complete Module 4 to identify your strengths.</p>"}</article>
    <article class="summary-card"><h2>Body-Language Practice</h2><p>${bodyCount}/6 skills reviewed.</p>${practiceTargets.length?`<ul>${practiceTargets.map(x=>`<li><strong>${x.title}:</strong> ${x.text}</li>`).join("")}</ul>`:"<p>No priority has been identified yet. Complete Module 3 or continue practicing all six skills.</p>"}</article>
    <article class="summary-card good"><h2>Practice-Lab Result</h2><p><strong>${correct} of ${scenarioCount} completed scenarios used the strongest response.</strong></p><p>The purpose is not a perfect score. Review the explanations and practice saying the strongest answers aloud in your own words.</p></article>
    <article class="summary-card"><h2>My Three Next Steps</h2><ol>${actions.map(x=>`<li>${x}</li>`).join("")}</ol></article>
    <div class="notice"><strong>Final reminder:</strong> Interview presence supports substance; it does not replace preparation. Use honest examples, connect your experience to the employer’s needs, and ask thoughtful questions.</div>`;
}
function showPage(id,push=true){if(!pages.includes(id))id="home";document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.dataset.pagePanel===id));document.querySelectorAll(".course-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===id));const i=pages.indexOf(id);document.getElementById("pageCount").textContent=`${i+1} of ${pages.length}`;document.getElementById("previousPage").disabled=i===0;document.getElementById("nextPage").disabled=i===pages.length-1;document.getElementById("previousPage").dataset.target=pages[Math.max(0,i-1)];document.getElementById("nextPage").dataset.target=pages[Math.min(pages.length-1,i+1)];if(push)history.replaceState(null,"",`#${id}`);window.scrollTo({top:0,behavior:"smooth"})}
function download(name,text,type="application/json"){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
loadSaved();render();
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showPage(b.dataset.go));document.getElementById("previousPage").onclick=e=>showPage(e.currentTarget.dataset.target);document.getElementById("nextPage").onclick=e=>showPage(e.currentTarget.dataset.target);
document.getElementById("downloadWorkbook").onclick=()=>download("HFTB_Interview_Skills_Workbook.json",JSON.stringify(workbook,null,2));document.getElementById("loadWorkbook").onclick=()=>document.getElementById("workbookFile").click();document.getElementById("workbookFile").onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(data.version!==1)throw Error();workbook={...emptyWorkbook(),...data};save();render();showPage("summary")}catch{alert("That file is not a valid Interview Skills workbook.")}e.target.value=""};document.getElementById("startFresh").onclick=()=>{if(confirm("Clear all Interview Skills answers stored in this browser?")){workbook=emptyWorkbook();localStorage.removeItem(storageKey);render();showPage("home")}};
document.getElementById("printSummary").onclick=()=>window.print();document.getElementById("downloadSummary").onclick=()=>{const text=document.getElementById("summaryContent").innerText;download("HFTB_My_Interview_Readiness_Summary.txt",`HOMES FOR THE BRAVE\nINTERVIEW PRESENCE & CONFIDENCE\n\n${text}`,"text/plain")};
showPage(location.hash.slice(1)||"home",false);
