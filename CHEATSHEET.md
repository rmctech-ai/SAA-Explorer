# SAA Cheat Sheet

_Auto-generated from the SAA Explorer lessons. One master memory hook + the key commands per lesson._

## 01 · The Solutions Architect & SAA-C03

> ★ Secure, Resilient, Fast, Cheap: 30 · 26 · 24 · 20. Every SAA question is one of those four with a business constraint attached.

| Command | What it does |
|---|---|
| `65 · 130 · 720` | questions · minutes · pass |
| `30 / 26 / 24 / 20` | secure / resilient / fast / cost |
| `non-functional` | availability, latency, cost, compliance |
| `HA web tier` | ALB + ASG multi-AZ + Multi-AZ DB |
| `Multi-AZ vs replica` | availability vs read scaling |
| `study in pairs` | service vs look-alike |

**Memory hooks:**

- **What an SA actually does**: Listen → requirements → design → explain. The diagram is the last step, not the first.
- **Functional vs non-functional**: The exam hides the real requirement in an adjective: "most cost-effective", "least operational overhead", "highly available".
- **The SAA-C03 exam**: 65 · 130 · 720. About 2 minutes per question. Flag the long ones and come back.
- **CCP vs SAA**: Study in pairs: for every service, learn its closest look-alike and the one word that separates them.
- **Your first design review**: HA web tier = ALB + Auto Scaling group across 2+ AZs + Multi-AZ database. The most common correct answer on the exam.

## 02 · Roadmap to Master Solutions Architect

> ★ T-shaped architect: wide across services, deep in one area, and fluent in the business.

| Command | What it does |
|---|---|
| `T-shaped` | broad + one deep area |
| `CCP → SAA → SAP` | cert path |
| `SCS-C03` | security specialty |
| `ADR` | context · decision · alternatives · consequences |
| `portfolio` | diagram + cost + review + ADRs |
| `book at 80%` | two practice exams in a row |

**Memory hooks:**

- **Stage 1: foundations (now)**: CIDR on paper, DNS in your head, IAM policies by heart.
- **Stage 2: Associate + first job**: Every incident is a free architecture lesson. Write the postmortem even if nobody asks.
- **Stage 3: depth + Professional**: Associate = one workload. Professional = the whole organization.
- **The soft skills that make a master**: Ask → draw → trade off → write it down.
- **Architecture Decision Records**: Context · Decision · Alternatives · Consequences. One page each.
- **The 16-week SAA plan**: Book it at 80% twice. Review wrong answers more than you take new tests.

## 03 · Multi-Account Strategy & Identity

> ★ Workforce → Identity Center. Customers → Cognito. Services → IAM roles. Guardrails → SCPs.

| Command | What it does |
|---|---|
| `Organizations` | OUs + consolidated billing |
| `SCP` | max permissions, never grants |
| `Control Tower` | landing zone + controls |
| `Identity Center` | workforce SSO, permission sets |
| `AssumeRole` | trust policy + ExternalId |
| `Cognito` | user pool = login · identity pool = AWS creds |

**Memory hooks:**

- **Why many accounts?**: Account = blast radius. Separate prod, dev, logging and security.
- **Service control policies**: SCPs filter, they never grant. And they don't touch the management account.
- **Control Tower & the landing zone**: Control Tower = landing zone + controls + Account Factory.
- **Workforce identity: Identity Center**: People → Identity Center + permission sets. IAM users with access keys are the anti-pattern.
- **Cross-account roles**: Trust policy = who may assume. Permission policy = what they can do.
- **Customer identity: Cognito**: User pool = authentication (JWT). Identity pool = AWS credentials.

## 04 · Secure Network Design

> ★ Public: LB + NAT only. Private: app. Isolated: data. Endpoints keep AWS traffic off the internet.

| Command | What it does |
|---|---|
| `public / private / isolated` | LB+NAT / app / DB |
| `SG` | stateful · allow · ENI |
| `NACL` | stateless · deny · subnet |
| `NAT gateway` | outbound only, one per AZ |
| `gateway endpoint` | S3 + DynamoDB, free |
| `WAF / Shield` | layer 7 / DDoS |

**Memory hooks:**

- **Three-tier subnets**: A subnet is "public" only because its route table points to an internet gateway.
- **Security groups vs NACLs**: SG: stateful, allow-only, per ENI. NACL: stateless, allow + deny, per subnet, numbered.
- **NAT gateway**: One NAT gateway per AZ for HA. NAT instances are the old, self-managed way.
- **VPC endpoints**: Gateway endpoint: S3 + DynamoDB, free. Interface endpoint: ENI, paid, most services.
- **PrivateLink**: PrivateLink = NLB + endpoint service. Works with overlapping CIDRs.
- **WAF, Shield & Network Firewall**: WAF = layer 7 (SQLi, XSS, rate). Shield = DDoS. Network Firewall = inside the VPC.

