window.LESSONS = window.LESSONS || [];
/* ---- helpers shared by all lesson files ---- */
window.WAY = function (o, ind) {           /* tiny YAML dumper for lab starters */
  ind = ind || ''; let s = '';
  for (const k in o) { const v = o[k]; if (v === undefined || v === null) continue;
    if (Array.isArray(v)) s += `${ind}${k}:\n` + v.map(x => `${ind}  - "${x}"\n`).join('');
    else if (typeof v === 'object') s += `${ind}${k}:\n` + WAY(v, ind + '  ') + (ind ? '' : '\n');
    else s += `${ind}${k}: ${v}\n`; }
  return s;
};
/* the reference design every lab starts from: a three-tier web app done the SAA way */
window.WA_GOOD = () => ({
  workload: { name: 'raul-shop', env: 'prod', public: true, critical: true, global_users: true, read_heavy: true },
  components: {
    dns: { type: 'route53' }, cdn: { type: 'cloudfront' }, lb: { type: 'alb' },
    web: { type: 'ec2', role: 'web', instance: 'm7g.large', azs: 2, autoscaling: true, stateful: false, graviton: true, pricing: 'savings-plan', steady: true, cpu_avg: 45 },
    queue: { type: 'sqs' }, worker: { type: 'lambda', role: 'worker', graviton: true }, cache: { type: 'elasticache' },
    db: { type: 'aurora', role: 'database', multi_az: true, backups: true, encrypted: true, public: false },
    files: { type: 's3', encrypted: true, public: false, lifecycle: true }
  },
  links: ['dns -> cdn : sync', 'cdn -> lb : sync', 'lb -> web : sync', 'web -> cache : sync', 'web -> db : sync', 'web -> queue : async', 'queue -> worker : async', 'worker -> files : sync'],
  operations: { iac: true, deploy: 'pipeline', monitoring: true, alarms: true, runbooks: true, game_days: true },
  security: { root_mfa: true, least_privilege: true, cloudtrail: true, tls: true, waf: true, guardduty: true, secrets: 'secrets-manager' },
  cost: { budgets: true, tagging: true, schedule: true },
  reliability: { dr: 'warm-standby' }
});
/* WA_START(patch): the good design with parts changed. patch is {section: {key: value|null}} or a function(o) */
window.WA_START = function (patch) {
  const o = WA_GOOD();
  if (typeof patch === 'function') patch(o);
  else for (const sec in patch || {}) { const p = patch[sec]; if (Array.isArray(p)) { o[sec] = p; continue; }
    if (sec === 'components') { for (const n in p) { if (p[n] === null) delete o.components[n]; else o.components[n] = Object.assign({}, o.components[n] || {}, p[n]); for (const k in o.components[n] || {}) if (o.components[n][k] === null) delete o.components[n][k]; } }
    else { o[sec] = Object.assign({}, o[sec] || {}, p); for (const k in o[sec]) if (o[sec][k] === null) delete o[sec][k]; } }
  return WAY(o);
};
/* WAFIX(r, ids, extra): every id must be gone and the review must run */
window.WAFIX = function (r, ids, extra) {
  if (!r.ok) return 'the review must run: ' + r.error;
  const left = ids.filter(id => r.has(id));
  if (left.length) return 'still flagged: ' + left.join(', ') + ' (see the fix under each finding)';
  return extra ? extra(r) : true;
};
window.WA_COMP = (r, name) => (r.ctx && r.ctx.byName[name]) || null;
window.SAA_TYPE = (r, ...types) => r.ctx.comp.some(x => types.includes(x.type));

