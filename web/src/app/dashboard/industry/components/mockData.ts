import { 
  Project, 
  EscrowTranche, 
  BomReceipt, 
  LabResearcher, 
  KanbanTask, 
  TrlAuditEntry, 
  TrlStageCriteria,
  OfficeHourSlot, 
  ChatMessage, 
  CircuitAnnotation, 
  TestPoint, 
  RubricScores 
} from "./types";

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    title: "IoT Water Quality Monitor - BIT Mesra",
    institution: "Birla Institute of Technology, Mesra",
    department: "Electronics & Communication Engineering",
    domain: "Drinking Water & Sanitation",
    trl: 5,
    trlProgress: 70,
    sponsor: "Tata Steel CSR Foundation",
    totalPledged: 350000,
    disbursed: 145000,
    escrowLocked: 205000,
    currentMilestone: "Milestone 2: Prototype Bench Validation & Thermal Stress Logs",
    description: "Multi-parameter real-time turbidity, pH, and dissolved oxygen monitoring with LoRaWAN telemetry for rural water distribution networks in Ranchi and Khunti districts."
  },
  {
    id: "proj-2",
    title: "Smart Solar Mini-Grid Controller - NIT Jamshedpur",
    institution: "National Institute of Technology, Jamshedpur",
    department: "Electrical Engineering",
    domain: "Energy & Power",
    trl: 4,
    trlProgress: 45,
    sponsor: "Tata Power Community Trust",
    totalPledged: 420000,
    disbursed: 120000,
    escrowLocked: 300000,
    currentMilestone: "Milestone 1: MPPT Controller Circuit Simulation",
    description: "Adaptive maximum power point tracking and automatic battery balancing for decentralized tribal village micro-grids."
  },
  {
    id: "proj-3",
    title: "Biomass Briquetting Pyrolysis Unit - IIT ISM Dhanbad",
    institution: "IIT (ISM) Dhanbad",
    department: "Chemical & Environmental Engineering",
    domain: "Waste Management & Circular Economy",
    trl: 6,
    trlProgress: 85,
    sponsor: "BCCL / Coal India CSR",
    totalPledged: 550000,
    disbursed: 380000,
    escrowLocked: 170000,
    currentMilestone: "Milestone 3: Field Trial at Dhanbad Municipal Corporation",
    description: "High-efficiency thermal briquetting converter turning agricultural crop residue and coal wash reject into clean industrial solid fuel."
  }
];

export const mockEscrowTranches: EscrowTranche[] = [
  {
    id: "tranche-1",
    trancheNumber: 1,
    title: "Tranche 1: Analytical PoC & Schematic Validation",
    amount: 75000,
    totalAllocation: 105000,
    status: "DISBURSED",
    condition: "Approval of preliminary circuit design and component sourcing approval",
    disbursedDate: "2026-07-14",
    approvedBy: "Senior Technical Mentor (Tata Steel)",
    receiptsCount: 4
  },
  {
    id: "tranche-2",
    trancheNumber: 2,
    title: "Tranche 2: Lab Prototype & Thermal Stress Sign-Off",
    amount: 100000,
    totalAllocation: 140000,
    status: "LOCKED_IN_ESCROW",
    condition: "Successful thermal stress test bench verification at 45°C and schematic revision 2.2 sign-off",
    receiptsCount: 5
  },
  {
    id: "tranche-3",
    trancheNumber: 3,
    title: "Tranche 3: Municipal Bench Trial & Field Deployment",
    amount: 105000,
    totalAllocation: 105000,
    status: "PENDING_VERIFICATION",
    condition: "30-day continuous telemetry stream deployed at Subarnarekha River Intake Point, Ranchi",
    receiptsCount: 0
  }
];

