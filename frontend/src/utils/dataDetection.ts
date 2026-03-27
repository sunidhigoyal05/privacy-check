/**
 * Client-side data detection utility
 * Analyzes sample data to detect PII patterns, data types, and infer regulations/safeguards
 * All processing happens locally - no external API calls
 */

export interface DetectionResult {
  dataTypes: { type: string; confidence: number; evidence: string[] }[];
  dataSubjects: { subject: string; confidence: number; reason: string }[];
  suggestedRegulations: { regulation: string; reason: string }[];
  recommendedSafeguards: { safeguard: string; priority: 'high' | 'medium' | 'low'; reason: string }[];
  riskIndicators: string[];
  summary: string;
}

// Regex patterns for PII detection
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  date: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g,
  currency: /\$[\d,]+\.?\d*|\€[\d,]+\.?\d*|[\d,]+\.?\d*\s*(USD|EUR|GBP)/gi,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  nationalId: /\b[A-Z]{0,3}\d{6,12}\b/g,
};

// Column header keywords mapping to data types
const HEADER_MAPPINGS: Record<string, string[]> = {
  pii: ['name', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'address', 'ssn', 'social_security', 'passport', 'id_number', 'national_id', 'identity', 'person'],
  financial: ['salary', 'income', 'bank', 'account', 'credit', 'debit', 'payment', 'transaction', 'amount', 'price', 'cost', 'revenue', 'balance', 'wage', 'compensation'],
  health: ['health', 'medical', 'diagnosis', 'treatment', 'medication', '病', 'doctor', 'patient', 'hospital', 'clinic', 'symptom', 'disease', 'condition', 'disability', 'blood', 'allergy'],
  biometric: ['fingerprint', 'face', 'facial', 'iris', 'retina', 'voice', 'biometric', 'dna', 'genetic'],
  location: ['location', 'address', 'city', 'country', 'zip', 'postal', 'gps', 'latitude', 'longitude', 'lat', 'lng', 'coordinates', 'geo'],
  behavioral: ['behavior', 'activity', 'usage', 'click', 'visit', 'session', 'action', 'event', 'preference', 'history', 'log'],
  demographic: ['age', 'gender', 'sex', 'race', 'ethnicity', 'religion', 'nationality', 'language', 'birth', 'dob', 'date_of_birth', 'marital'],
  education: ['education', 'school', 'university', 'degree', 'grade', 'gpa', 'student', 'course', 'qualification', 'certificate'],
  employment: ['employer', 'company', 'job', 'title', 'position', 'department', 'hire', 'employee', 'work', 'occupation', 'role'],
  communications: ['email', 'message', 'chat', 'sms', 'call', 'phone', 'contact', 'communication'],
};

// Keywords suggesting specific data subjects
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  employees: ['employee', 'staff', 'worker', 'team', 'hr', 'payroll', 'department', 'manager', 'hire_date', 'termination'],
  minors: ['child', 'minor', 'kid', 'student', 'age', 'parent', 'guardian', 'school', 'grade'],
  citizens: ['citizen', 'resident', 'population', 'public', 'voter', 'taxpayer'],
  beneficiaries: ['beneficiary', 'recipient', 'applicant', 'client', 'program', 'aid', 'assistance', 'grant'],
  refugees: ['refugee', 'displaced', 'asylum', 'migrant', 'immigration', 'unhcr'],
  vulnerable: ['vulnerable', 'disability', 'elderly', 'senior', 'low_income', 'poverty'],
  government: ['official', 'minister', 'government', 'civil_servant', 'public_sector'],
  partners: ['partner', 'organization', 'ngo', 'institution', 'agency'],
  contractors: ['contractor', 'vendor', 'supplier', 'consultant', 'freelancer'],
};

// Data type to regulation mapping
const REGULATION_RULES: Record<string, { regulations: string[]; reason: string }> = {
  health: { regulations: ['hipaa', 'gdpr'], reason: 'Health data requires strict protection under healthcare privacy laws' },
  financial: { regulations: ['gdpr', 'ccpa'], reason: 'Financial data often subject to consumer protection regulations' },
  biometric: { regulations: ['gdpr', 'ccpa', 'local-laws'], reason: 'Biometric data is classified as sensitive under most privacy frameworks' },
  minors: { regulations: ['gdpr', 'ccpa', 'local-laws'], reason: 'Data about children requires parental consent and additional protections' },
  employees: { regulations: ['gdpr', 'wbg-policy', 'local-laws'], reason: 'Employee data protected under workplace privacy regulations' },
  pii: { regulations: ['gdpr', 'ccpa', 'wbg-policy'], reason: 'Personal identifiers require baseline privacy protections' },
  location: { regulations: ['gdpr', 'ccpa'], reason: 'Location tracking is considered sensitive personal data' },
};