/* ============ 01 THE SOLUTIONS ARCHITECT ROLE & THE EXAM ============ */
LESSONS.push({
  id: 'sa-role', num: 1, cat: 'road', layer: 1, mins: 14,
  title: 'The Solutions Architect & SAA-C03', short: 'What an SA does, and what the exam tests',
  overview: `<p>A <b>Solutions Architect</b> turns a business problem into a cloud design that is secure, resilient, fast enough and affordable, then explains that design so engineers can build it and leaders can approve it.</p><p>The <b>AWS Certified Solutions Architect – Associate (SAA-C03)</b> exam checks exactly that judgement: 65 scenario questions in 130 minutes, scored 100–1000, pass at <b>720</b>. Its four domains are the course map: <b>Secure (30%)</b>, <b>Resilient (26%)</b>, <b>High-Performing (24%)</b> and <b>Cost-Optimized (20%)</b>.</p>`,
  hook: `<b>Secure, Resilient, Fast, Cheap: 30 · 26 · 24 · 20.</b> Every SAA question is one of those four with a business constraint attached.`,
  why: `The SAA is the most requested AWS certification in cloud job posts, and it is the bridge between your CCP and Solutions Architect, Cloud Security or IAM Engineer roles.`,
  scene: { type: 'graph', nodes: [
    { id: 'biz', x: 120, y: 120, icon: 'users', label: 'Business', sub: 'goals · budget · deadlines' },
    { id: 'sa', x: 470, y: 245, icon: 'user', label: 'Solutions Architect', sub: 'you' },
    { id: 'design', x: 820, y: 120, icon: 'blueprint', label: 'Design', sub: 'diagram + decisions' },
    { id: 'eng', x: 820, y: 380, icon: 'code', label: 'Engineers', sub: 'build it', at: 1 },
    { id: 'aws', x: 470, y: 420, icon: 'cloud', label: 'AWS', sub: '200+ services', at: 1 },
    { id: 'exam', x: 120, y: 380, icon: 'book', label: 'SAA-C03', sub: '65 Q · 130 min · 720', at: 2 }
  ], edges: [{ a: 'biz', b: 'sa' }, { a: 'sa', b: 'design' }, { a: 'design', b: 'eng', at: 1 }, { a: 'sa', b: 'aws', at: 1 }, { a: 'exam', b: 'sa', at: 2 }] },
  steps: [
    { t: 'What an SA actually does', sub: 'Requirements in, design out',
      body: `<p>An SA listens first. The business says <i>"our shop crashes every Black Friday and we lose sales"</i>. The SA turns that into <b>requirements</b>: handle 10× traffic, recover from an AZ failure, keep card data safe, stay under budget.</p><p>Then the SA picks services, draws the design, writes down <b>why</b> each choice was made, and hands it to engineers. Good SAs also say what they <b>didn't</b> choose and why.</p>`,
      analogy: `An SA is the <b>architect of a house</b>: the family describes how they live, the architect draws the plans, the builders build. The architect doesn't lay every brick, but knows how bricks behave.`,
      hook: `<b>Listen → requirements → design → explain.</b> The diagram is the last step, not the first.`,
      words: ['requirements', 'constraints', 'stakeholders', 'trade-off', 'design'],
      flow: { from: 'biz', to: 'sa', label: 'PROBLEM', detail: ['"site crashes on Black Friday"', '→ scale 10× · survive an AZ loss'], color: 'blue' }, focus: ['biz', 'sa'],
      cmds: [{ c: 'cat requirements.md', o: '- peak: 10x normal traffic (Black Friday)\n- availability: survive one AZ failure\n- data: card data never stored by us\n- budget: under $3,000/month\n- team: 2 developers, no ops staff', k: 'arch' }] },
    { t: 'Functional vs non-functional', sub: 'What it does vs how well',
      body: `<p><b>Functional requirements</b> say what the system does: "customers can check out". <b>Non-functional requirements</b> say how well: availability, latency, security, cost, compliance. SAA questions are almost all about non-functional requirements.</p><p>The words to listen for: <b>RTO/RPO</b> (how fast to recover, how much data you may lose), <b>latency</b>, <b>throughput</b>, <b>compliance</b> (PCI, HIPAA, GDPR), and <b>operational overhead</b> (how much work for the team).</p>`,
      analogy: `Functional = "the car drives". Non-functional = "0–100 in 6 seconds, five stars in crash tests, 5 L per 100 km".`,
      hook: `<b>The exam hides the real requirement in an adjective:</b> "most cost-effective", "least operational overhead", "highly available".`,
      words: ['functional', 'non-functional', 'RTO', 'RPO', 'latency', 'operational overhead'],
      flow: { from: 'sa', to: 'aws', label: 'MAP', detail: ['survive AZ loss → Multi-AZ', 'no ops staff → managed / serverless'], color: 'purple' }, focus: ['sa', 'aws'],
      cmds: [{ c: '# non-functional → AWS building blocks', o: 'survive AZ failure      → Multi-AZ, ALB, Auto Scaling\nRTO 15 min, other Region → warm standby\n10x spikes              → Auto Scaling, SQS buffer\nno ops staff            → Lambda, Fargate, Aurora Serverless\nlowest cost             → right-size, Savings Plans, Spot', k: 'arch' }] },
    { t: 'The SAA-C03 exam', sub: '65 questions · 130 minutes · 720 to pass',
      body: `<p><b>Format:</b> 65 questions (50 scored, 15 unscored), multiple choice and multiple response, 130 minutes, scaled score 100–1000, pass at 720. No prerequisite, but AWS recommends about a year of hands-on design experience. Price: 150 USD. Valid for 3 years.</p><p><b>Domains:</b> 1 Design Secure Architectures 30% · 2 Design Resilient Architectures 26% · 3 Design High-Performing Architectures 24% · 4 Design Cost-Optimized Architectures 20%. The exam is built on the <b>Well-Architected Framework</b>.</p>`,
      analogy: `The exam is a <b>driving test in traffic</b>, not a theory quiz: every question is a road situation and you pick the safest, cheapest route.`,
      hook: `<b>65 · 130 · 720.</b> About 2 minutes per question. Flag the long ones and come back.`,
      words: ['SAA-C03', 'scaled score', '720', 'multiple response', 'domains'],
      flow: { from: 'exam', to: 'sa', label: 'TEST', detail: ['Secure 30% · Resilient 26%', 'High-Performing 24% · Cost 20%'], color: 'amber' }, focus: ['exam'],
      cloud: `Check the current exam guide on aws.amazon.com/certification before booking: AWS updates exam versions, and the guide lists in-scope services.`,
      cmds: [{ c: '# SAA-C03 domain weights', o: 'Domain 1  Design Secure Architectures          30%\nDomain 2  Design Resilient Architectures        26%\nDomain 3  Design High-Performing Architectures  24%\nDomain 4  Design Cost-Optimized Architectures   20%', k: 'exam' }] },
    { t: 'CCP vs SAA', sub: 'From "what is it" to "which one and why"',
      body: `<p>The CCP asks <i>what</i> a service is: "Which service is a managed relational database?" → RDS. The SAA asks <i>which</i> service fits a situation and <b>why the others don't</b>: "Reads are slow, writes are fine, the app can't change much" → add <b>RDS read replicas</b>, not a bigger instance, not DynamoDB.</p><p>So you study by <b>comparison</b>: SQS vs SNS vs EventBridge, ALB vs NLB, EFS vs FSx vs EBS, Multi-AZ vs read replica.</p>`,
      analogy: `CCP is knowing the names of all the tools in the box. SAA is knowing which one to grab when the pipe bursts.`,
      hook: `<b>Study in pairs:</b> for every service, learn its closest look-alike and the one word that separates them.`,
      words: ['comparison', 'read replica', 'Multi-AZ', 'look-alike services'],
      flow: { from: 'sa', to: 'design', label: 'CHOOSE', detail: ['Multi-AZ = availability', 'read replica = read scaling'], color: 'green' }, focus: ['design'],
      cmds: [{ c: '# look-alikes the SAA loves', o: 'Multi-AZ      vs read replica   → availability vs read scaling\nALB           vs NLB            → HTTP routing vs TCP/UDP, static IP\nSQS           vs SNS            → queue (pull) vs fan-out (push)\nEFS           vs EBS            → shared NFS vs one-instance block\nCloudFront    vs Global Accel.  → caches content vs routes TCP/UDP\nGateway VPCE  vs Interface VPCE → S3/DynamoDB free vs ENI, hourly', k: 'exam' }] },
    { t: 'Your first design review', sub: 'Hands-on in the Architect Lab',
      body: `<p>Every lesson ends in the <b>Architect Lab</b>. You describe a design in YAML (components, links, settings) and press RUN REVIEW. The lab grades it like an exam grader plus a Well-Architected reviewer: high risk issues (HRI), medium (MRI) and low (LRI), each with a fix.</p><p>Your first job: the shop runs on <b>one EC2 instance in one AZ</b> with a <b>single-AZ database</b>. That's exactly the Black Friday crash. Make it highly available.</p>`,
      analogy: `It's a flight simulator: crash the design here, so you don't crash it in production.`,
      hook: `<b>HA web tier = ALB + Auto Scaling group across 2+ AZs + Multi-AZ database.</b> The most common correct answer on the exam.`,
      words: ['high availability', 'ALB', 'Auto Scaling', 'Multi-AZ', 'HRI'],
      flow: { from: 'design', to: 'eng', label: 'HANDOFF', detail: ['ALB → ASG (2 AZs) → Aurora Multi-AZ'], color: 'teal' }, focus: ['design', 'eng'],
      cmds: [{ c: 'aws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[].[AutoScalingGroupName,AvailabilityZones]"', o: '[\n  [ "raul-shop-web", [ "us-east-1a", "us-east-1b" ] ]\n]', k: 'cli' }] }
  ],
  summary: { title: 'You know what an SA does', sub: 'Requirements → design → explain', text: `<p>A Solutions Architect turns business problems into designs and explains the trade-offs. SAA-C03 tests that with 65 scenario questions (130 min, 720 to pass) across Secure 30%, Resilient 26%, High-Performing 24% and Cost-Optimized 20%. Study by comparing look-alike services, and always read for the non-functional requirement.</p>` },
  quiz: [
    { q: 'What score do you need to pass SAA-C03?', a: ['700', '720', '750', '800'], c: 1, why: 'The scaled pass mark is 720 out of 1000.' },
    { q: 'Which SAA-C03 domain has the largest weight?', a: ['Design Resilient Architectures', 'Design Cost-Optimized Architectures', 'Design Secure Architectures', 'Design High-Performing Architectures'], c: 2, why: 'Secure is 30%, the biggest domain.' },
    { q: '"The system must survive the loss of one Availability Zone" is which kind of requirement?', a: ['Functional', 'Non-functional', 'Business goal only', 'Out of scope'], c: 1, why: 'Availability is a quality attribute, a non-functional requirement.' },
    { q: 'Which design is the classic answer for a highly available web tier?', a: ['One large EC2 instance with EBS snapshots', 'ALB + Auto Scaling group across multiple AZs', 'Two EC2 instances in the same AZ', 'An EC2 instance with an Elastic IP'], c: 1, why: 'ALB plus an ASG spread over AZs survives an AZ failure and scales.' }
  ],
  challenge: { task: 'Black Friday crash: the shop runs on one EC2 instance in one AZ with no load balancer, and a single-AZ database. Remove every high-risk reliability issue.',
    hint: 'web: azs: 2, autoscaling: true.  keep lb (type: alb) and link lb -> web.  db: multi_az: true',
    starter: WA_START(o => { delete o.components.lb; Object.assign(o.components.web, { azs: 1, autoscaling: false }); o.components.db.multi_az = false; o.links = o.links.filter(l => !/lb/.test(l)).concat(['cdn -> web : sync']); }),
    check: r => WAFIX(r, ['single-az', 'no-lb', 'db-single-az', 'no-autoscaling'], r => r.has('tight-coupling') ? 'keep the queue between web and worker' : true) },
  next: `Next: the <b>Master Solutions Architect roadmap</b>, everything beyond the exam: skills, certifications, soft skills and a portfolio.`,
  cheat: [['65 · 130 · 720', 'questions · minutes · pass'], ['30 / 26 / 24 / 20', 'secure / resilient / fast / cost'], ['non-functional', 'availability, latency, cost, compliance'], ['HA web tier', 'ALB + ASG multi-AZ + Multi-AZ DB'], ['Multi-AZ vs replica', 'availability vs read scaling'], ['study in pairs', 'service vs look-alike']]
});

