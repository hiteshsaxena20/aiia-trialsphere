// Comprehensive mock data for AIIA TrialSphere CTMS Platform

export const MOCK_USERS = [
  { id: 1, name: 'Dr. Rajesh Sharma', email: 'admin@aiia.gov.in', role: 'ADMIN', title: 'Director & CTMS Admin' },
  { id: 2, name: 'Dr. Ananya Mishra', email: 'pi1@aiia.gov.in', role: 'PI', title: 'Principal Investigator' },
  { id: 3, name: 'Pooja Verma', email: 'coord1@aiia.gov.in', role: 'STUDY_COORDINATOR', title: 'Lead Study Coordinator' },
  { id: 4, name: 'Dr. Suresh Nair', email: 'pv@aiia.gov.in', role: 'PV_OFFICER', title: 'Pharmacovigilance Officer' },
  { id: 5, name: 'Dr. Vikram Seth', email: 'mgmt@aiia.gov.in', role: 'MANAGEMENT', title: 'Institutional Dean & Oversight' },
];

export const MOCK_STUDIES = [
  {
    id: 1,
    study_code: 'AIIA-CT-2024-001',
    title: 'Efficacy of Triphala Churna in Metabolic Syndrome & Dyslipidemia',
    phase: 'PHASE_3',
    status: 'ENROLLMENT',
    risk_level: 'LOW',
    risk_score: 24,
    therapeutic_area: 'Metabolic Disorders',
    target_sample_size: 500,
    enrolled_count: 412,
    pi_name: 'Dr. Rajesh Sharma',
    start_date: '2024-01-15',
    estimated_end_date: '2025-06-30',
    protocol_version: '3.2',
    ctri_number: 'CTRI/2024/01/061204',
    iec_approval_date: '2023-11-20',
    iec_expiry_date: '2024-11-19',
    description: 'A multicenter, double-blind, randomized, placebo-controlled trial evaluating standardized Triphala formulation.',
    sites_count: 8,
    sae_count: 1,
    alerts_count: 0
  },
  {
    id: 2,
    study_code: 'AIIA-CT-2024-002',
    title: 'Ashwagandha (Withania somnifera) in Glycemic Control of Type-2 Diabetes',
    phase: 'PHASE_2',
    status: 'ENROLLMENT',
    risk_level: 'MEDIUM',
    risk_score: 58,
    therapeutic_area: 'Endocrinology',
    target_sample_size: 300,
    enrolled_count: 145,
    pi_name: 'Dr. Ananya Mishra',
    start_date: '2024-03-01',
    estimated_end_date: '2025-08-30',
    protocol_version: '2.0',
    ctri_number: 'CTRI/2024/02/062118',
    iec_approval_date: '2024-01-10',
    iec_expiry_date: '2025-01-09',
    description: 'Randomized controlled trial assessing aqueous root extract of Ashwagandha as add-on therapy in T2DM.',
    sites_count: 6,
    sae_count: 3,
    alerts_count: 2
  },
  {
    id: 3,
    study_code: 'AIIA-CT-2024-003',
    title: 'Standardized Brahmi Extract for Cognitive Enhancement in Age-Related Memory Decline',
    phase: 'PHASE_3',
    status: 'FOLLOW_UP',
    risk_level: 'LOW',
    risk_score: 18,
    therapeutic_area: 'Neurology / Geriatrics',
    target_sample_size: 250,
    enrolled_count: 250,
    pi_name: 'Dr. Sunil K. Varma',
    start_date: '2023-08-01',
    estimated_end_date: '2024-12-31',
    protocol_version: '4.1',
    ctri_number: 'CTRI/2023/07/055412',
    iec_approval_date: '2023-06-15',
    iec_expiry_date: '2024-06-14',
    description: 'Double-blind, parallel-group clinical evaluation of Bacopa monnieri extract on neuropsychological test scores.',
    sites_count: 5,
    sae_count: 0,
    alerts_count: 1
  },
  {
    id: 4,
    study_code: 'AIIA-CT-2024-004',
    title: 'Guduchi (Tinospora cordifolia) as Immunoadjuvant in Recurrent Respiratory Infections',
    phase: 'PHASE_2',
    status: 'RECRUITMENT_STARTED',
    risk_level: 'HIGH',
    risk_score: 76,
    therapeutic_area: 'Immunology / Pulmonology',
    target_sample_size: 200,
    enrolled_count: 38,
    pi_name: 'Dr. Meera Nambiar',
    start_date: '2024-04-10',
    estimated_end_date: '2025-10-31',
    protocol_version: '1.4',
    ctri_number: 'CTRI/2024/03/063890',
    iec_approval_date: '2024-02-28',
    iec_expiry_date: '2025-02-27',
    description: 'Assessment of immunomodulatory biomarkers (IgG, T-cell subsets) following aqueous Guduchi Ghanavati therapy.',
    sites_count: 4,
    sae_count: 2,
    alerts_count: 3
  },
  {
    id: 5,
    study_code: 'AIIA-CT-2024-005',
    title: 'Shatavari (Asparagus racemosus) Granules in Perimenopausal Symptom Management',
    phase: 'PHASE_3',
    status: 'DATA_CLEANING',
    risk_level: 'LOW',
    risk_score: 22,
    therapeutic_area: 'Gynecology & Women Health',
    target_sample_size: 400,
    enrolled_count: 395,
    pi_name: 'Dr. Radhika Iyer',
    start_date: '2023-05-15',
    estimated_end_date: '2024-11-30',
    protocol_version: '3.0',
    ctri_number: 'CTRI/2023/04/052190',
    iec_approval_date: '2023-03-22',
    iec_expiry_date: '2024-03-21',
    description: 'Multicenter randomized trial evaluating Greene Climacteric Scale scores and hormonal profiles.',
    sites_count: 7,
    sae_count: 1,
    alerts_count: 0
  },
  {
    id: 6,
    study_code: 'AIIA-CT-2024-006',
    title: 'Neem & Haridra Topically in Plaque Psoriasis (Ekakustha)',
    phase: 'PHASE_2',
    status: 'SITE_ACTIVATED',
    risk_level: 'CRITICAL',
    risk_score: 88,
    therapeutic_area: 'Dermatology',
    target_sample_size: 180,
    enrolled_count: 12,
    pi_name: 'Dr. Arvind Joshi',
    start_date: '2024-06-01',
    estimated_end_date: '2025-12-15',
    protocol_version: '1.2',
    ctri_number: 'CTRI/2024/05/065102',
    iec_approval_date: '2024-04-18',
    iec_expiry_date: '2025-04-17',
    description: 'Investigating PASI (Psoriasis Area Severity Index) reduction with topical polyherbal microemulsion.',
    sites_count: 3,
    sae_count: 4,
    alerts_count: 5
  },
  {
    id: 7,
    study_code: 'AIIA-CT-2024-007',
    title: 'Curcumin-Piperine Nanoformulation for Osteoarthritis Knee Pain (Sandhigatavata)',
    phase: 'PHASE_3',
    status: 'ENROLLMENT',
    risk_level: 'MEDIUM',
    risk_score: 42,
    therapeutic_area: 'Rheumatology / Orthopedics',
    target_sample_size: 350,
    enrolled_count: 280,
    pi_name: 'Dr. Sanjay Bhattacharya',
    start_date: '2023-10-01',
    estimated_end_date: '2025-03-31',
    protocol_version: '2.5',
    ctri_number: 'CTRI/2023/09/058204',
    iec_approval_date: '2023-08-14',
    iec_expiry_date: '2024-08-13',
    description: 'Double-blind active-comparator (Celecoxib) trial measuring WOMAC index and synovial fluid inflammatory cytokines.',
    sites_count: 6,
    sae_count: 0,
    alerts_count: 1
  }
];

