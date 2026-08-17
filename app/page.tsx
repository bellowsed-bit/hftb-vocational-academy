"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type StyleKey = "direct" | "analytical" | "supportive" | "expressive";
type BehaviorKey = "passive" | "aggressive" | "passiveAggressive" | "assertive";
type Workbook = { version: 1; acknowledged: boolean; answers: Record<string, number>; behaviorAnswers: Record<string, number>; reflections: Record<string, string> };
const STORAGE_KEY = "hftb-communication-skills-v1";
const emptyWorkbook: Workbook = { version: 1, acknowledged: false, answers: {}, behaviorAnswers: {}, reflections: {} };

const styles: Record<StyleKey, { name: string; short: string; strengths: string[]; watch: string[]; needs: string[]; color: string }> = {
  direct: { name: "Direct", short: "Results-focused, decisive, and concise", strengths: ["Makes decisions", "Clarifies priorities", "Moves work forward"], watch: ["May sound impatient", "Can move before others are ready", "May overlook feelings or details"], needs: ["A clear bottom line", "Options and deadlines", "Brief, confident communication"], color: "#587c95" },
  analytical: { name: "Analytical", short: "Accurate, careful, and fact-focused", strengths: ["Checks details", "Finds errors", "Uses logic and evidence"], watch: ["May overanalyze", "Can delay decisions", "May sound overly critical"], needs: ["Facts and instructions", "Time to evaluate", "Clear standards"], color: "#6f72a8" },
  supportive: { name: "Supportive", short: "Patient, cooperative, and relationship-focused", strengths: ["Listens well", "Builds trust", "Supports teamwork"], watch: ["May avoid conflict", "Can agree without speaking up", "May put others first too often"], needs: ["Respectful tone", "Time to respond", "Inclusion and reassurance"], color: "#67917b" },
  expressive: { name: "Expressive", short: "Enthusiastic, creative, and idea-focused", strengths: ["Generates ideas", "Motivates others", "Communicates enthusiasm"], watch: ["May interrupt", "Can overlook details", "May change direction quickly"], needs: ["Room to discuss ideas", "Visible enthusiasm", "A written summary of next steps"], color: "#9b6989" },
};

const questions: Array<{ id: string; style: StyleKey; text: string }> = [
  ["d1","direct","I prefer people to get to the point."],["a1","analytical","I want facts and details before deciding."],["s1","supportive","I consider how decisions affect other people."],["e1","expressive","I communicate with energy and enthusiasm."],
  ["d2","direct","I am comfortable taking charge when a decision is needed."],["a2","analytical","I carefully review instructions and notice missing information."],["s2","supportive","I listen patiently and try to keep the group working together."],["e2","expressive","I enjoy discussing ideas, possibilities, and the big picture."],
  ["d3","direct","I focus quickly on results, priorities, and next steps."],["a3","analytical","Accuracy matters more to me than finishing quickly."],["s3","supportive","I prefer cooperation over competition."],["e3","expressive","I often think out loud while working through a problem."],
  ["d4","direct","I will challenge an idea when I think it will not work."],["a4","analytical","I like having a clear process before beginning a task."],["s4","supportive","People often come to me because I am approachable."],["e4","expressive","Stories and examples help me explain what I mean."],
  ["d5","direct","I become frustrated when a discussion does not lead to action."],["a5","analytical","I ask questions to make sure the information is correct."],["s5","supportive","I try to reduce tension when people disagree."],["e5","expressive","I enjoy encouraging people and building excitement."],
].map(([id,style,text]) => ({ id, style: style as StyleKey, text }));

const interactions = [
  ["Direct + Analytical", "Results combined with accuracy", "Rushing versus overanalyzing", "Agree on the necessary facts and a decision deadline"],
  ["Direct + Supportive", "Action combined with cooperation", "Direct may seem insensitive; Supportive may stay silent", "Direct slows down; Supportive states concerns clearly"],
  ["Direct + Expressive", "Energy, confidence, and fast action", "Competition, interruption, or impulsive decisions", "Assign roles and summarize the decision"],
  ["Analytical + Supportive", "Careful, dependable, considerate work", "The group may take too long to decide", "Set priorities and a firm decision time"],
  ["Analytical + Expressive", "Creative ideas supported by facts", "Unfocused ideas versus premature criticism", "Generate ideas first, then evaluate them"],
  ["Supportive + Expressive", "Positive relationships and team energy", "Difficult issues or details may be avoided", "Document responsibilities, deadlines, and next steps"],
  ["Same-style pair", "Quick mutual understanding", "Shared blind spots become stronger", "Invite a different perspective"],
];

const behaviorModes = [
  ["Passive", "Avoids conflict and does not clearly express needs or boundaries.", "“It’s fine. Whatever you want.”"],
  ["Aggressive", "Expresses needs forcefully while dismissing or disrespecting others.", "“Do it my way. Your idea makes no sense.”"],
  ["Passive-aggressive", "Avoids direct discussion but expresses anger through sarcasm, silence, delay, or resistance.", "“Sure, I’ll get right on that.” Then intentionally delays."],
  ["Assertive", "Communicates needs, opinions, and boundaries clearly while respecting others.", "“I see the deadline differently. Can we review the priorities?”"],
];

const behaviorLabels: Record<BehaviorKey,{name:string;description:string;color:string}> = {
  passive:{name:"Passive",description:"You may hold back needs, concerns, or boundaries to avoid conflict.",color:"#68879b"},
  aggressive:{name:"Aggressive",description:"Under pressure, you may push your position without leaving enough room for others.",color:"#c74651"},
  passiveAggressive:{name:"Passive-aggressive",description:"You may avoid direct disagreement while showing frustration indirectly.",color:"#9b6989"},
  assertive:{name:"Assertive",description:"You tend to state needs and boundaries clearly while respecting other people.",color:"#4e9b70"},
};