## 05 · Data Protection

> ★ At rest → KMS. In transit → ACM/TLS. Secrets → Secrets Manager. Find PII → Macie.

| Command | What it does |
|---|---|
| `customer managed key` | policy, rotation, audit |
| `envelope encryption` | data key + KMS key |
| `SSE-S3 / SSE-KMS / SSE-C` | S3 encryption options |
| `Secrets Manager` | rotation |
| `ACM` | free TLS, us-east-1 for CloudFront |
| `Object Lock · Macie` | WORM · find PII |

**Memory hooks:**

- **KMS keys**: Need control, auditing or cross-account sharing → customer managed key.
- **Envelope encryption**: Data key encrypts data. KMS key encrypts the data key.
- **Secrets Manager vs Parameter Store**: Rotation needed → Secrets Manager. Plain config → Parameter Store.
- **Encryption in transit: ACM**: CloudFront certificate → us-east-1. Deny aws:SecureTransport false on buckets.
- **Lock down S3**: Private bucket + CloudFront OAC. WORM → Object Lock. Find PII → Macie.

## 06 · Decoupled Architectures

> ★ Queue = SQS. Fan-out = SNS. Route by content / SaaS events = EventBridge. Workflow = Step Functions. Stream + replay = Kinesis.

| Command | What it does |
|---|---|
| `SQS` | queue, pull, buffer |
| `FIFO` | order + exactly-once, .fifo |
| `DLQ` | maxReceiveCount failures |
| `SNS → SQS` | fan-out |
| `EventBridge` | rules, SaaS, schedules |
| `Kinesis` | stream, shards, replay |

**Memory hooks:**

- **SQS: the buffer**: Spiky load + "don't lose requests" → put SQS in front. Scale workers on queue depth.
- **Standard vs FIFO, and DLQs**: "Order matters" or "no duplicates" → FIFO. Poison messages → DLQ.
- **SNS: fan-out**: SNS → many SQS = fan-out. Push (SNS) vs pull (SQS).
- **EventBridge: event routing**: SaaS events, content-based rules, schedules → EventBridge.
- **Step Functions: orchestration**: Orchestration (one brain) = Step Functions. Choreography (events) = EventBridge/SNS.
- **Kinesis: real-time streams**: Real-time stream, multiple consumers, replay → Kinesis. Load into S3/Redshift with no code → Firehose.

## 07 · High Availability & Disaster Recovery

> ★ HA = survive an AZ, inside a Region. DR = survive a Region. RTO = time. RPO = data.

| Command | What it does |
|---|---|
| `RTO / RPO` | downtime / data loss |
| `ASG + ALB/NLB` | HA compute |
| `Multi-AZ vs read replica` | failover vs reads |
| `Route 53` | failover · latency · geo · weighted |
| `DR ladder` | backup → pilot → warm → multi-site |
| `AWS Backup + Vault Lock` | central, immutable |

**Memory hooks:**

- **RTO, RPO and the shared model**: RTO = time to recover. RPO = data you can lose. Both down → cost up.
- **ELB + Auto Scaling across AZs**: ALB = layer 7. NLB = layer 4 + static IP. GWLB = appliances.
- **Database HA: Multi-AZ vs read replicas**: Multi-AZ = sync standby, failover. Read replica = async, reads, cross-Region possible.
- **Route 53 routing policies**: Failover = DR. Latency = speed. Geolocation = law. Weighted = canary.
- **The four DR strategies**: Cheap & slow → expensive & instant: Backup · Pilot light · Warm standby · Multi-site.
- **AWS Backup**: Central, scheduled, cross-Region, immutable → AWS Backup + Vault Lock.

## 08 · Choosing Compute

> ★ More control ← EC2 · ECS/EKS on EC2 · Fargate · Lambda → less to manage.

| Command | What it does |
|---|---|
| `C / R / I / P-G / T / M` | compute / RAM / IOPS / GPU / burst / general |
| `cluster / spread / partition` | latency / isolation / big data |
| `ECS vs EKS` | AWS-native vs Kubernetes |
| `Fargate` | serverless containers |
| `Lambda` | 15 min, events |
| `Batch` | long jobs, Spot, queues |

**Memory hooks:**