export const MOCK_DASHBOARD_SUMMARY = {
  kpis: {
    total_studies: 7,
    active_studies: 6,
    total_participants: 1247,
    total_enrolled: 1247,
    total_target: 2180,
    enrollment_pct: 57.2,
    total_sae: 11,
    overdue_sae: 2,
    total_alerts: 12,
  },
  risk_distribution: {
    LOW: 3,
    MEDIUM: 2,
    HIGH: 1,
    CRITICAL: 1,
  },
  safety: {
    total_ae: 48,
    total_sae: 11,
    open_sae: 4,
    overdue_sae: 2,
  },
  compliance: {
    iec_due: 3,
    ctri_due: 1,
    monitoring_due: 4,
  },
  alerts_breakdown: {
    SAFETY: 4,
    COMPLIANCE: 3,
    RECRUITMENT: 3,
    DATA_QUALITY: 2,
  },
};

export const MOCK_ENROLLMENT_TREND = [
  { study_code: 'AIIA-001', target: 500, enrolled: 412, name: 'Triphala Metabolic' },
  { study_code: 'AIIA-002', target: 300, enrolled: 145, name: 'Ashwagandha Diabetes' },
  { study_code: 'AIIA-003', target: 250, enrolled: 250, name: 'Brahmi Cognition' },
  { study_code: 'AIIA-004', target: 200, enrolled: 38, name: 'Guduchi Immunity' },
  { study_code: 'AIIA-005', target: 400, enrolled: 395, name: 'Shatavari Perimenopause' },
  { study_code: 'AIIA-006', target: 180, enrolled: 12, name: 'Neem-Haridra Psoriasis' },
  { study_code: 'AIIA-007', target: 350, enrolled: 280, name: 'Curcumin Osteoarthritis' },
];