const behaviorQuestions: Array<{id:string;behavior:BehaviorKey;text:string}> = [
  ["p1","passive","I stay quiet even when something is bothering me."],["g1","aggressive","When I am frustrated, my tone can become forceful or demanding."],["pa1","passiveAggressive","I may use sarcasm instead of saying directly what is wrong."],["as1","assertive","I can state what I need without insulting or blaming someone."],
  ["p2","passive","I agree to requests even when I want or need to say no."],["g2","aggressive","I may interrupt because I want my point heard immediately."],["pa2","passiveAggressive","I sometimes delay a task when I disagree but do not say so."],["as2","assertive","I describe the facts, explain the effect, and request a reasonable next step."],
  ["p3","passive","I avoid giving feedback because I worry the person will be upset."],["g3","aggressive","I focus on winning the disagreement more than solving the problem."],["pa3","passiveAggressive","I may withdraw, become silent, or act distant when I am angry."],["as3","assertive","I can disagree calmly and listen to the other person’s response."],
  ["p4","passive","I let other people make decisions that affect me without speaking up."],["g4","aggressive","I may criticize the person instead of focusing only on the behavior."],["pa4","passiveAggressive","I sometimes say everything is fine when my actions show it is not."],["as4","assertive","I set boundaries respectfully and follow through on them."],
].map(([id,behavior,text])=>({id,behavior:behavior as BehaviorKey,text}));

const relationshipGuidance: Record<StyleKey,{easy:StyleKey;opposite:StyleKey;whyEasy:string;friction:string;steps:string[]}> = {
  direct:{easy:"expressive",opposite:"supportive",whyEasy:"Both styles often bring energy, confidence, and a willingness to move forward.",friction:"Your speed and bluntness may feel overwhelming to someone who values patience, inclusion, and harmony.",steps:["Slow the pace and invite their opinion before deciding.","Use a calm tone and acknowledge how the decision affects people.","Ask directly for concerns; do not treat silence as agreement.","Give them time to respond, then confirm the next step together."]},
  analytical:{easy:"supportive",opposite:"expressive",whyEasy:"Both styles often value listening, preparation, dependability, and thoughtful decisions.",friction:"Your need for detail may feel limiting to someone who thinks aloud, moves quickly among ideas, and focuses on possibilities.",steps:["Let them finish generating ideas before evaluating them.","Connect your facts to the larger goal, not only to possible problems.","Identify the two or three details that truly require confirmation.","End with a written summary, owner, and deadline."]},
  supportive:{easy:"analytical",opposite:"direct",whyEasy:"Both styles often prefer reliability, listening, steady progress, and lower-conflict teamwork.",friction:"Your desire for harmony may clash with someone who communicates quickly, challenges ideas, and expects concerns to be stated directly.",steps:["State your concern early and in one clear sentence.","Lead with the effect on the work, then make a specific request.","Do not agree merely to end the conversation.","Confirm the decision and your responsibility before leaving."]},
  expressive:{easy:"direct",opposite:"analytical",whyEasy:"Both styles often contribute energy, ideas, confidence, and momentum.",friction:"Your enthusiasm and thinking aloud may feel unfocused to someone who needs facts, structure, accuracy, and review time.",steps:["Present the main idea first, then provide the supporting facts.","Pause for questions and avoid interrupting their analysis.","Separate brainstorming time from decision time.","Document the agreed details, responsibilities, and deadline."]},
};

function score(answers: Record<string, number>) {
  return (Object.keys(styles) as StyleKey[]).map((key) => ({ key, total: questions.filter((q) => q.style === key).reduce((sum, q) => sum + (answers[q.id] || 0), 0) })).sort((a, b) => b.total - a.total);
}
function scoreBehavior(answers:Record<string,number>){return (Object.keys(behaviorLabels) as BehaviorKey[]).map((key)=>({key,total:behaviorQuestions.filter((q)=>q.behavior===key).reduce((sum,q)=>sum+(answers[q.id]||0),0)})).sort((a,b)=>b.total-a.total);}