export const mockBomReceipts: BomReceipt[] = [
  {
    id: "bom-1",
    itemName: "Industrial Turbidity Probe (DFRobot SEN0189 Pro)",
    category: "Sensors & Transducers",
    vendor: "Robu Technologies Pvt Ltd",
    amount: 24500,
    date: "2026-08-02",
    invoiceNumber: "INV-2026-8891",
    status: "VERIFIED",
    specifications: "Optoelectronic infrared 850nm scatter, IP68 rated, 0-3000 NTU linear response"
  },
  {
    id: "bom-2",
    itemName: "STM32F407G Microcontroller Discovery Kit",
    category: "Embedded Microcontrollers",
    vendor: "Mouser Electronics India",
    amount: 18200,
    date: "2026-08-09",
    invoiceNumber: "MSR-IN-44219",
    status: "VERIFIED",
    specifications: "ARM Cortex-M4 168MHz, 1MB Flash, 192KB RAM, 3x 12-bit ADC @ 2.4 MSPS"
  },
  {
    id: "bom-3",
    itemName: "Die-Cast Aluminum IP67 NEMA Enclosure (Custom Gasket)",
    category: "Mechanical Packaging",
    vendor: "Hammond Enclosures Hub Delhi",
    amount: 14800,
    date: "2026-08-16",
    invoiceNumber: "HMM-DL-7731",
    status: "VERIFIED",
    specifications: "Thermal dissipation finned base, waterproof cable glands PG7, anti-corrosion powder coat"
  },
  {
    id: "bom-4",
    itemName: "High-Efficiency LM2596 DC-DC Step-Down Regulators (Qty 20)",
    category: "Power Electronics",
    vendor: "Element14 India Bangalore",
    amount: 8750,
    date: "2026-08-25",
    invoiceNumber: "E14-BNG-50021",
    status: "VERIFIED",
    specifications: "3A step-down, 4.5V-40V input, 150kHz switching frequency, thermal shutdown"
  },
  {
    id: "bom-5",
    itemName: "LoRaWAN Transceiver Node SX1276 (865-867 MHz IN865)",
    category: "RF Communications",
    vendor: "Sunrom Electronics Ahmedabad",
    amount: 16400,
    date: "2026-09-01",
    invoiceNumber: "SNR-AHM-9104",
    status: "PENDING_AUDIT",
    specifications: "+20dBm PA output, 168dB maximum link budget, WPC India license-free band compliant"
  }
];