export const MOCK_ALERTS = [
  {
    id: 1,
    type: 'SAFETY',
    severity: 'CRITICAL',
    title: 'SAE Reporting Window Expiring (14-hr CDSCO Deadline)',
    message: 'Subject AIIA-006-P012 reported severe exfoliative dermatitis at AIIA Jaipur site. Expedited 24-hr initial report pending submission to CDSCO and IEC.',
    study_id: 6,
    created_at: '2024-09-29T14:30:00Z',
    status: 'OPEN'
  },
  {
    id: 2,
    type: 'COMPLIANCE',
    severity: 'CRITICAL',
    title: 'Ethics Committee Approval Expired',
    message: 'IEC approval for Study AIIA-CT-2024-003 expired on 2024-06-14. Annual continuing review report overdue.',
    study_id: 3,
    created_at: '2024-09-28T09:15:00Z',
    status: 'OPEN'
  },
  {
    id: 3,
    type: 'RECRUITMENT',
    severity: 'WARNING',
    title: 'Recruitment Lag (>40% below projected milestone)',
    message: 'Study AIIA-CT-2024-004 has enrolled only 38 of 200 participants (19%) after 5 months of activation.',
    study_id: 4,
    created_at: '2024-09-27T11:00:00Z',
    status: 'OPEN'
  },
  {
    id: 4,
    type: 'MONITORING',
    severity: 'WARNING',
    title: 'Routine Monitoring Visit Overdue',
    message: 'Site AIIA Pune has not completed its Q3 monitoring visit. Last visit recorded 112 days ago.',
    study_id: 2,
    created_at: '2024-09-26T16:45:00Z',
    status: 'OPEN'
  },
  {
    id: 5,
    type: 'SAFETY',
    severity: 'WARNING',
    title: 'Grade 3 Transaminitis Cluster Detected',
    message: 'Pharmacovigilance automated surveillance detected 3 elevated ALT/AST events in Cohort B of AIIA-002.',
    study_id: 2,
    created_at: '2024-09-25T10:20:00Z',
    status: 'OPEN'
  }
];

export const MOCK_SAFETY_AES = [
  {
    id: 101,
    study_code: 'AIIA-CT-2024-006',
    study_id: 6,
    participant_code: 'P-006-012',
    term: 'Severe Exfoliative Dermatitis',
    meddra_pt: 'Dermatitis exfoliative generalised',
    meddra_soc: 'Skin and subcutaneous tissue disorders',
    severity: 'GRADE_4',
    is_serious: true,
    sae_criteria: 'HOSPITALIZATION',
    causality: 'PROBABLE',
    outcome: 'RECOVERING',
    cdsco_reported: false,
    cdsco_report_due: '2024-09-30T18:00:00Z',
    onset_date: '2024-09-28',
    status: 'UNDER_INVESTIGATION'
  },
  {
    id: 102,
    study_code: 'AIIA-CT-2024-002',
    study_id: 2,
    participant_code: 'P-002-088',
    term: 'Acute Hepatic Enzyme Elevation (ALT > 5x ULN)',
    meddra_pt: 'Alanine aminotransferase increased',
    meddra_soc: 'Hepatobiliary disorders',
    severity: 'GRADE_3',
    is_serious: true,
    sae_criteria: 'MEDICALLY_SIGNIFICANT',
    causality: 'POSSIBLE',
    outcome: 'RESOLVED',
    cdsco_reported: true,
    cdsco_report_due: '2024-09-15T00:00:00Z',
    onset_date: '2024-09-12',
    status: 'SUBMITTED_TO_CDSCO'
  },
  {
    id: 103,
    study_code: 'AIIA-CT-2024-001',
    study_id: 1,
    participant_code: 'P-001-204',
    term: 'Mild Abdominal Cramping & Loose Stools',
    meddra_pt: 'Abdominal pain upper',
    meddra_soc: 'Gastrointestinal disorders',
    severity: 'GRADE_1',
    is_serious: false,
    sae_criteria: 'NONE',
    causality: 'PROBABLE',
    outcome: 'RESOLVED',
    cdsco_reported: false,
    onset_date: '2024-09-20',
    status: 'CLOSED'
  },
  {
    id: 104,
    study_code: 'AIIA-CT-2024-004',
    study_id: 4,
    participant_code: 'P-004-019',
    term: 'Moderate Bronchospasm requiring Nebulization',
    meddra_pt: 'Bronchospasm',
    meddra_soc: 'Respiratory, thoracic and mediastinal disorders',
    severity: 'GRADE_2',
    is_serious: false,
    sae_criteria: 'NONE',
    causality: 'UNLIKELY',
    outcome: 'RESOLVED',
    cdsco_reported: false,
    onset_date: '2024-09-18',
    status: 'RESOLVED'
  }
];

