// Sheet 1: Assessment Template
// Exact fields: Survey Ref No, Policy Type, Insured Name, Vehicle Age Category,
// Policy Number, Date of Inspection, Vehicle Make/Model, Workshop Name & Location
// Parts table: Sl No, HSN/SAC Code, Description, Part Type, Coverage Type,
//              Gross Estimate, Base Dep%, Applied Dep%, Depreciation Amt, Net Part Assessment
// Labour: SAC 997132 labour, Gross Claim Base, Salvage Deduction, Excess Deductible, Net Liability

import React, { useState, useCallback } from 'react';
import styles from './AssessmentTemplate.module.css';

const VEHICLE_AGE_OPTIONS = [
  'Not exceeding 6 months',
  'Exceeding 6 months up to 1 year',
  'Exceeding 1 year up to 2 years',
  'Exceeding 2 years up to 3 years',
  'Exceeding 3 years up to 4 years',
  'Exceeding 4 years up to 5 years',
  'Exceeding 5 years up to 10 years',
  'Exceeding 10 years',
];

const POLICY_TYPE_OPTIONS = ['Regular', 'Nil-Depreciation'];

const PART_TYPE_OPTIONS = ['Glass', 'Plastic', 'Rubber', 'Fiber Glass', 'Metal'];

const COVERAGE_TYPE_OPTIONS = ['Standard Policy', 'Nil-Dep Policy', 'Not Covered'];

function getBaseDep(partType, vehicleAge) {
  if (partType === 'Glass') return 0;
  if (partType === 'Plastic' || partType === 'Rubber') return 0.5;
  if (partType === 'Fiber Glass') return 0.3;
  if (partType === 'Metal') {
    const map = {
      'Not exceeding 6 months': 0,
      'Exceeding 6 months up to 1 year': 0.05,
      'Exceeding 1 year up to 2 years': 0.1,
      'Exceeding 2 years up to 3 years': 0.15,
      'Exceeding 3 years up to 4 years': 0.25,
      'Exceeding 4 years up to 5 years': 0.35,
      'Exceeding 5 years up to 10 years': 0.4,
      'Exceeding 10 years': 0.5,
    };
    return map[vehicleAge] ?? 0.5;
  }
  return 0;
}

function getAppliedDep(coverageType, policyType, baseDep) {
  if (coverageType === 'Not Covered') return 1;
  if (policyType === 'Nil-Depreciation') return 0;
  return baseDep;
}

function calcRow(row, policyType, vehicleAge) {
  const gross = parseFloat(row.grossEstimate) || 0;
  const baseDep = getBaseDep(row.partType, vehicleAge);
  const appliedDep = getAppliedDep(row.coverageType, policyType, baseDep);
  const depAmt = gross * appliedDep;
  const netPart = row.coverageType === 'Not Covered' ? 0 : gross - depAmt;
  return { baseDep, appliedDep, depAmt, netPart };
}

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  hsnCode: '',
  description: '',
  partType: 'Metal',
  coverageType: 'Standard Policy',
  grossEstimate: '',
});