// Data type to safeguard mapping
const SAFEGUARD_RULES: Record<string, { safeguards: string[]; priority: 'high' | 'medium' | 'low' }[]> = {
  pii: [
    { safeguards: ['encryption-transit', 'encryption-rest', 'access-controls'], priority: 'high' },
    { safeguards: ['audit-trail', 'retention-policy'], priority: 'medium' },
  ],
  health: [
    { safeguards: ['encryption-transit', 'encryption-rest', 'access-controls', 'audit-trail'], priority: 'high' },
    { safeguards: ['dpia', 'incident-response', 'training'], priority: 'high' },
  ],
  financial: [
    { safeguards: ['encryption-transit', 'encryption-rest', 'access-controls', 'audit-trail'], priority: 'high' },
    { safeguards: ['incident-response', 'vendor-assessment'], priority: 'medium' },
  ],
  biometric: [
    { safeguards: ['encryption-rest', 'access-controls', 'dpia'], priority: 'high' },
    { safeguards: ['consent-management', 'retention-policy'], priority: 'high' },
  ],
  minors: [
    { safeguards: ['consent-management', 'access-controls', 'dpia'], priority: 'high' },
    { safeguards: ['training', 'retention-policy'], priority: 'medium' },
  ],
};

/**
 * Parse input data (CSV, JSON, or plain text)
 */
function parseInput(input: string): { headers: string[]; rows: string[][]; rawText: string } {
  const trimmed = input.trim();
  
  // Try JSON
  try {
    const json = JSON.parse(trimmed);
    if (Array.isArray(json) && json.length > 0) {
      const headers = Object.keys(json[0]);
      const rows = json.map(obj => headers.map(h => String(obj[h] ?? '')));
      return { headers, rows, rawText: trimmed };
    }
  } catch {}

  // Try CSV
  const lines = trimmed.split('\n').filter(l => l.trim());
  if (lines.length > 1) {
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows = lines.slice(1).map(line => line.split(delimiter).map(cell => cell.trim().replace(/['"]/g, '')));
    return { headers, rows, rawText: trimmed };
  }

  // Plain text
  return { headers: [], rows: [], rawText: trimmed };
}

/**
 * Detect PII patterns in text
 */
function detectPatterns(text: string): Map<string, string[]> {
  const found = new Map<string, string[]>();
  
  for (const [name, pattern] of Object.entries(PATTERNS)) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      found.set(name, [...new Set(matches)].slice(0, 5)); // Keep up to 5 examples
    }
  }
  
  return found;
}

/**
 * Detect data types from headers
 */
function detectFromHeaders(headers: string[]): Map<string, string[]> {
  const detected = new Map<string, string[]>();
  
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');
    
    for (const [dataType, keywords] of Object.entries(HEADER_MAPPINGS)) {
      for (const keyword of keywords) {
        if (normalizedHeader.includes(keyword.replace(/[_\s-]/g, ''))) {
          const existing = detected.get(dataType) || [];
          if (!existing.includes(header)) {
            detected.set(dataType, [...existing, header]);
          }
          break;
        }
      }
    }
  }
  
  return detected;
}

/**
 * Infer data subjects from headers and content
 */
function inferDataSubjects(headers: string[], text: string): Map<string, string> {
  const subjects = new Map<string, string>();
  const combined = [...headers, text.toLowerCase()].join(' ');
  
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        subjects.set(subject, `Contains keyword: "${keyword}"`);
        break;
      }
    }
  }
  
  // Default if salary/employee-like data detected
  if (subjects.size === 0 && headers.some(h => ['salary', 'department', 'hire', 'employee'].some(k => h.includes(k)))) {
    subjects.set('employees', 'Employment-related fields detected');
  }
  
  return subjects;
}

/**
 * Main detection function
 */