export const MOCK_SITES = [
  { id: 1, name: 'AIIA Main Campus, New Delhi', code: 'SITE-01', location: 'Sarita Vihar, New Delhi', pi_name: 'Dr. Rajesh Sharma', active_studies: 6, enrolled_patients: 480, status: 'ACTIVE', monitoring_compliance: 98 },
  { id: 2, name: 'National Institute of Ayurveda (NIA), Jaipur', code: 'SITE-02', location: 'Jaipur, Rajasthan', pi_name: 'Dr. Ananya Mishra', active_studies: 4, enrolled_patients: 290, status: 'ACTIVE', monitoring_compliance: 88 },
  { id: 3, name: 'Institute of Post Graduate Teaching & Research in Ayurveda (IPGTRA), Jamnagar', code: 'SITE-03', location: 'Jamnagar, Gujarat', pi_name: 'Dr. Sunil K. Varma', active_studies: 5, enrolled_patients: 310, status: 'ACTIVE', monitoring_compliance: 94 },
  { id: 4, name: 'Government Ayurvedic College & Hospital, Varanasi', code: 'SITE-04', location: 'Varanasi, UP', pi_name: 'Dr. Sanjay Bhattacharya', active_studies: 3, enrolled_patients: 167, status: 'ACTIVE', monitoring_compliance: 79 },
];

export const MOCK_PARTICIPANTS = [
  { id: 1, participant_code: 'P-001-001', study_code: 'AIIA-CT-2024-001', site_name: 'AIIA New Delhi', age: 48, gender: 'Male', status: 'ON_TREATMENT', visit_completed: 'Visit 4 / 6', ae_count: 0, compliance_pct: 98 },
  { id: 2, participant_code: 'P-001-002', study_code: 'AIIA-CT-2024-001', site_name: 'AIIA New Delhi', age: 52, gender: 'Female', status: 'ON_TREATMENT', visit_completed: 'Visit 4 / 6', ae_count: 1, compliance_pct: 95 },
  { id: 3, participant_code: 'P-002-014', study_code: 'AIIA-CT-2024-002', site_name: 'NIA Jaipur', age: 59, gender: 'Male', status: 'SCREENED', visit_completed: 'Screening', ae_count: 0, compliance_pct: 100 },
  { id: 4, participant_code: 'P-003-089', study_code: 'AIIA-CT-2024-003', site_name: 'IPGTRA Jamnagar', age: 67, gender: 'Female', status: 'COMPLETED', visit_completed: 'Visit 8 / 8 (Final)', ae_count: 0, compliance_pct: 100 },
  { id: 5, participant_code: 'P-006-012', study_code: 'AIIA-CT-2024-006', site_name: 'NIA Jaipur', age: 41, gender: 'Male', status: 'WITHDRAWN_AE', visit_completed: 'Visit 2 (Discontinued)', ae_count: 1, compliance_pct: 82 },
];