const defaultRows = [
  { id: 1, hsnCode: '87081010', description: 'Front Bumper Assembly', partType: 'Plastic', coverageType: 'Standard Policy', grossEstimate: '8500' },
  { id: 2, hsnCode: '87082900', description: 'Bonnet Shell Outer Panel', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '14500' },
  { id: 3, hsnCode: '70071100', description: 'Windshield Glass Pack', partType: 'Glass', coverageType: 'Standard Policy', grossEstimate: '6200' },
  { id: 4, hsnCode: '87089100', description: 'Radiator Assembly Set', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '9800' },
  { id: 5, hsnCode: '40169390', description: 'Engine Mounting Rubber Apron', partType: 'Rubber', coverageType: 'Standard Policy', grossEstimate: '3200' },
  { id: 6, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
  { id: 7, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
  { id: 8, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
];

export default function AssessmentTemplate({ formData, onChange }) {
  const header = formData.header;
  const parts = formData.parts;
  const labour = formData.labour;

  const setHeader = (field, value) => onChange('header', { ...header, [field]: value });
  const setLabour = (field, value) => onChange('labour', { ...labour, [field]: value });

  const setPart = useCallback((idx, field, value) => {
    const updated = parts.map((r, i) => i === idx ? { ...r, [field]: value } : r);
    onChange('parts', updated);
  }, [parts, onChange]);

  const addRow = () => onChange('parts', [...parts, emptyRow()]);
  const removeRow = (idx) => onChange('parts', parts.filter((_, i) => i !== idx));

  // Compute per-row calculated values
  const computed = parts.map(row => calcRow(row, header.policyType, header.vehicleAgeCategory));

  // Totals
  const totalGross = parts.reduce((s, r) => s + (parseFloat(r.grossEstimate) || 0), 0);
  const totalDepAmt = computed.reduce((s, c) => s + c.depAmt, 0);
  const totalNet = computed.reduce((s, c) => s + c.netPart, 0);

  const labourAmt = parseFloat(labour.labourAmount) || 0;
  const salvageAmt = parseFloat(labour.salvageDeduction) || 0;
  const excessAmt = parseFloat(labour.excessDeductible) || 0;
  const grossClaim = totalNet + labourAmt;
  const netLiability = grossClaim - salvageAmt - excessAmt;

  const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (n) => (n * 100).toFixed(0) + '%';

  return (
    <div className={styles.sheet}>
      <div className={styles.sheetTitle}>AUTOMATED MOTOR SURVEY ASSESSOR TOOL</div>

      {/* Section 1 */}
      <div className={styles.sectionLabel}>1. COVERAGE PROFILE, VEHICLE AGE &amp; INSURED DETAILS</div>
      <div className={styles.headerGrid}>
        <div className={styles.fieldGroup}>
          <label>Survey Reference No:</label>
          <input value={header.surveyRefNo} onChange={e => setHeader('surveyRefNo', e.target.value)} placeholder="e.g. SRV/2026/0894" />
        </div>
        <div className={styles.fieldGroup}>
          <label>Policy Type (Regular/Nil-Dep):</label>
          <select value={header.policyType} onChange={e => setHeader('policyType', e.target.value)}>
            {POLICY_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label>Insured Name:</label>
          <input value={header.insuredName} onChange={e => setHeader('insuredName', e.target.value)} placeholder="Full name" />
        </div>
        <div className={styles.fieldGroup}>
          <label>Vehicle Age Category:</label>
          <select value={header.vehicleAgeCategory} onChange={e => setHeader('vehicleAgeCategory', e.target.value)}>
            {VEHICLE_AGE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label>Policy Number:</label>
          <input value={header.policyNumber} onChange={e => setHeader('policyNumber', e.target.value)} placeholder="e.g. POL-994827-01" />
        </div>
        <div className={styles.fieldGroup}>
          <label>Date of Inspection:</label>
          <input type="date" value={header.dateOfInspection} onChange={e => setHeader('dateOfInspection', e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Vehicle Make / Model:</label>
          <input value={header.vehicleMakeModel} onChange={e => setHeader('vehicleMakeModel', e.target.value)} placeholder="e.g. Mahindra Scorpio-N Z8L" />
        </div>
        <div className={styles.fieldGroup}>
          <label>Workshop Name &amp; Location:</label>
          <input value={header.workshopNameLocation} onChange={e => setHeader('workshopNameLocation', e.target.value)} placeholder="Workshop name, city" />
        </div>
      </div>

      {/* Section 2 */}
      <div className={styles.sectionLabel}>2. ITEMIZED PARTS SCHEDULING (AUTOMATIC AGE DEPRECIATION MATRIX)</div>
      <div className={styles.tableWrap}>
        <table className={styles.partsTable}>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>HSN / SAC Code</th>
              <th>Description of Damaged Part</th>
              <th>Part Type</th>
              <th>Coverage Type</th>
              <th>Gross Estimate (₹)</th>
              <th>Base Dep %</th>
              <th>Applied Dep %</th>
              <th>Depreciation Amt (₹)</th>
              <th>Net Part Assessment (₹)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((row, idx) => {
              const c = computed[idx];
              return (
                <tr key={row.id}>
                  <td className={styles.slNo}>{idx + 1}</td>
                  <td><input value={row.hsnCode} onChange={e => setPart(idx, 'hsnCode', e.target.value)} placeholder="HSN code" /></td>
                  <td><input value={row.description} onChange={e => setPart(idx, 'description', e.target.value)} placeholder="Part description" /></td>
                  <td>
                    <select value={row.partType} onChange={e => setPart(idx, 'partType', e.target.value)}>
                      {PART_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={row.coverageType} onChange={e => setPart(idx, 'coverageType', e.target.value)}>
                      {COVERAGE_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td><input type="number" min="0" value={row.grossEstimate} onChange={e => setPart(idx, 'grossEstimate', e.target.value)} placeholder="0" /></td>
                  <td className={styles.calcCell}>{fmtPct(c.baseDep)}</td>
                  <td className={styles.calcCell}>{fmtPct(c.appliedDep)}</td>
                  <td className={styles.calcCell}>{fmt(c.depAmt)}</td>
                  <td className={styles.calcCell}>{fmt(c.netPart)}</td>
                  <td>
                    {parts.length > 1 && (
                      <button className={styles.delBtn} onClick={() => removeRow(idx)} title="Remove row">×</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={styles.subtotal}>
              <td colSpan={5} className={styles.subtotalLabel}>SUB-TOTAL PARTS MATRIX</td>
              <td className={styles.calcCell}>{fmt(totalGross)}</td>
              <td colSpan={2}></td>
              <td className={styles.calcCell}>{fmt(totalDepAmt)}</td>
              <td className={styles.calcCell}>{fmt(totalNet)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className={styles.addRowBtn} onClick={addRow}>+ Add Row</button>

      {/* Section 3 */}
      <div className={styles.sectionLabel}>3. REPAIR LABOR &amp; FINAL PURE INSURER LIABILITY CLAIM RECONCILIATION</div>
      <div className={styles.labourGrid}>
        <div className={styles.labourRow}>
          <label>SAC: 997132 — Motor Repairing / Assessed Denting &amp; Painting Labor</label>
          <div className={styles.amtInput}>
            <span className={styles.rupee}>₹</span>
            <input type="number" min="0" value={labour.labourAmount} onChange={e => setLabour('labourAmount', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className={`${styles.labourRow} ${styles.calcRow}`}>
          <label>Gross Aggregated Claim Base (Net Parts Assessment + Assessed Labor)</label>
          <div className={styles.calcAmt}>₹ {fmt(grossClaim)}</div>
        </div>
        <div className={styles.labourRow}>
          <label>Less: Net Salvage Deduction (As per Wreck Valuation Assessment)</label>
          <div className={styles.amtInput}>
            <span className={styles.rupee}>₹</span>
            <input type="number" min="0" value={labour.salvageDeduction} onChange={e => setLabour('salvageDeduction', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className={styles.labourRow}>
          <label>Less: Standard Policy Compulsory Excess Deductible</label>
          <div className={styles.amtInput}>
            <span className={styles.rupee}>₹</span>
            <input type="number" min="0" value={labour.excessDeductible} onChange={e => setLabour('excessDeductible', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className={`${styles.labourRow} ${styles.netLiabilityRow}`}>
          <label>NET LIABILITY OUTLAY OF INSURER</label>
          <div className={styles.netAmt}>₹ {fmt(netLiability)}</div>
        </div>
      </div>
    </div>
  );
}
