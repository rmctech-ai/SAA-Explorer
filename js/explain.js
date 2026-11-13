window.EXPLAIN = {
"sa-role": [
 ["SAA-C03 is scored from 100 to 1000 and the pass mark is 720.", ["700 is not the SAA pass mark; it is used by some other exams.", null, "750 is the pass mark for Professional and Specialty exams, not the Associate.", "800 is higher than the real pass mark."]],
 ["Design Secure Architectures is 30% of the exam, the largest domain.", ["Resilient is 26%, second largest.", "Cost-Optimized is 20%, the smallest domain.", null, "High-Performing is 24%."]],
 ["Availability describes how well the system works, so it is a non-functional (quality) requirement.", ["A functional requirement describes what the system does, like checkout.", null, "It is a concrete requirement the design must meet, not only a goal.", "Surviving an AZ failure is very much in scope for an architect."]],
 ["An ALB in front of an Auto Scaling group spread across AZs survives an AZ loss and scales with demand.", ["One instance is a single point of failure; snapshots only help after the outage.", null, "Two instances in one AZ fail together when that AZ fails.", "An Elastic IP gives a fixed address, not availability."]]
],
"sa-roadmap": [
 ["An ADR records the Context, the Decision, the Alternatives considered and the Consequences.", ["Plan-Do-Check-Act is a quality cycle, not an ADR format.", null, "Those are journalism questions, not the ADR structure.", "Cost, risk, time and scope are project management dimensions."]],
 ["The Solutions Architect Professional (SAP-C02) covers organization-wide design: multi-account, hybrid networking and large migrations.", ["SAA-C03 focuses on single workloads.", "CLF-C02 is the foundational Cloud Practitioner exam.", null, "The Developer Associate focuses on building and deploying applications."]],
 ["Knowing what an hour of downtime costs tells you how fast you must recover, which is the RTO.", ["The language matters for the build, not for the recovery target.", null, "Team size affects operations, not the RTO itself.", "Preferences are not requirements; downtime cost is."]],
 ["The Security Specialty (SCS-C03) covers IAM, KMS, detection and incident response, the core of cloud security and IAM roles.", ["The Data Engineer Associate covers pipelines and analytics.", "The ML Engineer Associate covers machine learning workloads.", null, "The Developer Associate covers application development."]]
],
"identity": [
 ["SCPs set the maximum permissions for everyone in a member account, including admins and the root user, so a deny on cloudtrail:StopLogging cannot be bypassed.", ["Admins can edit or remove IAM policies in their own account.", null, "A Config rule detects the change but does not prevent it.", "A bucket policy protects the log bucket, not the trail setting."]],
 ["IAM Identity Center federates the workforce directory and assigns permission sets per account with short-lived credentials.", ["One IAM user per person per account is hard to manage and uses long-lived credentials.", null, "Cognito user pools are for application customers, not the workforce.", "Sharing root credentials breaks every security best practice."]],
 ["Cognito identity pools exchange a sign-in for temporary AWS credentials scoped to the user.", [null, "A user pool alone authenticates users and returns JWTs, but does not give AWS credentials.", "Embedding long-lived keys in an app lets anyone extract them.", "SCPs limit permissions; they never give credentials."]],
 ["An ExternalId condition in the trust policy ensures the vendor can only assume the role on your behalf, preventing the confused deputy problem.", ["Session length does not stop another customer from tricking the vendor.", null, "Root MFA protects your root user, not the trust relationship.", "VPC endpoints control network paths, not who may assume a role."]]
],
"secure-network": [
 ["Network ACLs support explicit deny rules and apply to the whole subnet.", ["Security groups only have allow rules.", null, "IAM policies control API actions, not network packets.", "Route tables send traffic somewhere; they do not filter source IPs."]],
 ["A gateway endpoint for S3 is free and keeps traffic off the NAT gateway, removing the per-GB processing charge.", ["A NAT gateway scales automatically and size does not change the per-GB charge.", null, "Private subnets must not route to an internet gateway, and it would expose instances.", "Direct Connect links on-premises sites, not VPC-to-S3 traffic."]],
 ["Security groups can reference other security groups, for example allow 5432 from the app security group.", ["Security groups are stateful: return traffic is allowed automatically.", "Security groups have no deny rules.", null, "Security groups attach to network interfaces; NACLs attach to subnets."]],
 ["PrivateLink publishes a service behind an NLB as an endpoint service; consumers connect through interface endpoints, even with overlapping CIDRs.", ["Peering does not allow overlapping CIDRs and would need 200 connections.", "Transit Gateway also requires non-overlapping CIDRs and exposes more than one service.", null, "A public ALB would put the API on the internet."]]
],
"data-protection": [
 ["Secrets Manager rotates secrets automatically, with built-in rotation for RDS and Aurora.", ["Standard Parameter Store parameters have no built-in rotation.", null, "KMS manages encryption keys, not database passwords.", "ACM manages TLS certificates."]],
 ["S3 Object Lock in compliance mode prevents deletion or overwrite by any user, including root, until the retention period ends.", ["Versioning keeps old versions but someone with permissions can still delete them.", null, "Lifecycle rules move or delete objects; they do not protect them.", "Root MFA protects the account login, not the objects."]],
 ["Amazon Macie uses machine learning to discover sensitive data such as credit card numbers in S3.", ["GuardDuty detects threats from logs, not data contents.", "Inspector scans for software vulnerabilities.", null, "Shield protects against DDoS attacks."]],
 ["CloudFront only uses ACM certificates requested or imported in us-east-1 (N. Virginia).", ["CloudFront is global and specifically needs us-east-1.", "The origin bucket's Region does not matter for the viewer certificate.", null, "eu-west-1 certificates cannot be attached to CloudFront."]]
],
"decoupling": [
 ["SQS FIFO guarantees ordering within a message group and exactly-once processing; using the customer ID as MessageGroupId keeps other customers parallel.", ["Standard queues can reorder and duplicate messages.", null, "SNS standard topics do not guarantee order.", "Firehose delivers data to storage; it is not a work queue."]],
 ["An SNS topic fanning out to one SQS queue per consumer gives each system its own durable copy to process at its own pace.", ["Direct calls tightly couple the API to all three systems.", null, "A shared queue delivers each message to only one consumer.", "Express workflows orchestrate steps; they are not a fan-out buffer."]],
 ["EventBridge has partner event sources for SaaS apps and routes events by content-based rules.", ["SQS cannot receive SaaS events directly or route by content.", null, "Kinesis is a stream; it has no SaaS rules engine.", "Batch runs compute jobs, not event routing."]],
 ["Kinesis Data Streams keeps records for a retention period so several consumers can read and replay them.", ["SQS deletes messages once processed; no replay.", "SNS pushes messages once; it does not store them for replay.", null, "Step Functions orchestrates workflows, not data streams."]]
],
"ha-dr": [
 ["A warm standby keeps a scaled-down working copy in the other Region, so it can take traffic within minutes.", ["Rebuilding from backups usually takes hours.", "A pilot light needs infrastructure started and scaled, often tens of minutes or more.", null, "Without DR there is no recovery target at all."]],
 ["RDS Multi-AZ keeps a synchronous standby in another AZ and fails over automatically.", ["Read replicas are asynchronous and must be promoted manually.", null, "Snapshots are backups; restoring them is slow and manual.", "Performance Insights is a monitoring tool."]],
 ["Latency-based routing answers with the Region that has the lowest measured latency for the user.", ["Weighted routing splits traffic by percentage, not latency.", "Geolocation routes by the user's country or continent, not speed.", null, "Simple routing returns one record without any logic."]],
 ["The Network Load Balancer works at layer 4 (TCP/UDP), gives a static IP per AZ and handles millions of requests per second.", ["ALB is layer 7 HTTP/HTTPS only and has no static IP.", null, "Classic Load Balancer is legacy and has no static IP per AZ.", "Gateway Load Balancer is for inserting security appliances."]]
],
"compute": [
 ["Cluster placement groups pack instances close together in one AZ for the lowest latency between them.", ["Spread places instances on separate hardware, which increases distance.", "Partition separates groups of instances across racks for big distributed systems.", null, "Without a placement group, latency between instances is not optimized."]],
 ["Lambda invocations are limited to 15 minutes, so a 40-minute job cannot run there.", ["Batch has no time limit and suits long jobs.", "Fargate tasks can run for hours.", null, "EC2 Spot in an ASG can run long, interruptible jobs."]],
 ["EKS is managed Kubernetes, so existing Kubernetes skills and manifests carry over.", ["ECS is AWS's own orchestrator, not Kubernetes.", null, "Beanstalk is a PaaS for web apps, not Kubernetes.", "Lightsail is simple VPS hosting."]],
 ["R (and X) instance families are memory optimized for in-memory databases and caches.", ["C is compute optimized.", null, "T is burstable general purpose.", "I is storage optimized for high local IOPS."]]
],
"storage": [
 ["FSx for Windows File Server gives SMB shares joined to Active Directory with NTFS permissions.", ["EFS is NFS for Linux and does not support SMB.", null, "EBS Multi-Attach is block storage for clustered apps, not an SMB share.", "S3 is object storage, not a mounted Windows share."]],
 ["Intelligent-Tiering monitors access and moves objects between tiers automatically, ideal for unknown or changing patterns.", ["Standard-IA charges retrieval fees, costly if objects become hot.", null, "One Zone-IA is for infrequent, re-creatable data in one AZ.", "Deep Archive takes hours to retrieve."]],
 ["500 TB over 100 Mbps would take more than a year, so Snowball Edge devices are shipped instead.", ["DataSync still depends on the slow link.", null, "Transfer Acceleration speeds long-distance paths but cannot exceed the 100 Mbps link.", "Storage Gateway gives hybrid access, not bulk offline transfer."]],
 ["EFS is a shared NFS file system that many Linux instances across AZs can mount at once.", ["An EBS gp3 volume attaches to one instance in one AZ.", "Instance store is local and lost when the instance stops.", null, "FSx for Windows is SMB for Windows workloads."]]
],
"databases": [
 ["Neptune is a graph database built for relationship queries like fraud rings.", ["DynamoDB is key-value; deep relationship queries are hard.", null, "Timestream is for time-series data.", "Redshift is a warehouse for analytics, not graph traversal."]],
 ["RDS Proxy pools and shares database connections, so many Lambda invocations use a small set of connections.", ["A bigger instance raises the limit a little but does not fix connection storms.", null, "Read replicas spread reads but each still gets its own connections.", "Multi-AZ improves availability, not connection counts."]],
 ["DAX is an in-memory cache compatible with the DynamoDB API, giving microsecond reads with minimal code changes.", ["Memcached would require rewriting the data access layer.", null, "CloudFront caches HTTP content at the edge, not DynamoDB items.", "RDS Proxy is for relational databases."]],
 ["On-demand capacity bills per request and handles unpredictable traffic without capacity planning.", ["Fixed provisioned capacity would throttle or waste money on unpredictable load.", null, "Reserved capacity suits steady, predictable usage.", "There is no burst capacity mode to choose."]]
],
"edge-hybrid": [
 ["Global Accelerator gives two static anycast IPs and supports UDP and TCP over the AWS backbone.", ["CloudFront serves HTTP(S) content, not arbitrary UDP traffic.", null, "Route 53 returns DNS answers but does not give fixed anycast IPs.", "Transfer Acceleration is for uploads to S3."]],
 ["VPC peering is not transitive: A needs its own peering with C, or a Transit Gateway.", ["Traffic does not flow through a peered VPC to a third one.", null, "Cross-Region peering is also non-transitive.", "NAT does not make peering transitive."]],
 ["Direct Connect is a dedicated physical link with consistent bandwidth, but new connections take weeks.", ["A VPN can be set up in minutes and runs over the internet.", null, "Client VPN connects individual laptops.", "An internet gateway gives public internet access."]],
 ["Transit Gateway is a regional hub: each VPC and on-premises link attaches once and routing is managed centrally.", ["A full mesh of 60 VPCs needs about 1,770 peerings.", null, "One VPC across accounts loses the isolation benefits.", "PrivateLink shares individual services, not full network routing."]]
],
"analytics": [
 ["Athena runs SQL directly on S3 data without servers, paying per TB scanned.", ["Provisioned Redshift needs a cluster for occasional queries.", null, "EMR requires managing a cluster of big data frameworks.", "RDS needs the data loaded into a database first."]],
 ["Amazon Data Firehose buffers streaming data, converts it to Parquet and delivers it to S3 with no code.", ["Data Streams needs custom consumers to write to S3.", null, "SQS is a queue, not a delivery service to S3.", "Glue crawlers discover schemas; they do not ingest streams."]],
 ["Lake Formation manages fine-grained permissions on the data lake, including column- and row-level access.", ["IAM alone can't express column-level permissions on tables.", null, "Macie finds sensitive data but does not grant access.", "QuickSight visualizes data; it is not the lake's permission layer."]],
 ["Moving analytics to a warehouse (zero-ETL into Redshift) keeps the OLTP database fast for customers.", ["A bigger instance only delays the problem and costs more.", "Night runs still load the writer and may clash with batch jobs.", null, "Deleting data destroys business value."]]
],
"cost": [
 ["Spot Instances offer up to 90% off for fault-tolerant work that can be interrupted and retried.", ["On-Demand is the most expensive option.", null, "Dedicated Hosts are for licensing and compliance, at a premium.", "A 3-year RI is for steady 24/7 usage, not a nightly job."]],
 ["Compute Savings Plans apply across EC2 (any family and Region), Fargate and Lambda.", ["EC2 Instance Savings Plans are tied to one instance family in one Region and don't cover Lambda.", null, "Spot is not a commitment discount and can be interrupted.", "A Standard RI for one family does not cover Fargate or Lambda."]],
 ["Inbound data transfer from the internet into AWS is free.", ["Data out to the internet is charged per GB.", "Data between Regions is charged.", null, "NAT gateways charge for every GB processed."]],
 ["Compute Optimizer analyzes utilization metrics and recommends right-sized instance types.", ["Trusted Advisor flags low-utilization instances but Compute Optimizer gives the detailed recommendations.", null, "Cost Explorer forecasts spend but does not recommend instance sizes.", "AWS Config tracks configuration and compliance."]]
],
"exam-technique": [
 ["Lambda with EventBridge Scheduler is fully managed, so there are no servers to patch or monitor.", ["A cron job on EC2 requires managing the instance.", null, "They are not equal; one has far less to operate.", "One answer clearly meets all requirements."]],
 ["AWS Config records configuration history and evaluates resources against rules.", ["CloudTrail records API calls (who did what), not configuration compliance.", null, "GuardDuty detects threats.", "Inspector scans for vulnerabilities."]],
 ["Self-managed MySQL on EC2 with manual backups adds work when RDS and AWS Backup exist.", ["Multi-AZ is a common correct answer for availability.", null, "An ALB is a managed, common correct choice.", "AWS Backup is a managed, centralized backup service."]],
 ["There is no penalty for guessing; unanswered questions are simply marked wrong.", ["Wrong answers do not subtract points.", null, "Multiple-response questions also have no penalty.", "There is no time-based penalty."]]
],
"migration": [
 ["Application Migration Service replicates servers continuously and cuts over to EC2 with minutes of downtime, without code changes.", ["DMS migrates databases, not whole servers.", null, "SCT converts database schemas.", "Beanstalk deploys application code, it doesn't replicate servers."]],
 ["A heterogeneous migration needs schema conversion (SCT or DMS Schema Conversion), then DMS with CDC keeps data in sync while the source stays online.", ["DMS alone cannot convert Oracle schemas and code to PostgreSQL.", null, "MGN rehosts servers, not database engines.", "Snowball moves bulk data offline but can't keep the source in sync."]],
 ["Moving self-managed MySQL to RDS is a small change to use a managed platform, which is replatforming.", ["Rehost keeps the same server, just on EC2.", null, "Refactoring rebuilds the application cloud-native.", "Repurchasing moves to a different product, usually SaaS."]],
 ["Replacing an application with a SaaS product is repurchasing.", ["Retain keeps it on-premises.", "Relocate moves VMs as-is, for example to VMware Cloud on AWS.", null, "Rehost lifts the same server to EC2."]]
],
"capstone": [
 ["Warm standby with an Aurora Global Database secondary and Route 53 failover can recover in minutes with about one second of data loss.", ["Nightly backups mean hours of recovery and up to a day of data loss.", null, "Multi-AZ protects against an AZ failure, not a Region failure.", "Same-Region replicas fail with the Region."]],
 ["Storing sessions in ElastiCache or DynamoDB keeps every web server stateless, so the ASG can add and remove instances freely.", ["Local disk ties users to one instance that may be terminated.", "Sticky sessions break when an instance fails or scales in.", null, "EBS attaches to one instance only."]],
 ["A gateway endpoint routes S3 traffic privately and is free, so NAT processing charges disappear.", ["A second NAT gateway doubles the hourly cost and still charges per GB.", null, "Private subnets must not route to an internet gateway.", "CloudFront serves viewers; it does not carry instance-to-S3 traffic."]],
 ["Each key decision needs its trade-off and the alternatives considered, so reviewers understand why.", ["Humour is optional; reasoning is required.", null, "Logos do not explain a design.", "Undocumented decisions get re-argued later."]]
]
};

/* merge into the lessons (loaded after lessons, before app.js) */
(function (E) { (window.LESSONS || []).forEach(l => { const x = E[l.id]; if (!x || !l.quiz) return; x.forEach((e, i) => { const q = l.quiz[i]; if (!q || !e) return; if (e[0]) q.why = e[0]; if (e[1]) q.w = e[1]; }); }); })(window.EXPLAIN || {});