/* ============ 02 THE MASTER SA ROADMAP ============ */
LESSONS.push({
  id: 'sa-roadmap', num: 2, cat: 'road', layer: 1, mins: 18,
  title: 'Roadmap to Master Solutions Architect', short: 'Certs, skills, soft skills, portfolio',
  overview: `<p>The SAA is a milestone, not the finish line. A <b>master Solutions Architect</b> combines four things: <b>breadth</b> (knows most services well enough to choose), <b>depth</b> in one or two areas (security, networking, data, AI), <b>business skills</b> (discovery, cost, communication) and <b>proof</b> (a portfolio of designs and decision records).</p><p>This lesson is your map, from your CCP today to Solutions Architect, Cloud Security or IAM Engineer roles, with the order to learn things in.</p>`,
  hook: `<b>T-shaped architect:</b> wide across services, deep in one area, and fluent in the business.`,
  why: `Hiring managers rarely ask "do you have the SAA?". They ask "walk me through a design you made and why". The roadmap gets you both the badge and the story.`,
  scene: { type: 'graph', nodes: [
    { id: 'ccp', x: 100, y: 400, icon: 'book', label: 'CCP', sub: 'CLF-C02 · foundations' },
    { id: 'saa', x: 300, y: 300, icon: 'blueprint', label: 'SAA-C03', sub: 'associate architect' },
    { id: 'job', x: 470, y: 400, icon: 'laptop', label: 'First cloud job', sub: 'support · ops · junior', at: 1 },
    { id: 'spec', x: 640, y: 230, icon: 'shield', label: 'Specialty', sub: 'Security · Networking', at: 2 },
    { id: 'sap', x: 820, y: 120, icon: 'cloud', label: 'SAP-C02', sub: 'professional', at: 2 },
    { id: 'soft', x: 300, y: 110, icon: 'users', label: 'Soft skills', sub: 'discovery · whiteboard', at: 3 },
    { id: 'port', x: 820, y: 400, icon: 'folder', label: 'Portfolio', sub: 'designs + ADRs', at: 4 }
  ], edges: [{ a: 'ccp', b: 'saa' }, { a: 'saa', b: 'job', at: 1 }, { a: 'job', b: 'spec', at: 2 }, { a: 'spec', b: 'sap', at: 2 }, { a: 'soft', b: 'saa', at: 3 }, { a: 'job', b: 'port', at: 4 }, { a: 'port', b: 'sap', at: 4 }] },
  steps: [
    { t: 'Stage 1: foundations (now)', sub: 'CCP, Linux, networking, Python',
      body: `<p>You are here. The <b>CCP</b> gives the vocabulary. Under it sit the skills every architect leans on: <b>Linux</b> (servers, permissions, logs), <b>networking</b> (IP, CIDR, DNS, HTTP, TLS), <b>Python</b> and <b>IAM</b>. Your Explorer courses cover exactly these.</p><p>Rule of thumb: you can't design a VPC you can't subnet on paper, and you can't secure an app whose HTTP flow you can't explain.</p>`,
      analogy: `Foundations are the <b>alphabet</b>. Architecture is writing essays. Nobody writes well while still spelling letter by letter.`,
      hook: `<b>CIDR on paper, DNS in your head, IAM policies by heart.</b>`,
      words: ['CCP', 'Linux', 'CIDR', 'DNS', 'IAM', 'Python'],
      flow: { from: 'ccp', to: 'saa', label: 'NEXT', detail: ['CCP (Dec 15) → SAA'], color: 'blue' }, focus: ['ccp'],
      cmds: [{ c: '# your foundation checklist', o: '[x] Linux Explorer        [x] Python Explorer\n[x] IAM Explorer          [x] VPC Explorer\n[ ] CCP CLF-C02 (Dec 15, 2026)\n[ ] SAA-C03 (this course)', k: 'arch' }] },
    { t: 'Stage 2: Associate + first job', sub: 'SAA, then real systems',
      body: `<p>Pass the <b>SAA-C03</b>, then get hands on real systems: cloud support, cloud operations, junior DevOps or a security analyst role. Real outages teach what no exam does: how things fail at 2 a.m.</p><p>While working, build the habit of asking <i>"why was it designed this way?"</i> and write down the answers. That's the start of your architect thinking.</p>`,
      analogy: `The SAA is the <b>learner's permit</b>; the first job is the hours behind the wheel.`,
      hook: `<b>Every incident is a free architecture lesson.</b> Write the postmortem even if nobody asks.`,
      words: ['SAA-C03', 'cloud support', 'operations', 'postmortem'],
      flow: { from: 'saa', to: 'job', label: 'APPLY', detail: ['cloud support / ops / junior DevOps'], color: 'green' }, focus: ['saa', 'job'],
      cmds: [{ c: '# associate-level certs that pair well with SAA', o: 'SOA-C03  CloudOps Engineer Associate (ops depth, formerly SysOps)\nDVA-C02  Developer Associate (serverless, CI/CD)\nSCS-C03  Security Specialty  (your security track)', k: 'exam' }] },
    { t: 'Stage 3: depth + Professional', sub: 'Pick a specialty, then SAP-C02',
      body: `<p>Choose depth that matches your goals. For you: <b>Security</b> (SCS-C03: IAM, KMS, detection, incident response), which leads to Cloud Security and IAM Engineer roles. Other paths: the ML Engineer Associate or the <b>Generative AI Developer – Professional</b> (AIP-C01), which fits your AI automation side hustle. (Advanced Networking ANS-C01 retires on 31 December 2026.)</p><p>Then the <b>Solutions Architect – Professional (SAP-C02)</b>: multi-account organizations, hybrid networking, migrations at scale, cost governance. It's long (75 questions, 180 minutes) and every question is a page of scenario.</p>`,
      analogy: `Specialty is your <b>medical specialization</b>; Professional is becoming the senior doctor who coordinates the whole case.`,
      hook: `<b>Associate = one workload. Professional = the whole organization.</b>`,
      words: ['SCS-C03', 'SAP-C02', 'AIP-C01', 'specialization', 'multi-account'],
      flow: { from: 'spec', to: 'sap', label: 'GROW', detail: ['SCS-C03 → SAP-C02'], color: 'purple' }, focus: ['spec', 'sap'],
      cloud: `Your ladder: CCP → cloud job → security / IAM / cloud security → AI automation side hustle → SAA → Solutions Architect / Cloud Security / IAM Engineer. The Security Journey, Cloud Security and IAM Explorers are your Specialty prep.`,
      cmds: [{ c: '# role ladder', o: 'Cloud Support / Ops   → Cloud Engineer → Solutions Architect\nSecurity Analyst      → Cloud Security Engineer → Security Architect\nIAM Analyst           → IAM Engineer → Identity Architect', k: 'arch' }] },
    { t: 'The soft skills that make a master', sub: 'Discovery, whiteboarding, trade-offs',
      body: `<p><b>Discovery:</b> ask before you design. "What happens if this is down for an hour? What does it cost per month today? Who has to approve?"</p><p><b>Whiteboarding:</b> draw users → edge → compute → data, left to right, and talk while you draw. <b>Trade-offs:</b> every choice gives something up, so say it out loud ("Aurora Global costs more but gives a 1-minute RTO"). <b>Writing:</b> a one-page design doc beats a 40-slide deck.</p>`,
      analogy: `A master SA is a <b>good doctor</b>: asks questions, explains the diagnosis in plain words, and tells you the side effects of the medicine.`,
      hook: `<b>Ask → draw → trade off → write it down.</b>`,
      words: ['discovery', 'whiteboarding', 'trade-off', 'design doc', 'stakeholders'],
      flow: { from: 'soft', to: 'saa', label: 'MULTIPLY', detail: ['skills × communication = impact'], color: 'amber' }, focus: ['soft'],
      cmds: [{ c: '# discovery questions to always ask', o: '1. Who are the users and where are they?\n2. What is the cost of one hour of downtime? (→ RTO)\n3. How much data can we afford to lose? (→ RPO)\n4. What compliance applies? (PCI, HIPAA, GDPR)\n5. What is the budget, and who owns it?\n6. Who runs this after go-live? (→ operational overhead)', k: 'arch' }] },
    { t: 'Architecture Decision Records', sub: 'Write down why',
      body: `<p>An <b>ADR</b> is a short note per important decision: <b>Context</b> (the situation), <b>Decision</b> (what we chose), <b>Alternatives</b> (what we didn't), <b>Consequences</b> (what we gain and give up). It keeps the team from re-arguing old decisions and shows reviewers your reasoning.</p><p>Your <b>portfolio</b> is 3–5 designs, each with a diagram, a cost estimate (AWS Pricing Calculator), a Well-Architected review and ADRs. Put them on GitHub next to your Explorer hub.</p>`,
      analogy: `ADRs are the <b>captain's log</b>: when someone asks "why did we turn left here?", the answer is written down.`,
      hook: `<b>Context · Decision · Alternatives · Consequences.</b> One page each.`,
      words: ['ADR', 'portfolio', 'Pricing Calculator', 'design doc', 'consequences'],
      flow: { from: 'job', to: 'port', label: 'PROVE', detail: ['diagram + cost + review + ADRs'], color: 'teal' }, focus: ['port'],
      cmds: [{ c: 'cat adr/0001-database.md', o: '# ADR 0001: Aurora PostgreSQL for orders\nContext: orders need SQL joins, 99.95% availability, RPO under 1 min.\nDecision: Aurora PostgreSQL, Multi-AZ, one reader.\nAlternatives: RDS PostgreSQL (slower failover), DynamoDB (no joins).\nConsequences: about 20% more cost than RDS; failover under 30 s.', k: 'arch' }] },
    { t: 'The 16-week SAA plan', sub: 'This course, week by week',
      body: `<p>Weeks 1–2: lessons 1–5 (role, roadmap, identity, networking, data protection). Weeks 3–5: lessons 6–7 (decoupling, HA and DR) plus hands-on labs in a free-tier account. Weeks 6–9: lessons 8–12 (compute, storage, databases, edge and hybrid, analytics). Week 10: lesson 13 (cost). Weeks 11–12: lessons 14–15 (exam technique, migration). Weeks 13–16: practice exams (Tutorials Dojo), review every wrong answer, capstone (lesson 16).</p><p>Book the exam when you score <b>80%+ on two full practice exams</b> in a row.</p>`,
      analogy: `It's a <b>training plan for a half marathon</b>: steady weeks, long runs (practice exams) near the end, and a taper before race day.`,
      hook: `<b>Book it at 80% twice.</b> Review wrong answers more than you take new tests.`,
      words: ['study plan', 'practice exams', 'free tier', 'review'],
      flow: { from: 'port', to: 'sap', label: 'MASTER', detail: ['SAA → experience → SAP'], color: 'pink' }, focus: ['sap', 'port'],
      cmds: [{ c: '# weekly rhythm', o: 'Mon-Thu  one lesson + its lab (45-60 min, night shift friendly)\nFri      AWS hands-on: build what you learned (free tier)\nSat      20 practice questions, review every explanation\nSun      rest / write one ADR for something you built', k: 'arch' }] }
  ],
  summary: { title: 'You have the roadmap', sub: 'CCP → SAA → job → Specialty → SAP', text: `<p>Foundations (CCP, Linux, networking, Python, IAM) → SAA-C03 → a first cloud job → a specialty (Security for you) → SAP-C02. Along the way, practice discovery, whiteboarding and trade-off talk, write ADRs, and build a portfolio of 3–5 reviewed designs with costs.</p>` },
  quiz: [
    { q: 'What are the four parts of an Architecture Decision Record?', a: ['Plan, Do, Check, Act', 'Context, Decision, Alternatives, Consequences', 'Who, What, When, Where', 'Cost, Risk, Time, Scope'], c: 1, why: 'Context, Decision, Alternatives and Consequences.' },
    { q: 'Which certification focuses on multi-account organizations, hybrid networks and migrations at scale?', a: ['SAA-C03', 'CLF-C02', 'SAP-C02', 'DVA-C02'], c: 2, why: 'Solutions Architect Professional covers organization-wide design.' },
    { q: 'Which question best uncovers the RTO during discovery?', a: ['Which programming language do you use?', 'What does one hour of downtime cost you?', 'How many developers do you have?', 'Do you like serverless?'], c: 1, why: 'The cost of downtime tells you how fast you must recover.' },
    { q: 'Which specialty matches a path to Cloud Security or IAM Engineer?', a: ['Data Engineer Associate', 'Machine Learning Engineer Associate', 'Security Specialty (SCS-C03)', 'Developer Associate'], c: 2, why: 'SCS-C03 covers IAM, KMS, detection and incident response.' }
  ],
  challenge: { task: 'Portfolio piece #1: a reviewer found high risk issues in your design. Bring it to zero HRIs (root without MFA, no CloudTrail, no monitoring, no backups).',
    hint: 'security: root_mfa: true, cloudtrail: true.  operations: monitoring: true.  db: backups: true',
    starter: WA_START({ security: { root_mfa: false, cloudtrail: false }, operations: { monitoring: false }, components: { db: { backups: false } } }),
    check: r => !r.ok ? 'the review must run: ' + r.error : r.hri ? `still ${r.hri} high risk issue(s): ` + r.findings.filter(f => f.risk === 'H').map(f => f.id).join(', ') : true },
  next: `Domain 1 begins: <b>multi-account strategy and identity</b>, Organizations, SCPs, Control Tower, Identity Center and Cognito.`,
  cheat: [['T-shaped', 'broad + one deep area'], ['CCP → SAA → SAP', 'cert path'], ['SCS-C03', 'security specialty'], ['ADR', 'context · decision · alternatives · consequences'], ['portfolio', 'diagram + cost + review + ADRs'], ['book at 80%', 'two practice exams in a row']]
});