export const MOCK_COMPLIANCE = {
  iecApprovals: [
    { id: 1, study_code: 'AIIA-CT-2024-001', committee_name: 'Institutional Ethics Committee - AIIA Delhi', approval_number: 'IEC/AIIA/2023/11-20', approval_date: '2023-11-20', expiry_date: '2024-11-19', status: 'APPROVED', days_to_expiry: 50 },
    { id: 2, study_code: 'AIIA-CT-2024-002', committee_name: 'Ethics Committee - NIA Jaipur', approval_number: 'EC/NIA/2024/01-10', approval_date: '2024-01-10', expiry_date: '2025-01-09', status: 'APPROVED', days_to_expiry: 101 },
    { id: 3, study_code: 'AIIA-CT-2024-003', committee_name: 'IEC - IPGTRA Jamnagar', approval_number: 'IEC/IPGT/2023/06-15', approval_date: '2023-06-15', expiry_date: '2024-06-14', status: 'EXPIRED', days_to_expiry: -108 },
    { id: 4, study_code: 'AIIA-CT-2024-004', committee_name: 'IEC - AIIA Delhi', approval_number: 'IEC/AIIA/2024/02-28', approval_date: '2024-02-28', expiry_date: '2025-02-27', status: 'APPROVED', days_to_expiry: 150 },
  ],
  ctriRecords: [
    { id: 1, study_code: 'AIIA-CT-2024-001', ctri_number: 'CTRI/2024/01/061204', registration_date: '2024-01-15', last_updated: '2024-07-20', status: 'REGISTERED', audit_status: 'COMPLIANT' },
    { id: 2, study_code: 'AIIA-CT-2024-002', ctri_number: 'CTRI/2024/02/062118', registration_date: '2024-02-12', last_updated: '2024-08-10', status: 'REGISTERED', audit_status: 'COMPLIANT' },
    { id: 3, study_code: 'AIIA-CT-2024-003', ctri_number: 'CTRI/2023/07/055412', registration_date: '2023-07-28', last_updated: '2024-01-14', status: 'UPDATE_DUE', audit_status: 'ACTION_REQUIRED' },
  ],
  monitoringVisits: [
    { id: 1, study_code: 'AIIA-CT-2024-001', site_name: 'AIIA New Delhi', monitor_name: 'Anita Patel', visit_type: 'ROUTINE_MONITORING', scheduled_date: '2024-09-10', completed_date: '2024-09-10', findings_count: 2, status: 'COMPLETED' },
    { id: 2, study_code: 'AIIA-CT-2024-002', site_name: 'NIA Jaipur', monitor_name: 'Anita Patel', visit_type: 'FOR_CAUSE_MONITORING', scheduled_date: '2024-10-05', completed_date: null, findings_count: 0, status: 'SCHEDULED' },
    { id: 3, study_code: 'AIIA-CT-2024-006', site_name: 'Govt Ayu College Varanasi', monitor_name: 'Rohit Gupta', visit_type: 'SITE_INITIATION', scheduled_date: '2024-09-01', completed_date: null, findings_count: 0, status: 'OVERDUE' },
  ]
};

export const MOCK_AUDIT_LOGS = [
  { id: 1, timestamp: '2024-09-29T18:14:22Z', user_name: 'Dr. Rajesh Sharma', action: 'EXPORT_STUDY_DATA', entity: 'Study', record_id: 'AIIA-001', sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', valid: true },
  { id: 2, timestamp: '2024-09-29T14:31:05Z', user_name: 'Dr. Suresh Nair', action: 'CREATE_SAE_RECORD', entity: 'AdverseEvent', record_id: 'AE-101', sha256_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', valid: true },
  { id: 3, timestamp: '2024-09-29T10:02:18Z', user_name: 'Pooja Verma', action: 'ENROLL_PARTICIPANT', entity: 'Participant', record_id: 'P-001-204', sha256_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', valid: true },
  { id: 4, timestamp: '2024-09-28T16:40:55Z', user_name: 'Dr. Ananya Mishra', action: 'UPDATE_PROTOCOL_VERSION', entity: 'Study', record_id: 'AIIA-002', sha256_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', valid: true },
  { id: 5, timestamp: '2024-09-28T11:20:10Z', user_name: 'System Monitor', action: 'GENERATE_AUTOMATED_ALERT', entity: 'Alert', record_id: 'ALT-002', sha256_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', valid: true },
];

export const MOCK_FHIR_BUNDLE = {
  resourceType: 'Bundle',
  type: 'collection',
  id: 'aiia-ctms-fhir-bundle-2024',
  total: 7,
  entry: MOCK_STUDIES.map(s => ({
    fullUrl: `urn:uuid:aiia-research-study-${s.id}`,
    resource: {
      resourceType: 'ResearchStudy',
      id: `aiia-rs-${s.id}`,
      identifier: [{ system: 'http://ctri.nic.in', value: s.ctri_number }],
      title: s.title,
      status: s.status.toLowerCase(),
      phase: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/research-study-phase', code: s.phase.toLowerCase() }] },
      category: [{ text: s.therapeutic_area }],
      principalInvestigator: { display: s.pi_name },
      enrollment: [{ display: `${s.enrolled_count} / ${s.target_sample_size} enrolled` }],
    }
  }))
};