export const mockResearchers: LabResearcher[] = [
  {
    id: "res-1",
    name: "Dr. Ananya Mukherjee",
    role: "Faculty Principal Investigator & Guide",
    department: "Electronics & Communication Engineering",
    institution: "BIT Mesra, Ranchi",
    degrees: ["Ph.D. Microelectronics & Sensor Systems (IIT Kharagpur)", "M.Tech VLSI Design"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    publicationsCount: 28,
    publications: [
      { title: "Low-Power Mixed-Signal Frontends for Water Quality Telemetry", journal: "IEEE Transactions on Instrumentation and Measurement", year: 2025 },
      { title: "Long-Range Mesh Networks for River Basin Hydrological Sensing", journal: "Elsevier Computers and Electronics in Agriculture", year: 2024 },
      { title: "Field Calibration of Optical Turbidity Sensors under Variable Silt Concentrations", journal: "Springer Environmental Monitoring", year: 2023 }
    ],
    skills: ["Sensor Fusion", "Analog Circuit Design", "NISP Patent Strategy", "FPGA Interfacing"],
    flaggedForHiring: false,
    email: "ananya.mukherjee@bitmesra.ac.in",
    currentSubsystem: "Overall Architecture & Analog Signal Conditioning"
  },
  {
    id: "res-2",
    name: "Rahul Verma",
    role: "Embedded Systems & Firmware Researcher",
    department: "Computer Science & Engineering",
    institution: "BIT Mesra, Ranchi",
    degrees: ["M.Tech IoT & Embedded Systems (BIT Mesra)", "B.Tech Electrical Eng"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    publicationsCount: 7,
    publications: [
      { title: "Dynamic Power Scheduling in Energy-Harvested Remote Edge Nodes", journal: "ACM Transactions on Embedded Computing", year: 2025 },
      { title: "Fault-Tolerant LoRa Telemetry over Fading Forest Canopies", journal: "IEEE Sensors Letters", year: 2024 }
    ],
    skills: ["FreeRTOS", "STM32 HAL / LL", "LoRaWAN Stack", "DMA Optimization", "C/C++17"],
    flaggedForHiring: true,
    email: "rahul.verma.res@bitmesra.ac.in",
    currentSubsystem: "Firmware Core, FreeRTOS Tasks & LoRa Telemetry Link"
  },
  {
    id: "res-3",
    name: "Priya Soren",
    role: "Sensor Calibration & Thermal Lead",
    department: "Mechanical & Thermal Engineering",
    institution: "BIT Mesra, Ranchi",
    degrees: ["B.Tech Mechanical Engineering (Gold Medalist)", "Minor in Mechatronics"],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    publicationsCount: 4,
    publications: [
      { title: "Computational Fluid Dynamics Simulation of Silt Sedimentation in Submersible Sensor Probes", journal: "Elsevier Flow Measurement and Instrumentation", year: 2025 }
    ],
    skills: ["ANSYS Fluent", "Thermal FEA", "IP67 Enclosure Milling", "Environmental Stress Screening"],
    flaggedForHiring: true,
    email: "priya.soren.res@bitmesra.ac.in",
    currentSubsystem: "Waterproof Mechanical Packaging & Environmental Chamber Stress"
  },
  {
    id: "res-4",
    name: "Amitav Roy",
    role: "Machine Learning & Edge DSP Specialist",
    department: "Information Technology",
    institution: "BIT Mesra, Ranchi",
    degrees: ["M.Tech Data Analytics", "B.Tech Computer Science"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    publicationsCount: 6,
    publications: [
      { title: "Anomaly Detection in River Effluent Discharge using TinyML on Microcontrollers", journal: "IEEE Internet of Things Journal", year: 2025 }
    ],
    skills: ["TinyML", "TensorFlow Lite Micro", "Kalman Filtering", "Edge Impulse", "Python"],
    flaggedForHiring: false,
    email: "amitav.roy.res@bitmesra.ac.in",
    currentSubsystem: "On-device Anomaly Filtering & Turbidity Drift Correction"
  }
];

export const mockKanbanTasks: KanbanTask[] = [
  {
    id: "task-1",
    title: "Re-test voltage regulator under 45°C ambient temperature",
    description: "Bench validation with thermal camera showing heat dissipation on LM2596 heatsink under continuous 3A load.",
    column: "TODO",
    priority: "CRITICAL",
    assignee: {
      name: "Priya Soren",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      role: "Thermal Lead"
    },
    milestone: "Milestone 2",
    dueDate: "2026-09-14",
    tags: ["Hardware", "Thermal", "LM2596"]
  },
  {
    id: "task-2",
    title: "Prepare bilateral IP addendum compliant with NISP 2019 guidelines",
    description: "Draft 50/50 royalty split deed with BIT Mesra TTO office ensuring academic inventor royalty protection.",
    column: "TODO",
    priority: "MEDIUM",
    assignee: {
      name: "Dr. Ananya Mukherjee",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "PI / Faculty Guide"
    },
    milestone: "Milestone 2",
    dueDate: "2026-09-18",
    tags: ["Legal", "NISP", "TTO"]
  },
  {
    id: "task-3",
    title: "Turbidity sensor multipoint calibration using Subarnarekha water",
    description: "Generate 5-point calibration curve against laboratory spectrophotometer standard across 10-1500 NTU.",
    column: "IN_LAB_TESTING",
    priority: "HIGH",
    assignee: {
      name: "Amitav Roy",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "ML Specialist"
    },
    milestone: "Milestone 2",
    dueDate: "2026-09-12",
    tags: ["Calibration", "Spectroscopy", "Water"]
  },
  {
    id: "task-4",
    title: "48-Hour Continuous Stress Test on Battery Protection Circuit",
    description: "Verify BMS low-voltage cut-off (2.8V) and over-current protection (4.2A) under continuous simulated solar cycling.",
    column: "IN_LAB_TESTING",
    priority: "HIGH",
    assignee: {
      name: "Rahul Verma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Firmware Lead"
    },
    milestone: "Milestone 2",
    dueDate: "2026-09-13",
    tags: ["BMS", "Battery", "StressTest"]
  },
  {
    id: "task-5",
    title: "Review CAD Schematic v2.2 PCB Layout & Decoupling Caps",
    description: "Examine routing around 16MHz crystal oscillator and 100nF decoupling capacitors near STM32 VDD pins.",
    column: "AWAITING_MENTOR_REVIEW",
    priority: "CRITICAL",
    assignee: {
      name: "Senior Mentor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      role: "Industry Sponsor"
    },
    milestone: "Milestone 2",
    dueDate: "2026-09-10",
    tags: ["CAD", "PCB", "EMC"]
  },
  {
    id: "task-6",
    title: "LoRa Packet Loss logs over 3.2km distance in Khunti District",
    description: "Review telemetry packet reception rate (98.4%) across hilly terrain between node and gateway.",
    column: "AWAITING_MENTOR_REVIEW",
    priority: "HIGH",
    assignee: {
      name: "Senior Mentor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      role: "Industry Sponsor"
    },
    milestone: "Milestone 2",
    dueDate: "2026-09-11",
    tags: ["RF", "LoRa", "FieldData"]
  },
  {
    id: "task-7",
    title: "Sign-off Escrow Tranche 1 (Analytical PoC & Architecture)",
    description: "Milestone 1 successfully verified with ₹75,000 released to BIT Mesra innovation account.",
    column: "COMPLETED",
    priority: "HIGH",
    assignee: {
      name: "Senior Mentor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      role: "Industry Sponsor"
    },
    milestone: "Milestone 1",
    dueDate: "2026-07-14",
    tags: ["Escrow", "SignOff", "Milestone1"]
  },
  {
    id: "task-8",
    title: "Analog Front-End 4-20mA Current Loop Receiver Test",
    description: "Verified optical isolation and common-mode transient immunity up to 15kV/us.",
    column: "COMPLETED",
    priority: "MEDIUM",
    assignee: {
      name: "Dr. Ananya Mukherjee",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "PI / Faculty Guide"
    },
    milestone: "Milestone 1",
    dueDate: "2026-07-28",
    tags: ["Analog", "Isolation", "Bench"]
  }
];

export const mockTrlStages: TrlStageCriteria[] = [
  {
    stage: 1,
    title: "TRL 1: Basic Principles Observed",
    shortDesc: "Scientific research on optical absorption properties of silt particles.",
    status: "COMPLETED",
    checklist: [
      { item: "Literature review on nephelometric turbidity measurement", completed: true },
      { item: "Mathematical formulation of Beer-Lambert light attenuation", completed: true }
    ]
  },
  {
    stage: 2,
    title: "TRL 2: Technology Concept Formulated",
    shortDesc: "Sensor circuit architecture and LoRa telemetry concept defined.",
    status: "COMPLETED",
    checklist: [
      { item: "System block diagram and subsystem interface specs", completed: true },
      { item: "Identification of industrial sensor components and BOM estimate", completed: true }
    ]
  },
  {
    stage: 3,
    title: "TRL 3: Analytical Proof of Concept",
    shortDesc: "Simulated analog amplifier frontend and breadboard verification.",
    status: "COMPLETED",
    checklist: [
      { item: "SPICE simulation of photodiode transimpedance amplifier", completed: true },
      { item: "Lab bench verification of analog-to-digital resolution", completed: true }
    ]
  },
  {
    stage: 4,
    title: "TRL 4: Component Validation in Laboratory",
    shortDesc: "Integrated prototype board testing under controlled lab conditions.",
    status: "COMPLETED",
    checklist: [
      { item: "PCB prototype fabrication and assembly", completed: true },
      { item: "Microcontroller firmware FreeRTOS baseline validation", completed: true },
      { item: "Multi-parameter sensor calibration in clean water standards", completed: true }
    ]
  },
  {
    stage: 5,
    title: "TRL 5: Component Validation in Relevant Environment",
    shortDesc: "Thermal stress validation, environmental chamber and outdoor field tests.",
    status: "CURRENT",
    checklist: [
      { item: "Thermal stress testing at 45°C ambient temperature (Current Review)", completed: true },
      { item: "IP67 waterproof enclosure pressure test (Passed)", completed: true },
      { item: "48-hour continuous battery life endurance test", completed: false },
      { item: "Bilateral IP agreement and NISP compliance sign-off", completed: false }
    ]
  },
  {
    stage: 6,
    title: "TRL 6: System Subsystem Model Demonstration",
    shortDesc: "Operational field demonstration at Subarnarekha River intake point.",
    status: "UPCOMING",
    checklist: [
      { item: "Continuous 30-day municipal river deployment", completed: false },
      { item: "Integration with Jharkhand State Water Resources dashboard API", completed: false }
    ]
  },
  {
    stage: 7,
    title: "TRL 7: System Prototype Demonstration in Operational Environment",
    shortDesc: "Full-scale deployment across 5 rural drinking water reservoirs.",
    status: "UPCOMING",
    checklist: [
      { item: "Multi-node mesh network synchronization over 15km", completed: false },
      { item: "Automated SMS/alert dispatch to District Nodal Officer on contamination", completed: false }
    ]
  },
  {
    stage: 8,
    title: "TRL 8: Actual System Completed and Qualified",
    shortDesc: "BIS certification and formal regulatory approvals for municipal tenders.",
    status: "UPCOMING",
    checklist: [
      { item: "Bureau of Indian Standards (BIS) IS 10500 compliance certificate", completed: false },
      { item: "Mass production tooling and vendor assembly line qualification", completed: false }
    ]
  },
  {
    stage: 9,
    title: "TRL 9: Full Commercial & Societal Deployment",
    shortDesc: "Statewide commercial deployment under Jal Jeevan Mission.",
    status: "UPCOMING",
    checklist: [
      { item: "Commercial technology transfer license execution with corporate sponsor", completed: false },
      { item: "Deployment across all 24 districts in Jharkhand", completed: false }
    ]
  }
];

export const mockTrlAuditLog: TrlAuditEntry[] = [
  {
    id: "audit-1",
    timestamp: "2026-09-08 17:42",
    type: "TEST_LOG",
    title: "Thermal Stress Test: Ambient 45°C Continuous 3A Bench Run",
    description: "Executed 6-hour thermal soak inside bench testing chamber. Node 1 voltage settled at 14.8V (nominal 15.0V). Peak temperature on LM2596 reached 68.4°C, within rated 125°C junction threshold.",
    author: "Priya Soren (Thermal Lead)",
    commitSha: "test-run-8821a",
    trlStage: 5,
    metrics: [
      { name: "Regulator Junction Temp", value: "68.4°C / 125°C max", pass: true },
      { name: "Ripple Voltage", value: "38mV pk-pk", pass: true },
      { name: "DC Output Stability", value: "±1.2%", pass: true }
    ],
    status: "PASSED"
  },
  {
    id: "audit-2",
    timestamp: "2026-09-07 14:15",
    type: "SCHEMATIC",
    title: "Schematic Revision v2.2: Redesigned Decoupling & Transceiver Ground Plane",
    description: "Separated analog sensor ground (AGND) from digital MCU ground (DGND) using 0-ohm ferrite bead FB1. Added 100uF tantalum capacitor at LM2596 output.",
    author: "Dr. Ananya Mukherjee (Faculty PI)",
    commitSha: "c7f901b",
    trlStage: 5,
    status: "VERIFIED"
  },
  {
    id: "audit-3",
    timestamp: "2026-09-05 11:30",
    type: "FIRMWARE",
    title: "Firmware Release v1.4.2: FreeRTOS Task Prioritization & Sleep Optimization",
    description: "Configured deep sleep mode for STM32 during 10-minute sensor telemetry intervals, dropping quiescent current from 42mA to 1.8mA.",
    author: "Rahul Verma (Firmware Lead)",
    commitSha: "94b8e21",
    trlStage: 5,
    metrics: [
      { name: "Active Current", value: "38.2 mA", pass: true },
      { name: "Sleep Current", value: "1.8 mA", pass: true },
      { name: "Wake-up Latency", value: "12 ms", pass: true }
    ],
    status: "PASSED"
  },
  {
    id: "audit-4",
    timestamp: "2026-08-28 09:20",
    type: "TRL_GATE",
    title: "TRL-4 Formal Sign-Off: Lab Component Integration Gate Passed",
    description: "All subsystem components successfully verified in BIT Mesra Microelectronics Lab. Industry mentor approved Tranche 1 closeout.",
    author: "Senior Technical Mentor (Tata Steel)",
    trlStage: 4,
    status: "PASSED"
  }
];

export const mockOfficeHours: OfficeHourSlot[] = [
  {
    id: "slot-1",
    day: "Friday",
    dateNumber: 11,
    startTime: "15:00",
    endTime: "17:00",
    recurring: true,
    type: "Milestone Review",
    attendees: ["Dr. Ananya Mukherjee", "Rahul Verma"]
  },
  {
    id: "slot-2",
    day: "Tuesday",
    dateNumber: 15,
    startTime: "16:00",
    endTime: "18:00",
    recurring: true,
    type: "Lab Demonstration",
    attendees: ["Priya Soren", "Amitav Roy"]
  },
  {
    id: "slot-3",
    day: "Thursday",
    dateNumber: 17,
    startTime: "14:00",
    endTime: "16:00",
    recurring: false,
    type: "Office Hours",
    attendees: ["BIT Mesra Core Engineering Team"]
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "Dr. Ananya Mukherjee",
    senderRole: "Faculty Guide / PI",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    content: "Hi Senior Mentor, we uploaded the revised CAD schematic v2.2 and thermal camera footage under 45°C ambient soak. The LM2596 regulator is staying cool with the custom finned housing.",
    timestamp: "10:32 AM",
    attachment: { name: "Thermal_Stress_Test.mp4", size: "18.4 MB" }
  },
  {
    id: "msg-2",
    sender: "Senior Technical Mentor",
    senderRole: "Tata Steel Industry Sponsor",
    senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    content: "Excellent progress Dr. Mukherjee. I am inspecting the CAD schematic right now. Please confirm Node 2 voltage under full transmission spike.",
    timestamp: "10:45 AM"
  },
  {
    id: "msg-3",
    sender: "Rahul Verma",
    senderRole: "Firmware Lead",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    content: "Node 2 peaks at 15.5V during LoRa +20dBm transmission bursts due to inductance on the battery leads, but drops back to 15.0V within 4 milliseconds. We've added a low-ESR bulk capacitor.",
    timestamp: "11:02 AM"
  },
  {
    id: "msg-4",
    sender: "Senior Technical Mentor",
    senderRole: "Tata Steel Industry Sponsor",
    senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    content: "Acknowledged. Opening the Milestone Review Desk to finalize rubric evaluation and sign off on Escrow Tranche 2 authorization.",
    timestamp: "11:15 AM"
  }
];

export const mockCircuitAnnotations: CircuitAnnotation[] = [
  {
    id: "note-1",
    x: 48,
    y: 32,
    component: "LM2596 Regulator",
    text: "Verify thermal dissipation under 45°C ambient. Add copper thermal vias underneath pad.",
    author: "Senior Mentor",
    timestamp: "Yesterday 4:15 PM",
    resolved: false
  },
  {
    id: "note-2",
    x: 72,
    y: 65,
    component: "SX1276 LoRa RF Path",
    text: "Match 50-ohm trace impedance on RF output trace to avoid VSWR reflections.",
    author: "Senior Mentor",
    timestamp: "2 days ago",
    resolved: true
  }
];

export const mockTestPoints: TestPoint[] = [
  {
    id: "tp-1",
    nodeNumber: 1,
    label: "Node 1: DC Input Rail (Solar/Battery)",
    voltage: 14.8,
    targetVoltage: 15.0,
    tolerance: "±5%",
    status: "NORMAL",
    waveform: [14.7, 14.8, 14.9, 14.8, 14.7, 14.8, 14.9, 14.8, 14.8, 14.7, 14.9, 14.8]
  },
  {
    id: "tp-2",
    nodeNumber: 2,
    label: "Node 2: Buck Regulator Output (V_REG)",
    voltage: 15.5,
    targetVoltage: 15.0,
    tolerance: "±3%",
    status: "WARNING",
    waveform: [14.9, 15.1, 15.4, 15.5, 15.3, 15.1, 15.5, 15.4, 15.0, 15.2, 15.5, 15.3]
  },
  {
    id: "tp-3",
    nodeNumber: 3,
    label: "Node 3: MCU Core & Logic VDD (3.3V)",
    voltage: 12.3, // Analog Sub-Bus
    targetVoltage: 12.0,
    tolerance: "±5%",
    status: "NORMAL",
    waveform: [12.2, 12.3, 12.3, 12.2, 12.4, 12.3, 12.2, 12.3, 12.4, 12.3, 12.2, 12.3]
  },
  {
    id: "tp-4",
    nodeNumber: 4,
    label: "Node 4: Turbidity Sensor Excitation Bus",
    voltage: 19.8,
    targetVoltage: 20.0,
    tolerance: "±4%",
    status: "NORMAL",
    waveform: [19.7, 19.8, 19.9, 19.8, 19.7, 19.8, 19.9, 19.8, 19.8, 19.7, 19.9, 19.8]
  }
];

export const initialRubricScores: RubricScores = {
  technicalFeasibility: 85,
  componentDurability: 90,
  costEfficiency: 80
};

export const defaultExpertiseTags = [
  "Embedded Firmware",
  "Analog Circuit Design",
  "Water Quality Instrumentation",
  "LoRaWAN & IoT Telemetry",
  "Power Electronics & Thermal FEA",
  "NISP IP Commercialization"
];
