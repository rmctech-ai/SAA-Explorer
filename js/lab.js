/* SAA Architect Lab (built on the Well-Architected Review Board): you describe a workload in YAML, the reviewer applies
   rules from the six pillars and returns findings like the AWS Well-Architected Tool
   (HRI = high risk issue, MRI = medium risk issue, LRI = low), with a score per pillar. */
window.WAR = (function () {
  const PILLARS = [['ops', 'Operational Excellence'], ['sec', 'Security'], ['rel', 'Reliability'], ['perf', 'Performance Efficiency'], ['cost', 'Cost Optimization'], ['sus', 'Sustainability']];
  const COMPUTE = ['ec2', 'fargate', 'ecs', 'eks'];
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const T = v => v === true || v === 'true' || v === 'yes';
  const num = (v, d) => (v == null || v === '' || isNaN(+v)) ? d : +v;

  /* rule: [id, pillar, risk H/M/L, test(ctx) -> where-string | array | false, message, fix] */
  const RULES = [
    // ---------- Reliability ----------
    ['single-az', 'rel', 'H', c => c.comp.filter(x => COMPUTE.includes(x.type) && num(x.azs, 1) < 2).map(x => x.name), 'Compute runs in a single Availability Zone: one AZ outage takes the workload down.', 'Set azs: 2 (or 3) and spread instances behind a load balancer.'],
    ['no-autoscaling', 'rel', 'M', c => c.comp.filter(x => COMPUTE.includes(x.type) && !T(x.autoscaling)).map(x => x.name), 'Fixed capacity: you are guessing capacity instead of scaling with demand.', 'Set autoscaling: true (EC2 Auto Scaling / ECS service auto scaling).'],
    ['stateful-web', 'rel', 'M', c => c.comp.filter(x => COMPUTE.includes(x.type) && T(x.stateful)).map(x => x.name), 'Servers keep session state locally, so they are pets: you cannot replace or scale them freely.', 'Make the tier stateless (stateful: false) and keep sessions in ElastiCache or DynamoDB.'],
    ['no-lb', 'rel', 'H', c => c.comp.filter(x => COMPUTE.includes(x.type) && (num(x.azs, 1) > 1 || num(x.count, 1) > 1 || T(x.autoscaling)) && !c.has('alb') && !c.has('nlb')).map(x => x.name), 'Several instances but no load balancer: no health checks and no traffic distribution.', 'Add a component with type: alb in front of the tier.'],
    ['db-single-az', 'rel', 'H', c => c.comp.filter(x => ['rds', 'aurora'].includes(x.type) && !T(x.multi_az)).map(x => x.name), 'Database has one instance in one AZ: a single point of failure.', 'Set multi_az: true (RDS Multi-AZ, or Aurora with a replica in another AZ).'],
    ['no-backups', 'rel', 'H', c => c.comp.filter(x => ['rds', 'aurora', 'dynamodb', 'efs', 'ebs'].includes(x.type) && !T(x.backups)).map(x => x.name), 'No automated backups / point-in-time recovery for stored data.', 'Set backups: true (automated backups, PITR, or AWS Backup plans).'],
    ['tight-coupling', 'rel', 'M', c => c.links.filter(l => l.mode === 'sync' && (c.byName[l.to] || {}).role === 'worker').map(l => l.from + ' -> ' + l.to), 'A front end calls a slow background worker synchronously: one slow job blocks users and failures cascade.', 'Put a queue between them: add a component with type: sqs and link "web -> queue : async", "queue -> worker : async".'],
    ['no-dr', 'rel', 'M', c => (c.rel.dr || 'none') === 'none' && c.critical ? ['workload'] : false, 'A business-critical workload has no disaster recovery strategy.', 'Set reliability.dr to backup-restore, pilot-light, warm-standby or multi-site, matching your RTO/RPO.'],
    ['no-game-days', 'rel', 'L', c => !T(c.ops.game_days) && c.critical ? ['operations'] : false, 'Failure recovery has never been tested.', 'Set operations.game_days: true and run fault-injection experiments (AWS FIS).'],
    // ---------- Security ----------
    ['root-no-mfa', 'sec', 'H', c => !T(c.sec.root_mfa) ? ['account'] : false, 'The root user has no MFA.', 'Set security.root_mfa: true and stop using root for daily work.'],
    ['broad-iam', 'sec', 'H', c => !T(c.sec.least_privilege) ? ['iam'] : false, 'IAM permissions are broad (wildcards, AdministratorAccess on workloads).', 'Set security.least_privilege: true: scoped roles per component, no long-lived keys.'],
    ['no-trail', 'sec', 'H', c => !T(c.sec.cloudtrail) ? ['account'] : false, 'No CloudTrail: you cannot trace who did what.', 'Set security.cloudtrail: true (organization trail to a locked S3 bucket).'],
    ['unencrypted', 'sec', 'H', c => c.comp.filter(x => ['rds', 'aurora', 'dynamodb', 's3', 'ebs', 'efs'].includes(x.type) && !T(x.encrypted)).map(x => x.name), 'Data at rest is not encrypted.', 'Set encrypted: true (KMS) on every data store.'],
    ['public-bucket', 'sec', 'H', c => c.comp.filter(x => x.type === 's3' && T(x.public)).map(x => x.name), 'An S3 bucket is public.', 'Set public: false, enable Block Public Access, and serve content through CloudFront with origin access control.'],
    ['plain-http', 'sec', 'H', c => c.public && !T(c.sec.tls) ? ['edge'] : false, 'Traffic to users is not encrypted in transit.', 'Set security.tls: true (ACM certificate on the ALB / CloudFront).'],
    ['hardcoded-secrets', 'sec', 'H', c => (c.sec.secrets || 'hardcoded') === 'hardcoded' ? ['config'] : false, 'Secrets live in code or environment files.', 'Set security.secrets: secrets-manager (or parameter-store) with rotation.'],
    ['no-waf', 'sec', 'M', c => c.public && !T(c.sec.waf) ? ['edge'] : false, 'A public endpoint has no web application firewall.', 'Set security.waf: true (AWS WAF on CloudFront / ALB / API Gateway).'],
    ['no-detection', 'sec', 'M', c => !T(c.sec.guardduty) ? ['account'] : false, 'No threat detection running.', 'Set security.guardduty: true (and send findings to Security Hub).'],
    ['public-db', 'sec', 'H', c => c.comp.filter(x => ['rds', 'aurora'].includes(x.type) && T(x.public)).map(x => x.name), 'The database is reachable from the internet.', 'Set public: false: databases live in private subnets, reachable only from the app tier security group.'],
    // ---------- Operational Excellence ----------
    ['no-iac', 'ops', 'M', c => !T(c.ops.iac) ? ['operations'] : false, 'Infrastructure is built by hand (ClickOps).', 'Set operations.iac: true (CloudFormation / CDK / Terraform).'],
    ['manual-deploy', 'ops', 'M', c => ['manual', undefined, ''].includes(c.ops.deploy) ? ['operations'] : false, 'Deployments are manual and large.', 'Set operations.deploy: pipeline (or canary / blue-green) for small, frequent, reversible changes.'],
    ['no-monitoring', 'ops', 'H', c => !T(c.ops.monitoring) ? ['operations'] : false, 'No metrics, logs or dashboards: you find problems when customers do.', 'Set operations.monitoring: true (CloudWatch metrics, logs, X-Ray traces).'],
    ['no-alarms', 'ops', 'M', c => T(c.ops.monitoring) && !T(c.ops.alarms) ? ['operations'] : false, 'Metrics are collected but nobody is alerted.', 'Set operations.alarms: true (CloudWatch alarms → SNS / incident tooling).'],
    ['no-runbooks', 'ops', 'L', c => !T(c.ops.runbooks) ? ['operations'] : false, 'Operations knowledge lives in people\'s heads.', 'Set operations.runbooks: true (Systems Manager runbooks / documented procedures).'],
    // ---------- Performance Efficiency ----------
    ['no-cache', 'perf', 'M', c => c.read_heavy && !c.has('elasticache') && !c.has('dax') ? ['data'] : false, 'A read-heavy workload hits the database for every read.', 'Add a cache: a component with type: elasticache (or dax for DynamoDB).'],
    ['no-cdn', 'perf', 'M', c => c.public && c.global_users && !c.has('cloudfront') ? ['edge'] : false, 'Users around the world fetch content from one Region.', 'Add a component with type: cloudfront to cache content at edge locations.'],
    ['wrong-db', 'perf', 'M', c => c.comp.filter(x => ['rds', 'aurora'].includes(x.type) && x.access === 'key-value').map(x => x.name), 'Simple key-value access at high scale on a relational database.', 'Use a purpose-built database: type: dynamodb for key-value access.'],
    ['old-gen', 'perf', 'L', c => c.comp.filter(x => /^(t2|m4|c4|r4|m3|c3)\./.test(String(x.instance || ''))).map(x => x.name + ' (' + x.instance + ')'), 'Previous-generation instance types.', 'Move to current generation (for example m7g / c7g / t4g).'],
    // ---------- Cost Optimization ----------
    ['oversized', 'cost', 'M', c => c.comp.filter(x => x.cpu_avg != null && num(x.cpu_avg, 100) < 20).map(x => x.name + ' (' + x.cpu_avg + '% CPU)'), 'Resources are oversized: average CPU is very low.', 'Right-size (smaller instance) and use Compute Optimizer; then set cpu_avg to the new value (40+).'],
    ['on-demand-steady', 'cost', 'M', c => c.comp.filter(x => COMPUTE.concat(['rds', 'aurora']).includes(x.type) && T(x.steady) && (x.pricing || 'on-demand') === 'on-demand').map(x => x.name), 'Steady 24/7 usage is paid at On-Demand prices.', 'Set pricing: savings-plan (or reserved) for the steady baseline.'],
    ['spot-for-stateful', 'cost', 'M', c => c.comp.filter(x => x.pricing === 'spot' && (T(x.stateful) || x.role === 'database')).map(x => x.name), 'Spot capacity used for something that cannot tolerate interruption.', 'Use Spot only for fault-tolerant, stateless or batch work; use savings-plan for this one.'],
    ['no-budgets', 'cost', 'M', c => !T(c.cost.budgets) ? ['account'] : false, 'No budgets or cost alerts.', 'Set cost.budgets: true (AWS Budgets alerts + Cost Anomaly Detection).'],
    ['no-tags', 'cost', 'L', c => !T(c.cost.tagging) ? ['account'] : false, 'Resources are untagged, so cost cannot be attributed to teams or projects.', 'Set cost.tagging: true (cost allocation tags such as project / env / owner).'],
    ['idle-nonprod', 'cost', 'M', c => c.env !== 'prod' && !T(c.cost.schedule) ? ['workload'] : false, 'A non-production environment runs 24/7.', 'Set cost.schedule: true (stop dev/test outside working hours).'],
    // ---------- Sustainability ----------
    ['no-lifecycle', 'sus', 'L', c => c.comp.filter(x => x.type === 's3' && !T(x.lifecycle)).map(x => x.name), 'Data is kept forever in the hottest storage class.', 'Set lifecycle: true (move old objects to Glacier classes or expire them).'],
    ['no-graviton', 'sus', 'L', c => c.comp.filter(x => (COMPUTE.includes(x.type) || x.type === 'lambda') && !T(x.graviton)).map(x => x.name), 'Not using energy-efficient Graviton (Arm) processors where possible.', 'Set graviton: true (Arm-based instances / Lambda arm64).'],
    // ---------- SAA-specific patterns ----------
    ['nat-for-s3', 'cost', 'M', c => c.has('natgateway') && c.links.some(l => ['s3', 'dynamodb'].includes((c.byName[l.to] || {}).type)) && !c.comp.some(x => x.type === 'vpce' && x.endpoint === 'gateway') ? ['network'] : false, 'Private subnets reach S3/DynamoDB through a NAT gateway: you pay NAT data processing for traffic that could stay on the AWS network for free.', 'Add a gateway VPC endpoint: a component with type: vpce and endpoint: gateway.'],
    ['sqs-no-fifo', 'rel', 'M', c => T(c.w.ordering) ? c.comp.filter(x => x.type === 'sqs' && !T(x.fifo)).map(x => x.name) : false, 'The workload needs strict ordering / exactly-once processing, but the queue is a standard queue.', 'Set fifo: true on the queue (SQS FIFO).'],
    ['tight-queue-db', 'perf', 'M', c => T(c.w.spiky_writes) && !c.has('sqs') && !c.has('kinesis') ? ['data'] : false, 'Spiky write bursts hit the database directly.', 'Buffer writes with SQS (or Kinesis for streams) in front of the database.'],
    ['shared-files-ebs', 'rel', 'M', c => T(c.w.shared_files) ? c.comp.filter(x => x.type === 'ebs').map(x => x.name) : false, 'Several instances need the same files, but EBS volumes attach to one instance (in one AZ).', 'Use EFS (Linux, NFS) or FSx for Windows File Server (SMB) for shared file storage.'],
    ['no-hybrid-private', 'sec', 'M', c => T(c.w.on_prem) && !c.has('vpn') && !c.has('directconnect') ? ['network'] : false, 'On-premises systems connect over the public internet.', 'Add a Site-to-Site VPN (quick, encrypted) or Direct Connect (dedicated, consistent bandwidth).'],
    ['no-auth-users', 'sec', 'M', c => T(c.w.end_user_login) && !c.has('cognito') ? ['identity'] : false, 'The app signs users in with custom code.', 'Use Amazon Cognito user pools for sign-up/sign-in (and identity pools for temporary AWS credentials).'],
    ['dr-region', 'rel', 'H', c => num(c.w.rto_minutes, 1e9) < 60 && !['warm-standby', 'multi-site'].includes(c.rel.dr) ? ['workload'] : false, 'An RTO under an hour needs a running copy in another Region; backups or a pilot light are too slow.', 'Set reliability.dr: warm-standby (or multi-site for near-zero RTO).'],
    ['alb-for-tcp', 'perf', 'M', c => ['tcp', 'udp'].includes(String(c.w.protocol || '').toLowerCase()) && !c.has('nlb') && !c.has('globalaccelerator') ? c.comp.filter(x => x.type === 'alb').map(x => x.name).concat(c.has('alb') ? [] : ['edge']) : false, 'The workload speaks raw TCP/UDP (or needs static IPs / millions of requests per second), but the load balancer is an ALB, which only does HTTP/HTTPS.', 'Use type: nlb (Network Load Balancer, layer 4, static IP per AZ); add globalaccelerator for global static anycast IPs.'],
    ['analytics-on-oltp', 'perf', 'M', c => T(c.w.analytics) && !c.has('redshift') && !c.has('athena') ? ['data'] : false, 'Heavy reporting queries run against the production (OLTP) database and slow it down.', 'Move analytics to a warehouse (type: redshift) or query S3 with type: athena.'],
    ['on-demand-batch', 'cost', 'M', c => T(c.w.interruptible) ? c.comp.filter(x => x.role === 'worker' && COMPUTE.includes(x.type) && x.pricing !== 'spot').map(x => x.name) : false, 'Fault-tolerant batch work runs on On-Demand capacity.', 'Set pricing: spot on the worker (up to 90% cheaper; jobs can be retried).'],
    ['always-on-batch', 'sus', 'L', c => c.comp.filter(x => x.role === 'worker' && COMPUTE.includes(x.type) && !T(x.autoscaling)).map(x => x.name), 'Batch workers sit idle waiting for work.', 'Run workers as lambda (or scale them on queue depth with autoscaling: true).']
  ];

  function ctx(a) {
    const comps = isObj(a.components) ? a.components : {};
    const comp = Object.entries(comps).map(([name, v]) => Object.assign({ name }, isObj(v) ? v : {}));
    comp.forEach(x => { x.type = String(x.type || '').toLowerCase(); });
    const byName = {}; comp.forEach(x => byName[x.name] = x);
    const links = (Array.isArray(a.links) ? a.links : []).map(s => { if (isObj(s)) { const k = Object.keys(s)[0]; s = k + ' : ' + s[k]; } const m = String(s).match(/^\s*([\w-]+)\s*->\s*([\w-]+)\s*(?::\s*(\w+))?/); return m ? { from: m[1], to: m[2], mode: (m[3] || 'sync').toLowerCase() } : null; }).filter(Boolean);
    const w = isObj(a.workload) ? a.workload : {};
    return {
      comp, byName, links, w,
      has: t => comp.some(x => x.type === t),
      env: String(w.env || 'prod'), critical: T(w.critical), public: w.public === undefined ? true : T(w.public),
      global_users: T(w.global_users), read_heavy: T(w.read_heavy),
      ops: isObj(a.operations) ? a.operations : {}, sec: isObj(a.security) ? a.security : {},
      cost: isObj(a.cost) ? a.cost : {}, rel: isObj(a.reliability) ? a.reliability : {}
    };
  }

  function review(text) {
    let a;
    try { a = YAML.parse(String(text)); } catch (e) { return { ok: false, error: 'YAML error: ' + e.message, findings: [], pillars: {} }; }
    if (!isObj(a)) return { ok: false, error: 'Describe the workload as a YAML mapping (workload:, components:, links:, operations:, security:, cost:).', findings: [], pillars: {} };
    if (!isObj(a.components) || !Object.keys(a.components).length) return { ok: false, error: 'Add at least one entry under components:', findings: [], pillars: {} };
    const c = ctx(a); const findings = [];
    const unknown = c.comp.filter(x => !TYPES.includes(x.type)).map(x => `${x.name} (type: ${x.type || '?'})`);
    if (unknown.length) return { ok: false, error: 'Unknown component type: ' + unknown.join(', ') + '. Known types: ' + TYPES.join(', '), findings: [], pillars: {} };
    const badLink = c.links.find(l => !c.byName[l.from] || !c.byName[l.to]);
    if (badLink) return { ok: false, error: `Link "${badLink.from} -> ${badLink.to}" names a component that doesn't exist`, findings: [], pillars: {} };
    for (const [id, pillar, risk, test, msg, fix] of RULES) {
      let w; try { w = test(c); } catch (e) { w = false; }
      if (w && (!Array.isArray(w) || w.length)) findings.push({ id, pillar, risk, msg, fix, where: [].concat(w) });
    }
    const pillars = {};
    PILLARS.forEach(([k, name]) => { const f = findings.filter(x => x.pillar === k); const s = Math.max(0, 100 - f.reduce((n, x) => n + (x.risk === 'H' ? 25 : x.risk === 'M' ? 12 : 5), 0)); pillars[k] = { name, score: s, H: f.filter(x => x.risk === 'H').length, M: f.filter(x => x.risk === 'M').length, L: f.filter(x => x.risk === 'L').length }; });
    const hri = findings.filter(x => x.risk === 'H').length, mri = findings.filter(x => x.risk === 'M').length;
    return { ok: true, arch: a, ctx: c, findings, pillars, hri, mri, has: id => findings.some(f => f.id === id), score: Math.round(PILLARS.reduce((n, [k]) => n + pillars[k].score, 0) / 6) };
  }
  const TYPES = ['ec2', 'fargate', 'ecs', 'eks', 'lambda', 'alb', 'nlb', 'apigw', 'cloudfront', 'globalaccelerator', 'rds', 'aurora', 'dynamodb', 'dax', 'elasticache', 'redshift', 'opensearch', 's3', 'ebs', 'efs', 'fsx', 'sqs', 'sns', 'eventbridge', 'stepfunctions', 'kinesis', 'route53', 'natgateway', 'vpce', 'transitgateway', 'vpn', 'directconnect', 'kms', 'waf', 'cognito', 'backup', 'batch', 'athena', 'glue', 'emr'];
  return { review, RULES, PILLARS, TYPES };
})();