- **EC2 families**: C = Compute, R = RAM, I = IOPS, P/G = GPU, T = Tiny burst, M = Middle.
- **Placement groups**: Low latency HPC → cluster. Few critical → spread. Big data (Kafka, Cassandra) → partition.
- **Containers: ECS, EKS, Fargate**: Kubernetes already → EKS. Simplest AWS-native → ECS. No servers → Fargate.
- **Lambda**: Event-driven + short + spiky → Lambda. Over 15 minutes → Fargate, ECS or Batch.
- **AWS Batch**: Long-running batch, retries, Spot, scale to zero → AWS Batch.
- **Elastic Beanstalk & choosing**: "Deploy quickly, developers don't want to manage infrastructure" → Beanstalk (or Fargate/Lambda if serverless).

## 09 · Storage Architecture

> ★ Block = one server's disk (EBS). File = shared folder (EFS/FSx). Object = bucket (S3).

| Command | What it does |
|---|---|
| `EBS` | block, one AZ, snapshots |
| `EFS` | shared NFS, Linux |
| `FSx Windows / Lustre` | SMB+AD / HPC |
| `Intelligent-Tiering` | unknown access |
| `Deep Archive` | cheapest, hours |
| `DataSync / Snowball` | online / offline bulk |

**Memory hooks:**

- **EBS: block storage**: gp3 default · io2 for IOPS · st1 throughput · sc1 cold. Instance store = ephemeral.
- **EFS: shared Linux files**: Shared + Linux + many AZs → EFS.
- **FSx family**: Windows/SMB/AD → FSx for Windows. HPC/ML speed → FSx for Lustre. NetApp → ONTAP.
- **S3 and its storage classes**: Unknown access → Intelligent-Tiering. Rarely read, ms access → Glacier Instant. Years, hours OK → Deep Archive.
- **Moving data in**: Hybrid access → Storage Gateway. Online bulk copy → DataSync. SFTP partners → Transfer Family. Slow network, PB → Snowball.

## 10 · Databases & Caching

> ★ SQL + joins → RDS/Aurora. Key-value at scale → DynamoDB. Hot reads → cache.

| Command | What it does |
|---|---|
| `Aurora` | 6 copies/3 AZs, 15 readers |
| `DynamoDB` | key-value, on-demand, global tables |
| `Neptune / DocumentDB` | graph / Mongo |
| `ElastiCache` | sessions, hot reads |
| `DAX` | DynamoDB microseconds |
| `RDS Proxy` | Lambda connection pooling |

**Memory hooks:**

- **RDS and Aurora**: Relational + highest performance/availability → Aurora. Specific engine (Oracle, SQL Server) → RDS.
- **DynamoDB**: Key-value + massive scale + serverless → DynamoDB. Unpredictable traffic → on-demand.
- **Purpose-built databases**: Graph → Neptune. Mongo → DocumentDB. Cassandra → Keyspaces. Time series → Timestream. Search → OpenSearch.
- **Caching**: Sessions, leaderboards, hot SQL results → ElastiCache. DynamoDB microseconds → DAX.
- **RDS Proxy & scaling reads**: Lambda + RDS "too many connections" → RDS Proxy.

## 11 · Edge & Hybrid Networking

> ★ Cache content → CloudFront. Static IP + TCP/UDP + fast failover → Global Accelerator. Many VPCs → Transit Gateway. Private, consistent link → Direct Connect.

| Command | What it does |
|---|---|
| `CloudFront` | HTTP cache at the edge |
| `Global Accelerator` | static anycast IP, TCP/UDP |
| `peering` | direct, non-transitive |
| `Transit Gateway` | hub for VPCs + on-prem |
| `VPN` | quick, encrypted, internet |
| `Direct Connect` | private, consistent, weeks |

**Memory hooks:**

- **CloudFront**: Static + dynamic content, global users, HTTP → CloudFront.
- **Global Accelerator**: Static IPs, UDP/TCP, fast Regional failover, no caching → Global Accelerator.
- **Connecting VPCs**: Few VPCs → peering. Many VPCs + on-premises → Transit Gateway. Peering is not transitive.
- **Site-to-Site VPN**: Quick + encrypted + cheap → VPN. Also the classic backup for Direct Connect.
- **Direct Connect**: Consistent bandwidth, large transfers, private → Direct Connect. Need it next week → VPN first.

## 12 · Data & Analytics Architectures

> ★ Ingest → S3 lake → Glue → Athena/Redshift → QuickSight. OLTP for the app, OLAP for analytics.

| Command | What it does |
|---|---|
| `S3 data lake` | Parquet + partitions |
| `Firehose` | no-code delivery |
| `Glue` | catalog + ETL |
| `Athena` | SQL on S3, per TB |
| `Redshift` | warehouse, BI, zero-ETL |
| `Lake Formation` | column/row access |