export function analyzeData(input: string): DetectionResult {
  if (!input.trim()) {
    return {
      dataTypes: [],
      dataSubjects: [],
      suggestedRegulations: [],
      recommendedSafeguards: [],
      riskIndicators: [],
      summary: 'No data provided for analysis.',
    };
  }

  const { headers, rows, rawText } = parseInput(input);
  const allText = rows.flat().join(' ') + ' ' + rawText;
  
  // Detect patterns
  const patterns = detectPatterns(allText);
  const headerTypes = detectFromHeaders(headers);
  const subjects = inferDataSubjects(headers, allText);
  
  // Build data types result
  const dataTypeMap = new Map<string, { confidence: number; evidence: string[] }>();
  
  // From patterns
  if (patterns.has('email') || patterns.has('phone') || patterns.has('ssn') || patterns.has('passport')) {
    dataTypeMap.set('pii', { confidence: 0.95, evidence: [] });
  }
  if (patterns.has('email')) dataTypeMap.get('pii')?.evidence.push('Email addresses detected');
  if (patterns.has('phone')) dataTypeMap.get('pii')?.evidence.push('Phone numbers detected');
  if (patterns.has('ssn')) dataTypeMap.get('pii')?.evidence.push('SSN-like patterns detected');
  if (patterns.has('creditCard')) {
    dataTypeMap.set('financial', { confidence: 0.9, evidence: ['Credit card numbers detected'] });
  }
  if (patterns.has('currency')) {
    const existing = dataTypeMap.get('financial') || { confidence: 0.8, evidence: [] };
    existing.evidence.push('Currency values detected');
    dataTypeMap.set('financial', existing);
  }
  if (patterns.has('date')) {
    // Dates often indicate demographic data
    dataTypeMap.set('demographic', { confidence: 0.6, evidence: ['Date fields detected (possible DOB)'] });
  }
  if (patterns.has('ipAddress')) {
    dataTypeMap.set('behavioral', { confidence: 0.7, evidence: ['IP addresses detected'] });
  }
  
  // From headers
  for (const [dataType, matchedHeaders] of headerTypes) {
    const existing = dataTypeMap.get(dataType) || { confidence: 0.85, evidence: [] };
    existing.evidence.push(`Column headers: ${matchedHeaders.join(', ')}`);
    existing.confidence = Math.max(existing.confidence, 0.85);
    dataTypeMap.set(dataType, existing);
  }
  
  const dataTypes = Array.from(dataTypeMap.entries()).map(([type, data]) => ({
    type,
    confidence: data.confidence,
    evidence: data.evidence,
  }));
  
  // Build data subjects
  const dataSubjects = Array.from(subjects.entries()).map(([subject, reason]) => ({
    subject,
    confidence: 0.75,
    reason,
  }));
  
  // Infer regulations
  const regulationSet = new Map<string, string>();
  for (const dt of dataTypes) {
    const rules = REGULATION_RULES[dt.type];
    if (rules) {
      for (const reg of rules.regulations) {
        if (!regulationSet.has(reg)) {
          regulationSet.set(reg, rules.reason);
        }
      }
    }
  }
  for (const ds of dataSubjects) {
    const rules = REGULATION_RULES[ds.subject];
    if (rules) {
      for (const reg of rules.regulations) {
        if (!regulationSet.has(reg)) {
          regulationSet.set(reg, rules.reason);
        }
      }
    }
  }
  
  const suggestedRegulations = Array.from(regulationSet.entries()).map(([regulation, reason]) => ({
    regulation,
    reason,
  }));
  
  // Recommend safeguards
  const safeguardMap = new Map<string, { priority: 'high' | 'medium' | 'low'; reason: string }>();
  
  for (const dt of dataTypes) {
    const rules = SAFEGUARD_RULES[dt.type];
    if (rules) {
      for (const rule of rules) {
        for (const sg of rule.safeguards) {
          const existing = safeguardMap.get(sg);
          if (!existing || (rule.priority === 'high' && existing.priority !== 'high')) {
            safeguardMap.set(sg, { priority: rule.priority, reason: `Required for ${dt.type} data` });
          }
        }
      }
    }
  }
  
  // Add child-specific safeguards
  if (dataSubjects.some(ds => ds.subject === 'minors')) {
    const childRules = SAFEGUARD_RULES['minors'];
    if (childRules) {
      for (const rule of childRules) {
        for (const sg of rule.safeguards) {
          safeguardMap.set(sg, { priority: rule.priority, reason: 'Required for data about minors' });
        }
      }
    }
  }
  
  const recommendedSafeguards = Array.from(safeguardMap.entries()).map(([safeguard, data]) => ({
    safeguard,
    priority: data.priority,
    reason: data.reason,
  })).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Risk indicators
  const riskIndicators: string[] = [];
  if (patterns.has('ssn')) riskIndicators.push('High-sensitivity identifiers (SSN) detected');
  if (patterns.has('creditCard')) riskIndicators.push('Payment card data detected - PCI-DSS may apply');
  if (dataTypes.some(dt => dt.type === 'health')) riskIndicators.push('Health data requires special category protections');
  if (dataTypes.some(dt => dt.type === 'biometric')) riskIndicators.push('Biometric data is often irreversible if compromised');
  if (dataSubjects.some(ds => ds.subject === 'minors')) riskIndicators.push('Children\'s data requires parental consent mechanisms');
  if (rows.length > 1000) riskIndicators.push('Large dataset - consider data minimization');
  
  // Summary
  const typeNames = dataTypes.map(dt => dt.type).join(', ') || 'unknown types';
  const subjectNames = dataSubjects.map(ds => ds.subject).join(', ') || 'unidentified subjects';
  const summary = dataTypes.length > 0
    ? `Detected ${dataTypes.length} data type(s) (${typeNames}) likely related to ${subjectNames}. ${riskIndicators.length > 0 ? `${riskIndicators.length} risk indicator(s) identified.` : ''}`
    : 'Could not automatically detect data types. Please review manually or provide more structured data.';

  return {
    dataTypes,
    dataSubjects,
    suggestedRegulations,
    recommendedSafeguards,
    riskIndicators,
    summary,
  };
}

/**
 * Map detection results to wizard field values
 */
export function mapToWizardFields(result: DetectionResult) {
  return {
    data_types: result.dataTypes.map(dt => dt.type),
    data_subjects: result.dataSubjects.map(ds => ds.subject),
    regulatory_frameworks: result.suggestedRegulations.map(r => r.regulation),
    existing_safeguards: [] as string[], // Don't pre-fill - these are what user HAS, not what's recommended
  };
}