export default function Home() {
  const [workbook, setWorkbook] = useState<Workbook>(emptyWorkbook);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState("academy");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const parsed=JSON.parse(saved); setWorkbook({...parsed,behaviorAnswers:parsed.behaviorAnswers||{}}); } } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(workbook)); }, [workbook, ready]);
  const results = useMemo(() => score(workbook.answers), [workbook.answers]);
  const behaviorResults = useMemo(() => scoreBehavior(workbook.behaviorAnswers), [workbook.behaviorAnswers]);
  const go = (id: string) => { setActive(id); requestAnimationFrame(() => document.getElementById("course")?.scrollIntoView({ behavior: "smooth" })); };
  const flash = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2800); };
  const update = (id: string, value: string) => setWorkbook((w) => ({ ...w, reflections: { ...w.reflections, [id]: value } }));
  const download = () => { const blob = new Blob([JSON.stringify(workbook, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "my-communication-workbook.json"; a.click(); URL.revokeObjectURL(url); flash("Anonymous workbook downloaded."); };
  const downloadSummary = () => {
    const complete = Object.keys(workbook.answers).length === questions.length;
    const primary = styles[results[0].key];
    const secondary = styles[results[1].key];
    const behaviorComplete=Object.keys(workbook.behaviorAnswers).length===behaviorQuestions.length;
    const behavior=behaviorLabels[behaviorResults[0].key];
    const relationship=relationshipGuidance[results[0].key];
    const easyStyle=styles[relationship.easy];
    const oppositeStyle=styles[relationship.opposite];
    const response = (id: string) => workbook.reflections[id]?.trim() || "Not yet answered";
    const lines = [
      "HOMES FOR THE BRAVE — COMMUNICATION SKILLS SUMMARY",
      "",
      `Assessment completed: ${Object.keys(workbook.answers).length} of ${questions.length} statements`,
      complete ? `Primary preference: ${primary.name}` : "Primary preference: Complete Module 2 to calculate",
      complete ? `Secondary preference: ${secondary.name}` : "Secondary preference: Complete Module 2 to calculate",
      behaviorComplete ? `Behavior under pressure: ${behaviorLabels[behaviorResults[0].key].name}` : "Behavior under pressure: Complete Part 2 of Module 2 to calculate",
      complete ? `Strengths to use: ${primary.strengths.join(", ")}; ${secondary.strengths.join(", ")}` : "",
      complete ? `Watch-outs to manage: ${primary.watch.join(", ")}; ${secondary.watch.join(", ")}` : "",
      complete ? `Likely easier initial fit: ${easyStyle.name} — ${relationship.whyEasy}` : "",
      complete ? `Most likely friction: ${oppositeStyle.name} — ${relationship.friction}` : "",
      complete ? `Ways to strengthen the opposite-style relationship: ${relationship.steps.join("; ")}` : "",
      "",
      "MULTIPLE-CHOICE ACTIVITY",
      response("foundation"),
      "",
      "ASSERTIVE MULTIPLE-CHOICE PRACTICE",
      `Unclear instructions: ${response("practice1")}`,
      `Equipment in work area: ${response("practice2")}`,
      `Corrective feedback: ${response("practice3")}`,
      `Possible lateness: ${response("practice4")}`,
      "",
      "BEHAVIOR SUMMARY",
      behaviorComplete ? `${behavior.name}: ${behavior.description}` : "Complete Part 2 of Module 2 to calculate.",
    ].filter(Boolean).join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "my-communication-summary.txt"; a.click();
    URL.revokeObjectURL(url); flash("Communication summary downloaded.");
  };
  const load = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { const data = JSON.parse(await file.text()); if (data.version !== 1 || !data.answers || !data.reflections) throw new Error(); setWorkbook({...data,behaviorAnswers:data.behaviorAnswers||{}}); flash("Workbook restored."); } catch { flash("That file is not a valid Communication Skills workbook."); } event.target.value = ""; };
  const reset = () => { if (window.confirm("Start fresh? This removes Communication Skills answers saved in this browser.")) { setWorkbook(emptyWorkbook); setActive("academy"); flash("Communication Skills workbook cleared."); } };
  if (!ready) return null;
  return <>
    <header className="brand-header"><div className="brand-inner"><BrandLogo size="header" /><div className="brand-copy"><p className="organization">Homes for the Brave</p><p className="academy">Vocational Services Academy</p><p className="course"><strong>Independent Learning Hub</strong><span>Work–Life Balance and Communication Skills</span></p></div><div className="header-actions"><div className="header-label">SELF-GUIDED<br/>JOB CLUB</div><button className="academy-link" onClick={() => go("academy")}><span aria-hidden="true">⌂</span> Academy Home</button></div></div></header>
    <main>{notice && <div className="toast" role="status">{notice}</div>}
      <nav className="academy-nav" aria-label="Main academy navigation"><button className={active === "academy" ? "active" : ""} onClick={() => go("academy")}><span>⌂</span> Academy Home</button><button onClick={() => { setActive("academy"); requestAnimationFrame(() => document.getElementById("work-life-track")?.scrollIntoView({ behavior:"smooth" })); }}><span>01</span> Work–Life Balance</button><button className={active !== "academy" ? "active" : ""} onClick={() => go("home")}><span>02</span> Communication Skills</button></nav>
      {active === "academy" ? <AcademyHome go={go} /> : <><section className="track-banner communication-banner"><span>LEARNING TRACK 02</span><div><strong>Communication Skills at Work</strong><p>Use the course menu below to move through the Communication Skills modules.</p></div><button onClick={() => go("academy")}>← Academy Home</button></section><section className="preview-note"><strong>Independent Learning Course:</strong> Work through the modules alone or with a Vocational Services facilitator.</section>
      {!workbook.acknowledged ? <section className="disclaimer"><h1>Before You Begin</h1><p><strong>This course is designed for education, employment preparation, and personal growth.</strong></p><p>The activities help participants recognize communication habits, understand workplace differences, practice assertiveness, and choose practical strategies.</p><h2>This course is not:</h2><ul><li>A psychological or personality evaluation</li><li>A medical or mental-health assessment</li><li>A clinical screening or diagnosis</li><li>A substitute for professional counseling or emergency services</li></ul><p>There are no perfect communication styles and no right or wrong assessment results. Your scores are a starting point for reflection—not a permanent label.</p><label className="ack"><input type="checkbox" onChange={(e) => e.target.checked && setWorkbook((w) => ({ ...w, acknowledged: true }))} /> I understand that this is an educational program and not a clinical evaluation or diagnosis.</label></section> : <>
        <section className="anonymous"><strong>Anonymous workbook:</strong> This course does not request your name, email, phone number, or other identifying information. Answers stay in this browser unless you download your own backup.</section>
        <aside className="mobile-nav-help" aria-label="Mobile course navigation instructions"><strong>Using a phone or tablet?</strong><span>Swipe the course menu <b>from right to left</b> to reveal later modules. Swipe it back to the right to return to earlier modules.</span><span className="swipe-cue" aria-hidden="true">← SLIDE MENU →</span></aside>
        <div className="module-nav-wrap"><nav className="module-nav" aria-label="Course modules">{[["home","Course Home"],["foundation","1. Two Frameworks"],["assessment","2. My Two-Part Assessment"],["profiles","3. Style Profiles"],["interactions","4. Working Together"],["practice","5. Assertive Practice"],["plan","My Style Summary"]].map(([id,label]) => <button key={id} className={active === id ? "active" : ""} onClick={() => go(id)}>{label}</button>)}</nav><span className="nav-edge-cue" aria-hidden="true">›</span></div>
        <div id="course">{active === "home" && <CourseHome go={go} answered={Object.keys(workbook.answers).length+Object.keys(workbook.behaviorAnswers).length} />}{active === "foundation" && <Foundation workbook={workbook} update={update} />}{active === "assessment" && <Assessment workbook={workbook} setWorkbook={setWorkbook} results={results} behaviorResults={behaviorResults} />}{active === "profiles" && <Profiles />}{active === "interactions" && <Interactions />}{active === "practice" && <Practice workbook={workbook} update={update} />}{active === "plan" && <ActionPlan workbook={workbook} results={results} behaviorResults={behaviorResults} downloadSummary={downloadSummary} />}<CoursePager active={active} go={go} /></div>
      </>}</>}
      <section className="workbook-tools global-workbook" aria-labelledby="workbook-title"><div className="workbook-copy"><p className="workbook-label">COURSE 002 · COMMUNICATION SKILLS</p><h2 id="workbook-title">Your anonymous workbook is stored in this browser</h2><p><strong>Return using this same device and the same browser:</strong> your answers load automatically. You do not need to click a Load button.</p><div className="storage-explainer"><div><strong>1. Automatic browser storage</strong><span>Your course answers stay in the browser where you originally completed the course.</span></div><div><strong>2. Download a backup file</strong><span>Use this only to protect your work or move it to another device or browser.</span></div><div><strong>3. Load a backup file</strong><span>Select a previously downloaded workbook file. A printed or PDF summary cannot be loaded back into the course.</span></div></div><div className="workbook-status"><span>✓ No name or email required</span><span>✓ Not submitted to Homes for the Brave</span><span>✓ You control any backup file</span></div></div><div className="tool-buttons"><button onClick={download}>Download Backup File</button><button onClick={() => fileRef.current?.click()}>Load Backup File</button><button className="danger" onClick={reset}>Start Fresh</button></div><input ref={fileRef} type="file" accept="application/json" hidden onChange={load} /></section>
    </main><footer><button className="footer-home" onClick={() => go("academy")}>⌂ Return to Academy Home</button><span>Homes for the Brave Vocational Services Academy • Independent Learning Hub</span></footer>
  </>;
}

function AcademyHome({ go }: { go: (id:string) => void }) {
  const balanceModules = [
    ["MODULE 1","Finding Your Balance","Assess your current balance, identify your priorities, and create a personal vision.","/work-life/module-1.html"],
    ["MODULE 2","Taking Control of Your Time","Identify time thieves and create a realistic weekly plan.","/work-life/module-2.html"],
    ["MODULE 3","Managing Stress Before It Manages You","Recognize stress, choose healthy coping tools, and strengthen your support network.","/work-life/module-3.html"],
    ["ACTION PLAN","My Personal Progress & Action Plan","Bring your priorities, challenges, coping tools, goals, and next steps into one summary.","/work-life/personal-progress.html"],
  ];
  const communicationModules = [
    ["foundation","MODULE 1","Two Communication Frameworks","Separate behavior during conflict from your everyday communication preference."],
    ["assessment","MODULE 2","My Behavioral & Communication Assessment","Complete two questionnaires covering communication preferences and behavior under pressure."],
    ["profiles","MODULE 3","Understand the Four Preferences","Learn the strengths, challenges, and workplace needs of each style."],
    ["interactions","MODULE 4","How Different Styles Work Together","Explore common benefits, friction points, and useful adjustments."],
    ["practice","MODULE 5","Practice Assertive Communication","Turn passive, aggressive, and passive-aggressive responses into professional messages."],
    ["plan","SUMMARY","My Behavioral & Communication Style Summary","See your two results, likely relationship fits, friction points, and adaptation strategies."],
  ];
  return <section id="course" className="academy-home"><div className="academy-hero"><div><p className="eyebrow">Homes for the Brave · Vocational Services Academy</p><h1>Build the life skills that support <em>workplace success.</em></h1><p>Choose a learning track below. Work–Life Balance focuses on priorities, time, and stress. Communication Skills focuses on workplace styles, collaboration, and assertive responses.</p><div className="hero-actions"><a href="#work-life-track">Explore Work–Life Balance</a><button onClick={() => go("home")}>Start Communication Skills</button></div></div><BrandLogo size="hero" /></div>
  <div className="track-divider"><span>CHOOSE YOUR LEARNING TRACK</span></div>
  <section id="work-life-track" className="learning-track balance-track"><header className="track-heading"><div className="track-number">01</div><div><p>COURSE 001</p><h2>Finding Work–Life Balance</h2><span>Personal stability, time management, stress awareness, and practical planning.</span></div><BrandLogo size="small" /></header><div className="track-module-grid">{balanceModules.map(([tag,title,text,href],i)=><article key={title}><div className="module-index">{String(i+1).padStart(2,"0")}</div><small>{tag}</small><h3>{title}</h3><p>{text}</p><a href={href}>Open {tag === "ACTION PLAN" ? "My Action Plan" : tag} <span>↗</span></a></article>)}</div></section>
  <section className="learning-track communication-track"><header className="track-heading"><div className="track-number">02</div><div><p>COURSE 002</p><h2>Communication Skills at Work</h2><span>Communication preferences, behavior under pressure, working relationships, assertiveness, and workplace practice.</span></div><BrandLogo size="small" /></header><div className="homepage-course-grid">{communicationModules.map(([id,tag,title,text],i)=><article key={id} className={id === "plan" ? "homepage-course-card summary" : "homepage-course-card"}><div className="home-card-top"><small>{tag}</small><b>{String(i+1).padStart(2,"0")}</b></div><h3>{title}</h3><p>{text}</p><button onClick={()=>go(id)}>Open {tag === "SUMMARY" ? "My Summary" : tag.replace("MODULE ","Module ")} <span>→</span></button></article>)}</div><div className="connected-course homepage-connected"><h3>One connected course</h3><p className="connected-intro">Start with Module 1 or open any module directly above. Previous and Next buttons at the bottom of every page guide you through the full course in order.</p><ul><li><strong>Two assessment results carry forward:</strong> Your communication preferences and your behavior-under-pressure result appear in the final summary.</li><li><strong>Relationship guidance is personalized:</strong> The summary identifies a likely easier fit, a likely friction pairing, and specific ways to work with the most opposite style.</li><li><strong>Progress loads automatically:</strong> Return on the same device and in the same browser; your saved answers reappear without loading a file.</li><li><strong>Backup files are optional:</strong> Download and Load are for backup or moving browsers—not for ordinary return visits.</li></ul><button onClick={() => go("foundation")}>Start with Module 1 <span>→</span></button></div></section>
  <section className="academy-help"><BrandLogo size="small" /><div><h2>How to navigate the Academy</h2><p>Use the large navigation bar at the top to return home or move directly to either learning track. On a phone, swipe horizontal course menus from right to left to reveal later modules.</p></div></section></section>;
}

function CourseHome({ go, answered }: { go: (id: string) => void; answered: number }) {
  const cards = [["foundation","MODULE 1","Two Communication Frameworks","Separate behavior during conflict from your everyday communication preference."],["assessment","MODULE 2","My Behavioral & Communication Assessment","Complete 36 rating statements across two assessment sections."],["profiles","MODULE 3","Understand the Four Preferences","Learn the strengths, challenges, and workplace needs of each style."],["interactions","MODULE 4","How Different Styles Work Together","Explore common benefits, friction points, and useful adjustments."],["practice","MODULE 5","Practice Assertive Communication","Turn passive, aggressive, and passive-aggressive responses into professional messages."],["plan","SUMMARY","My Behavioral & Communication Style Summary","Review both results, relationship tendencies, and strategies for opposite styles."]];
  return <section className="page-section"><div className="hero"><div className="hero-copy"><p className="eyebrow">Communication That Gets You Hired—and Helps You Keep the Job</p><h1>Understand your style. <em>Read the room.</em> Adjust without losing your message.</h1><p>Strong workplace communication is not about changing who you are. It is about recognizing what you naturally do, noticing what other people need, and choosing a respectful response.</p></div><div className="hero-side"><BrandLogo size="hero" /><div className="hero-badge"><strong>{answered}/36</strong><span>assessment statements completed</span></div></div></div><div className="section-kicker"><span>COURSE PATH</span><i /></div><div className="cards">{cards.map(([id,tag,title,text], index) => <article className={id === "plan" ? "module-card summary-card" : "module-card"} key={id}><div className="card-top"><span>{tag}</span><b>{String(index + 1).padStart(2,"0")}</b></div><h2>{title}</h2><p>{text}</p><button onClick={() => go(id)}>Open {tag === "SUMMARY" ? "My Summary" : tag.replace("MODULE ", "Module ")} <span aria-hidden="true">→</span></button></article>)}</div><div className="info-panel"><div className="panel-brand"><BrandLogo size="small" /></div><div><h2>How to use this course</h2><div className="info-grid"><p><strong>Learn:</strong> Read each short section and compare it with your workplace experiences.</p><p><strong>Assess:</strong> Rate both your everyday communication preferences and your behavior under pressure.</p><p><strong>Practice:</strong> Select the strongest assertive response for each workplace situation.</p><p><strong>Apply:</strong> Use the final relationship strategies with supervisors, coworkers, or customers.</p></div></div></div></section>;
}

function CoursePager({ active, go }: { active:string; go:(id:string)=>void }) {
  const steps=[
    ["home","Course Home"],
    ["foundation","Module 1: Two Frameworks"],
    ["assessment","Module 2: My Two-Part Assessment"],
    ["profiles","Module 3: Style Profiles"],
    ["interactions","Module 4: Working Together"],
    ["practice","Module 5: Assertive Practice"],
    ["plan","My Style & Relationship Summary"],
  ];
  const index=steps.findIndex(([id])=>id===active);
  if(index<0) return null;
  const previous=index>0?steps[index-1]:null;
  const next=index<steps.length-1?steps[index+1]:null;
  return <nav className="course-pager" aria-label="Previous and next Communication Skills pages">
    {previous?<button className="previous" onClick={()=>go(previous[0])}><span>← Previous</span><strong>{previous[1]}</strong></button>:<button className="previous" onClick={()=>go("academy")}><span>← Previous</span><strong>Academy Home</strong></button>}
    <div><span>COURSE 002</span><strong>{index+1} of {steps.length}</strong></div>
    {next?<button className="next" onClick={()=>go(next[0])}><span>Next →</span><strong>{next[1]}</strong></button>:<button className="next" onClick={()=>go("academy")}><span>Course complete →</span><strong>Return to Academy Home</strong></button>}
  </nav>;
}

function Foundation({ workbook, update }: { workbook: Workbook; update: (id: string, value: string) => void }) {
  const choices=[
    "I usually stay quiet or give in. I can improve by calmly stating what I need.",
    "I may become forceful or demanding. I can improve by lowering my tone and listening.",
    "I may show frustration indirectly. I can improve by saying the concern clearly and respectfully.",
    "I usually explain my needs clearly and respectfully while listening to the other person.",
  ];
  return <section className="page-section"><PageTitle number="01" title="Two Communication Frameworks" intro="A behavior style and a communication preference are related, but they are not the same thing." /><div className="framework-grid"><article><p className="eyebrow">Framework A</p><h2>Behavior during needs, boundaries, and conflict</h2><p>Passive, aggressive, passive-aggressive, and assertive describe what someone does in a particular situation. People may move between these behaviors depending on stress, confidence, and circumstances.</p><div className="mode-list">{behaviorModes.map(([name,description,example]) => <div key={name}><h3>{name}</h3><p>{description}</p><small>{example}</small></div>)}</div></article><article><p className="eyebrow">Framework B</p><h2>Everyday communication preferences</h2><p>Direct, analytical, supportive, and expressive describe how someone tends to share and receive information. Each preference has strengths and blind spots.</p><div className="preference-mini">{(Object.keys(styles) as StyleKey[]).map((key) => <div key={key} style={{ borderLeftColor: styles[key].color }}><strong>{styles[key].name}</strong><span>{styles[key].short}</span></div>)}</div><div className="callout"><strong>The workplace goal:</strong> Every preference can use assertive behavior—clear, calm, direct, and respectful.</div></article></div><ChoiceReflection id="foundation" label="When communication becomes difficult, which answer is most like you?" choices={choices} value={workbook.reflections.foundation || ""} onChange={(v) => update("foundation", v)} /></section>;
}

function Assessment({ workbook, setWorkbook, results, behaviorResults }: { workbook: Workbook; setWorkbook: React.Dispatch<React.SetStateAction<Workbook>>; results: ReturnType<typeof score>; behaviorResults:ReturnType<typeof scoreBehavior> }) {
  const communicationComplete=Object.keys(workbook.answers).length===questions.length;
  const behaviorComplete=Object.keys(workbook.behaviorAnswers).length===behaviorQuestions.length;
  const ratingRow=(id:string,text:string,index:number,value:number|undefined,onSelect:(n:number)=>void)=><div className="question-row" key={id}><p id={`${id}-label`}><span>{index+1}</span>{text}</p><div role="radiogroup" aria-labelledby={`${id}-label`}>{[1,2,3,4].map((n)=><label key={n}><input aria-label={`${n}`} type="radio" name={id} checked={value===n} onChange={()=>onSelect(n)} /><span>{n}</span></label>)}</div></div>;
  return <section className="page-section expanded-assessment"><PageTitle number="02" title="My Behavioral & Communication Assessment" intro="Complete both parts. Rate what you usually do—not what you think an employer wants to hear." />
    <div className="assessment-overview"><div><strong>{Object.keys(workbook.answers).length}/20</strong><span>Communication preference</span></div><div><strong>{Object.keys(workbook.behaviorAnswers).length}/16</strong><span>Behavior under pressure</span></div><div><strong>{Object.keys(workbook.answers).length+Object.keys(workbook.behaviorAnswers).length}/36</strong><span>Total assessment</span></div></div>
    <div className="scale"><span><strong>1</strong> Rarely</span><span><strong>2</strong> Sometimes</span><span><strong>3</strong> Often</span><span><strong>4</strong> Almost always</span></div>
    <section className="assessment-part"><div className="assessment-part-heading"><span>PART 1</span><div><h2>How I Usually Communicate</h2><p>Identifies Direct, Analytical, Supportive, and Expressive preferences.</p></div></div><div className="question-list">{questions.map((q,i)=>ratingRow(q.id,q.text,i,workbook.answers[q.id],(n)=>setWorkbook((w)=>({...w,answers:{...w.answers,[q.id]:n}}))))}</div><section className="results" aria-live="polite"><div><p className="eyebrow">Communication result</p><h2>{communicationComplete?`${styles[results[0].key].name} with ${styles[results[1].key].name} as a secondary preference`:`${Object.keys(workbook.answers).length} of 20 completed`}</h2><p>{communicationComplete?"This describes how you often share and receive information.":"Complete all Part 1 statements to calculate this result."}</p></div>{communicationComplete&&<div className="score-bars">{results.map((r)=><div key={r.key}><span>{styles[r.key].name}</span><div><i style={{width:`${(r.total/20)*100}%`,background:styles[r.key].color}} /></div><strong>{r.total}</strong></div>)}</div>}</section></section>
    <section className="assessment-part"><div className="assessment-part-heading"><span>PART 2</span><div><h2>What I Tend to Do Under Pressure</h2><p>Identifies Passive, Aggressive, Passive-aggressive, and Assertive behavior tendencies.</p></div></div><div className="assessment-caution"><strong>Context matters.</strong> People may behave differently depending on stress, safety, confidence, or the relationship. This result is a reflection—not a permanent label or diagnosis.</div><div className="question-list">{behaviorQuestions.map((q,i)=>ratingRow(q.id,q.text,i,workbook.behaviorAnswers[q.id],(n)=>setWorkbook((w)=>({...w,behaviorAnswers:{...w.behaviorAnswers,[q.id]:n}}))))}</div><section className="results behavior-results" aria-live="polite"><div><p className="eyebrow">Behavior result</p><h2>{behaviorComplete?behaviorLabels[behaviorResults[0].key].name:`${Object.keys(workbook.behaviorAnswers).length} of 16 completed`}</h2><p>{behaviorComplete?behaviorLabels[behaviorResults[0].key].description:"Complete all Part 2 statements to calculate this result."}</p></div>{behaviorComplete&&<div className="score-bars">{behaviorResults.map((r)=><div key={r.key}><span>{behaviorLabels[r.key].name}</span><div><i style={{width:`${(r.total/16)*100}%`,background:behaviorLabels[r.key].color}} /></div><strong>{r.total}</strong></div>)}</div>}</section></section>
  </section>;
}

function Profiles() { return <section className="page-section"><PageTitle number="03" title="Understand the Four Preferences" intro="None is automatically better. The advantage comes from knowing when a strength is helping—and when it is being overused." /><div className="profile-grid">{(Object.keys(styles) as StyleKey[]).map((key) => { const s=styles[key]; return <article key={key} style={{ borderTopColor:s.color }}><div className="profile-heading"><span style={{ background:s.color }}>{s.name.charAt(0)}</span><div><h2>{s.name}</h2><p>{s.short}</p></div></div><h3>Strengths</h3><ul>{s.strengths.map((x)=><li key={x}>{x}</li>)}</ul><h3>Possible challenges</h3><ul>{s.watch.map((x)=><li key={x}>{x}</li>)}</ul><h3>What this style may need</h3><ul>{s.needs.map((x)=><li key={x}>{x}</li>)}</ul></article>; })}</div><div className="callout large"><strong>Do not use style labels as excuses.</strong> “I’m direct” does not excuse disrespect. “I’m supportive” does not remove the responsibility to speak up. Each person remains responsible for professional behavior.</div></section>; }

function Interactions() { return <section className="page-section"><PageTitle number="04" title="How Different Styles Work Together" intro="Differences can create stronger teams—or unnecessary friction. The deciding factor is whether people adjust." /><div className="interaction-cards">{interactions.map(([pair,strength,problem,adjustment]) => <article key={pair}><h2>{pair}</h2><dl><div><dt>Potential strength</dt><dd>{strength}</dd></div><div><dt>Possible friction</dt><dd>{problem}</dd></div><div><dt>Best adjustment</dt><dd>{adjustment}</dd></div></dl></article>)}</div><section className="adapt"><h2>Fast adaptation guide</h2><p>When speaking with someone who appears…</p><div className="adapt-grid"><div><strong>Direct</strong><span>Lead with the bottom line. Be concise. Offer choices and deadlines.</span></div><div><strong>Analytical</strong><span>Bring facts. Explain the process. Allow reasonable review time.</span></div><div><strong>Supportive</strong><span>Use a calm tone. Ask for input. Explain how people will be affected.</span></div><div><strong>Expressive</strong><span>Allow ideas. Connect to the big picture. Confirm details in writing.</span></div></div></section></section>; }

function Practice({ workbook, update }: { workbook: Workbook; update: (id:string,value:string)=>void }) {
  const exercises=[
    {id:"practice1",situation:"A supervisor gives unclear instructions.",avoid:"Choose the most professional response.",choices:["Nobody told me how to do that.","I will just guess and hope it is right.","I may have misunderstood the instructions. Could you please explain the next step?","I am not doing it until someone shows me."]},
    {id:"practice2",situation:"A coworker keeps leaving equipment in your work area.",avoid:"Choose the most professional response.",choices:["I will move it and say nothing.","You are always leaving your stuff everywhere.","I will leave their equipment somewhere else so they understand.","The equipment in my work area makes it hard to complete my task safely. Could you please return it after use?"]},
    {id:"practice3",situation:"You receive corrective feedback about phone use.",avoid:"Choose the most professional response.",choices:["Everyone else uses their phone too.","I understand the concern. I will keep my phone put away during work time.","Fine. Whatever.","I will stop talking and ignore the supervisor."]},
    {id:"practice4",situation:"Transportation trouble may make you late.",avoid:"Choose the most professional response.",choices:["I will wait and explain after I arrive.","It is not my fault, so I do not need to call.","I am having transportation trouble and may be about 15 minutes late. I will update you if that changes.","I will ask a coworker to cover for me without telling the supervisor."]},
  ];
  return <section className="page-section"><PageTitle number="05" title="Practice Assertive Communication" intro="Select the response that is clear, respectful, and focused on the next step." /><div className="formula"><span>1</span><div><strong>State the situation</strong><p>Give the important facts without a long story.</p></div><span>2</span><div><strong>Explain the need or effect</strong><p>Be direct without attacking the other person.</p></div><span>3</span><div><strong>Request or confirm the next step</strong><p>Ask for a reasonable action and follow through.</p></div></div><div className="exercise-list">{exercises.map((exercise) => <article key={exercise.id}><h2>{exercise.situation}</h2><p className="hint">{exercise.avoid}</p><ChoiceReflection id={exercise.id} label="Select one answer:" choices={exercise.choices} value={workbook.reflections[exercise.id] || ""} onChange={(v)=>update(exercise.id,v)} /></article>)}</div></section>;
}

function ActionPlan({ workbook, results, behaviorResults, downloadSummary }: { workbook:Workbook; results:ReturnType<typeof score>; behaviorResults:ReturnType<typeof scoreBehavior>; downloadSummary:()=>void }) {
  const answerCount=Object.keys(workbook.answers).length;
  const communicationComplete=answerCount===questions.length;
  const behaviorCount=Object.keys(workbook.behaviorAnswers).length;
  const behaviorComplete=behaviorCount===behaviorQuestions.length;
  const primary=styles[results[0].key];
  const secondary=styles[results[1].key];
  const behavior=behaviorLabels[behaviorResults[0].key];
  const relationship=relationshipGuidance[results[0].key];
  const easyStyle=styles[relationship.easy];
  const oppositeStyle=styles[relationship.opposite];
  const reflectionIds=["foundation","practice1","practice2","practice3","practice4"];
  const practiceCount=reflectionIds.filter((id)=>workbook.reflections[id]?.trim()).length;
  const response=(id:string)=>workbook.reflections[id]?.trim();
  const practiceItems=[
    ["practice1","Unclear supervisor instructions"],
    ["practice2","Equipment left in the work area"],
    ["practice3","Corrective feedback about phone use"],
    ["practice4","Transportation trouble and possible lateness"],
  ];
  return <section className="page-section communication-summary"><PageTitle number="✓" title="My Behavioral & Communication Style Summary" intro="Your combined assessment results, likely relationship patterns, and practical strategies for working with different styles." />
    <div className="summary-actions"><button onClick={()=>window.print()}>Print or Save as PDF</button><button onClick={downloadSummary}>Download Summary</button></div>
    <div className="summary-metrics"><article><strong>{answerCount}/20</strong><span>communication statements</span></article><article><strong>{behaviorCount}/16</strong><span>behavior statements</span></article><article><strong>{answerCount+behaviorCount}/36</strong><span>total assessment</span></article><article><strong>{practiceCount}/5</strong><span>multiple-choice activities</span></article></div>
    <div className="dual-result"><article><p className="eyebrow">My communication preference</p>{communicationComplete?<><h2>{primary.name}</h2><p><strong>Secondary:</strong> {secondary.name}</p><p>{primary.short}. Your secondary preference also contributes {secondary.strengths[0].toLowerCase()}.</p></>:<><h2>Not complete</h2><p>Complete all 20 Part 1 statements in Module 2.</p></>}</article><article><p className="eyebrow">My behavior under pressure</p>{behaviorComplete?<><h2>{behavior.name}</h2><p>{behavior.description}</p>{behaviorResults[0].key!=="assertive"&&<p className="growth-note"><strong>Workplace growth target:</strong> Practice assertive behavior—clear, calm, direct, and respectful.</p>}</>:<><h2>Not complete</h2><p>Complete all 16 Part 2 statements in Module 2.</p></>}</article></div>
    {communicationComplete&&<><div className="summary-grid"><article><h2>Strengths I Can Use</h2><ul>{[...primary.strengths,...secondary.strengths].map((item)=><li key={item}>{item}</li>)}</ul></article><article><h2>Watch-Outs I Can Manage</h2><ul>{[...primary.watch,...secondary.watch].map((item)=><li key={item}>{item}</li>)}</ul></article></div><section className="relationship-summary"><div className="relationship-heading"><p className="eyebrow">Relationship tendencies</p><h2>Who may feel easier—and who may require more adjustment</h2><p>These are likely communication patterns, not predictions about whether two people will like each other. Trust, experience, culture, behavior, and the situation still matter.</p></div><div className="relationship-cards"><article className="easy-fit"><span>LIKELY EASIER INITIAL FIT</span><h3>{primary.name} + {easyStyle.name}</h3><p>{relationship.whyEasy}</p><strong>Shared advantage</strong><p>{easyStyle.strengths.join(", ")}.</p></article><article className="friction-fit"><span>MOST LIKELY FRICTION</span><h3>{primary.name} + {oppositeStyle.name}</h3><p>{relationship.friction}</p><strong>Important reminder</strong><p>Different does not mean incompatible. This pairing can become highly effective when both people adjust.</p></article></div><div className="opposite-plan"><h3>How I Can Strengthen a Relationship with a {oppositeStyle.name} Communicator</h3><ol>{relationship.steps.map((step,i)=><li key={step}><span>{i+1}</span>{step}</li>)}</ol><div className="opposite-needs"><strong>What a {oppositeStyle.name} communicator may need from me:</strong><p>{oppositeStyle.needs.join(" • ")}</p></div></div></section></>}
    {communicationComplete&&behaviorComplete&&<section className="combined-analysis"><p className="eyebrow">My complete results</p><h2>How My Behavior and Communication Style Work Together</h2><p>Your primary communication preference is <strong>{primary.name}</strong>, supported by your secondary <strong>{secondary.name}</strong> preference. Under pressure, your strongest reported behavior tendency is <strong>{behavior.name}</strong>.</p><p>{behaviorResults[0].key==="assertive"?"This combination suggests that you are generally able to use your natural communication strengths while stating needs and boundaries respectfully.":`When stress increases, your ${behavior.name.toLowerCase()} behavior may make the normal watch-outs of your ${primary.name} preference more noticeable. Your strongest improvement target is to pause and use assertive language before responding.`}</p><p>You may initially work most comfortably with a <strong>{easyStyle.name}</strong> communicator because {relationship.whyEasy.toLowerCase()} Your most challenging match may be a <strong>{oppositeStyle.name}</strong> communicator because {relationship.friction.toLowerCase()}</p><p><strong>What to do:</strong> {relationship.steps.join(" ")}</p></section>}
    <section className="submitted-summary"><h2>My Multiple-Choice Selections</h2><article><h3>How I tend to respond when communication becomes difficult</h3><p>{response("foundation")||"No answer selected yet."}</p></article><div className="submitted-grid">{practiceItems.map(([id,label])=><article key={id}><h3>{label}</h3><p>{response(id)||"No answer selected yet."}</p></article>)}</div></section>
    <div className="final-message"><strong>Clear communication means giving the right information, to the right person, at the right time, in a respectful way.</strong><p>The goal is not to erase your natural style. The goal is to use its strengths, manage its risks, and communicate assertively.</p></div></section>;
}

function BrandLogo({ size = "small" }: { size?: "small" | "header" | "hero" }) { return <img className={`brand-logo brand-logo-${size}`} src="/hftb-logo.png" alt="Homes for the Brave" />; }
function PageTitle({ number,title,intro }:{number:string;title:string;intro:string}) { return <header className="page-title"><span>{number}</span><div><p className="module-label">Homes for the Brave · Communication Skills</p><h1>{title}</h1><p>{intro}</p></div><BrandLogo size="small" /></header>; }
function ChoiceReflection({ id,label,choices,value,onChange }:{id:string;label:string;choices:string[];value:string;onChange:(v:string)=>void}) { return <fieldset className="choice-reflection"><legend>{label}</legend>{choices.map((choice,index)=><label key={choice} className={value===choice?"selected":""}><input type="radio" name={id} checked={value===choice} onChange={()=>onChange(choice)} /><span>{String.fromCharCode(65+index)}</span><b>{choice}</b></label>)}</fieldset>; }