window.LAB = (function () {
  const DEFAULT = `workload:
  name: raul-shop
  env: prod
  public: true

components:
  web:
    type: ec2
    instance: t2.large
    azs: 1
  db:
    type: rds
    multi_az: false

links:
  - web -> db : sync

operations:
  monitoring: false
security:
  root_mfa: true
cost:
  budgets: false
`;
  const RISK = { H: ['HRI', 'bad'], M: ['MRI', 'imp'], L: ['LRI', 'skip'] };
  function render(body, l, api) {
    const ch = l.challenge || {}; const esc = api.esc;
    const saved = api.drafts[l.id]; const text = saved != null ? saved : (ch.starter != null ? ch.starter : DEFAULT);
    body.innerHTML = `<div class="lab cfn"><div class="col"><div class="lh">WORKLOAD <span>YAML · describe the architecture</span></div><textarea id="labText" spellcheck="false">${esc(text)}</textarea></div>
      <div class="col"><div class="lh">ARCHITECT LAB</div>
        <div class="btnrow"><button class="btn" id="runBtn">▶ RUN REVIEW</button><button class="btn ghost" id="resetBtn">RESET</button><button class="btn ghost" id="refBtn">FIELDS</button></div>
        <div id="labOut" class="labout"><span class="cm">RUN REVIEW checks your design like an SAA exam grader and a Well-Architected reviewer: high risk issues (HRI), medium (MRI) and low (LRI), with a fix for each and a score per pillar. Press FIELDS to see every setting the reviewer understands.</span></div></div></div>` + api.taskBar(l);
    const ta = body.querySelector('#labText');
    ta.oninput = () => api.drafts[l.id] = ta.value;
    ta.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); const p = ta.selectionStart; ta.value = ta.value.slice(0, p) + '  ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 2; api.drafts[l.id] = ta.value; }
      else if (e.key === 'Enter') { const p = ta.selectionStart; const line = ta.value.slice(0, p).split('\n').pop(); let ind = (line.match(/^\s*/) || [''])[0]; if (/:\s*$/.test(line)) ind += '  '; e.preventDefault(); ta.value = ta.value.slice(0, p) + '\n' + ind + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 1 + ind.length; api.drafts[l.id] = ta.value; }
      e.stopPropagation(); };
    const out = body.querySelector('#labOut');
    body.querySelector('#refBtn').onclick = () => {
      out.innerHTML = `<div class="lh">COMPONENT TYPES</div><div class="tr skip">${WAR.TYPES.join(' · ')}</div>
<div class="lh" style="margin-top:6px">COMPONENT FIELDS</div><div class="tr skip">azs · autoscaling · stateful · instance · count · graviton · pricing (on-demand / savings-plan / reserved / spot) · steady · cpu_avg · role (web / worker / database) · multi_az · backups · encrypted · public · lifecycle · access (key-value / relational) · fifo (sqs) · endpoint: gateway / interface (vpce)</div>
<div class="lh" style="margin-top:6px">SECTIONS</div><div class="tr skip">workload: env · public · critical · global_users · read_heavy · ordering · spiky_writes · shared_files · on_prem · end_user_login · rto_minutes · protocol (http / tcp / udp) · analytics · interruptible</div><div class="tr skip">links: "a -> b : sync|async"</div><div class="tr skip">operations: iac · deploy (manual / pipeline / canary / blue-green) · monitoring · alarms · runbooks · game_days</div><div class="tr skip">security: root_mfa · least_privilege · cloudtrail · tls · waf · guardduty · secrets (hardcoded / secrets-manager / parameter-store)</div><div class="tr skip">cost: budgets · tagging · schedule</div><div class="tr skip">reliability: dr (none / backup-restore / pilot-light / warm-standby / multi-site)</div>`;
    };
    body.querySelector('#runBtn').onclick = () => {
      const r = WAR.review(ta.value);
      let h;
      if (!r.ok) h = `<div class="dec err">✕ ${esc(r.error)}</div>`;
      else {
        h = `<div class="dec ${r.hri ? 'deny' : 'allow'}">${r.hri ? '✕' : '✓'} ${r.hri} high risk · ${r.mri} medium risk · overall ${r.score}/100</div>`;
        h += `<div class="lh" style="margin:6px 0 2px">PILLARS</div>` + WAR.PILLARS.map(([k]) => { const p = r.pillars[k]; return `<div class="tr ${p.H ? 'bad' : p.M ? 'skip' : 'ok'}">${String(p.score).padStart(3)} ${esc(p.name)} ${p.H ? `· ${p.H} HRI` : ''}${p.M ? ` · ${p.M} MRI` : ''}${p.L ? ` · ${p.L} LRI` : ''}${!p.H && !p.M && !p.L ? ' ✓' : ''}</div>`; }).join('');
        if (r.findings.length) h += `<div class="lh" style="margin:6px 0 2px">FINDINGS</div>` + r.findings.sort((a, b) => 'HML'.indexOf(a.risk) - 'HML'.indexOf(b.risk)).map(f => `<div class="tr ${RISK[f.risk][1]}"><b>${RISK[f.risk][0]}</b> [${esc(f.id)}] ${esc(f.msg)} <span class="cm">(${esc(f.where.join(', '))})</span><br><i>→ ${esc(f.fix)}</i></div>`).join('');
        else h += `<div class="tr ok">No findings. An exam grader would accept this design (for the rules this lab knows).</div>`;
      }
      let checkMsg = '';
      if (ch.check) { let res; try { res = ch.check(r); } catch (e) { res = 'check error: ' + e.message; }
        if (res === true) { api.solve(l.id); checkMsg = `<div class="dec allow" style="margin-top:6px">✓ Challenge requirements met</div>`; }
        else checkMsg = `<div class="dec imp" style="margin-top:6px">Challenge: ${esc(typeof res === 'string' ? res : 'not met yet')}</div>`; }
      out.innerHTML = h + checkMsg;
    };
    body.querySelector('#resetBtn').onclick = () => { api.drafts[l.id] = null; render(body, l, api); };
  }
  return { render };
})();
