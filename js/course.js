window.COURSE = {
 "short": "SAA",
 "key": "saa-explorer-v1",
 "prompt": "$",
 "termTitle": "aws cli",
 "where": "CLI",
 "lab": "war",
 "handsOn": "Architect Lab challenge",
 "errRe": "HRI|\\bFAILED\\b|error occurred|Error:|^[45]\\d\\d\\b|Failure:",
 "cats": [
  [
   "all",
   "ALL"
  ],
  [
   "road",
   "ROADMAP"
  ],
  [
   "sec",
   "SECURE"
  ],
  [
   "res",
   "RESILIENT"
  ],
  [
   "perf",
   "HIGH-PERFORMING"
  ],
  [
   "cost",
   "COST"
  ],
  [
   "exam",
   "EXAM & CAPSTONE"
  ]
 ],
 "catTitle": {
  "road": "THE SOLUTIONS ARCHITECT ROADMAP",
  "sec": "DOMAIN 1 · SECURE ARCHITECTURES (30%)",
  "res": "DOMAIN 2 · RESILIENT ARCHITECTURES (26%)",
  "perf": "DOMAIN 3 · HIGH-PERFORMING ARCHITECTURES (24%)",
  "cost": "DOMAIN 4 · COST-OPTIMIZED ARCHITECTURES (20%)",
  "exam": "EXAM TECHNIQUE, MIGRATION & CAPSTONE"
 },
 "kinds": {
  "cli": [
   "AWS CLI",
   "#1d5bd8"
  ],
  "arch": [
   "ARCHITECT",
   "#7c3aed"
  ],
  "exam": [
   "EXAM TIP",
   "#0d9488"
  ],
  "err": [
   "FAILURE",
   "#e11d48"
  ]
 },
 "layers": [
  "ROADMAP",
  "IDENTITY",
  "NETWORK SECURITY",
  "DATA PROTECTION",
  "DECOUPLING",
  "HA & DR",
  "COMPUTE",
  "STORAGE",
  "DATABASES",
  "EDGE & HYBRID",
  "ANALYTICS",
  "COST",
  "EXAM"
 ],
 "levels": [
  [
   0,
   "CLOUD PRACTITIONER"
  ],
  [
   150,
   "DESIGN CURIOUS"
  ],
  [
   400,
   "SECURE BUILDER"
  ],
  [
   800,
   "RESILIENCE KEEPER"
  ],
  [
   1300,
   "PERFORMANCE TUNER"
  ],
  [
   2000,
   "ASSOCIATE ARCHITECT"
  ],
  [
   2900,
   "MASTER ARCHITECT"
  ]
 ]
};
COURSE.errRe = new RegExp(COURSE.errRe, "i");