**Memory hooks:**

- **Ingest into a data lake**: Parquet + partitions = cheaper, faster queries. Firehose = no-code delivery.
- **Glue & Lake Formation**: Schema discovery + ETL → Glue. Column/row-level lake permissions → Lake Formation.
- **Athena**: Ad-hoc SQL on S3, serverless, pay per query → Athena.
- **Redshift**: OLAP, BI dashboards, complex joins on TB–PB → Redshift. OLTP stays in RDS/Aurora/DynamoDB.
- **EMR, OpenSearch and QuickSight**: Spark/Hadoop → EMR. Logs + search → OpenSearch. Dashboards → QuickSight.

## 13 · Cost-Optimized Architectures

> ★ Buy smarter · size right · store smarter · move less · measure.

| Command | What it does |
|---|---|
| `Savings Plans / RI` | steady baseline |
| `Spot` | interruptible, 2-min warning |
| `Compute Optimizer` | right-size |
| `gp2 → gp3` | cheaper EBS |
| `in free, out paid` | data transfer |
| `Budgets · Anomaly Detection` | alerts |

**Memory hooks:**

- **Purchase options**: Steady → Savings Plans/RIs. Interruptible → Spot. Licensing per core → Dedicated Host.
- **Right-sizing and elasticity**: Low CPU → Compute Optimizer + smaller/Graviton. Idle nights → schedule or scale to zero.
- **Storage costs**: gp2 → gp3. Lifecycle everything. Delete orphans.
- **Data transfer costs**: In = free. Out, cross-AZ, cross-Region, NAT = paid. Endpoints and CloudFront cut it.
- **Measure and govern**: Alert → Budgets. Unusual spike → Anomaly Detection. Who spent it → tags. Before building → Pricing Calculator.

## 14 · How to Read SAA Questions

> ★ Find the constraint, cross out what breaks it, pick the most managed answer that's left.

| Command | What it does |
|---|---|
| `last sentence first` | find the constraint |
| `least overhead` | most managed |
| `CloudTrail vs Config` | who called vs what changed |
| `GuardDuty / Inspector / Macie` | threats / vulns / PII |
| `self-managed, manual` | usually wrong |
| `90 s · flag · never blank` | timing |

**Memory hooks:**

- **Read the last sentence first**: Last sentence first. Underline numbers and adjectives.
- **Keyword → service map**: Learn the trigger words for every service in this course. The cheat sheets at the end of each lesson are exactly that.
- **Kill the distractors**: Self-managed, manual, over-engineered, fake, insecure → cross out.
- **Prefer managed and serverless**: Tie → most managed. Exception → the question demands control.
- **Time, flags and practice**: 90 s first pass · flag at 2 min · never blank · review explanations.

## 15 · Migration & Modernization

> ★ Rehost = MGN. Replatform DB = DMS. Change engine = SCT + DMS.

| Command | What it does |
|---|---|
| `7 Rs` | retire retain relocate rehost replatform repurchase refactor |
| `MGN` | rehost servers |
| `DMS + CDC` | DB, source online |
| `SCT` | engine change |
| `Discovery + Migration Hub` | plan & track |
| `waves` | move dependencies together |

**Memory hooks:**

- **Discover and plan**: Discover → business case → waves → migrate → optimize.
- **The 7 Rs**: Fastest → rehost. Small tweak → replatform. Cloud-native → refactor. SaaS → repurchase.
- **Application Migration Service**: Rehost, minimal downtime, many servers → MGN.
- **Database migration**: Same engine → DMS. Different engine → SCT + DMS. Minimal downtime → CDC.
- **After the move: modernize**: Migrate → optimize → modernize. Review after every wave.

## 16 · Capstone: Full Design Review

> ★ Secure → Resilient → Fast → Cheap, then write down why.

| Command | What it does |
|---|---|
| `secure` | identity · network · data · detection |
| `resilient` | multi-AZ · queues · DR |
| `high-performing` | edge · cache · right DB |
| `cost` | SP · Spot · tiering · endpoints |
| `defend` | problem → diagram → trade-offs → cost |
| `portfolio` | diagram + ADRs + review |

**Memory hooks:**

- **Domain 1: secure**: Identity · network · data · detection.
- **Domain 2: resilient**: Multi-AZ for HA, warm standby for DR, queues for spikes.
- **Domain 3: high-performing**: Edge cache · in-memory cache · right database · current generation.
- **Domain 4: cost-optimized**: Plan the baseline, scale the peak, Spot the batch, tier the storage.
- **Defend the design**: Problem → diagram → trade-offs → cost → next steps.

