// Sheet 2: Survey Report
// Exact fields from the sheet only — no extras

import React, { useCallback } from 'react';
import styles from './SurveyReport.module.css';

const PART_TYPE_OPTIONS = ['Glass', 'Plastic', 'Rubber', 'Fiber Glass', 'Metal'];
const COVERAGE_STATUS_OPTIONS = ['Standard Policy', 'Nil-Dep Policy', 'Not Covered'];

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  hsnSac: '',
  itemDescription: '',
  materialType: 'Metal',
  coverageStatus: 'Standard Policy',
  estCost: '',
  depPct: '',
});

function calcSurveyRow(row) {
  const est = parseFloat(row.estCost) || 0;
  const dep = parseFloat(row.depPct) || 0;
  const depAmt = est * dep;
  const net = row.coverageStatus === 'Not Covered' ? 0 : est - depAmt;
  return { depAmt, net };
}

export default function SurveyReport({ formData, onChange }) {
  const s1 = formData.section1;
  const s2 = formData.section2;
  const s3 = formData.section3;
  const s4 = formData.section4;
  const parts = formData.parts;
  const s6 = formData.section6;
  const s7 = formData.section7;

  const set1 = (f, v) => onChange('section1', { ...s1, [f]: v });
  const set2 = (f, v) => onChange('section2', { ...s2, [f]: v });
  const set3 = (f, v) => onChange('section3', { ...s3, [f]: v });
  const set4 = (f, v) => onChange('section4', { ...s4, [f]: v });
  const set6 = (f, v) => onChange('section6', { ...s6, [f]: v });
  const set7 = (f, v) => onChange('section7', { ...s7, [f]: v });

  const setPart = useCallback((idx, field, value) => {
    const updated = parts.map((r, i) => i === idx ? { ...r, [field]: value } : r);
    onChange('parts', updated);
  }, [parts, onChange]);

  const addRow = () => onChange('parts', [...parts, emptyRow()]);
  const removeRow = (idx) => onChange('parts', parts.filter((_, i) => i !== idx));

  const computed = parts.map(calcSurveyRow);
  const totalEstCost = parts.reduce((s, r) => s + (parseFloat(r.estCost) || 0), 0);
  const totalDepAmt = computed.reduce((s, c) => s + c.depAmt, 0);
  const totalNet = computed.reduce((s, c) => s + c.net, 0);

  const labourAmt = parseFloat(s6.labourCharges) || 0;
  const salvageAmt = parseFloat(s6.salvageDeduction) || 0;
  const excessAmt = parseFloat(s6.excessDeductible) || 0;
  const netLiability = totalNet + labourAmt - salvageAmt - excessAmt;

  const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles.sheet}>
      <div className={styles.sheetTitle}>DETAILED MOTOR SURVEY &amp; LOSS ASSESSMENT REPORT</div>

      {/* Section 1 */}
      <div className={styles.sectionLabel}>1. INSURED &amp; POLICY DETAILS</div>
      <div className={styles.grid2}>
        <div className={styles.field}><label>Insured Name:</label><input value={s1.insuredName} onChange={e => set1('insuredName', e.target.value)} /></div>
        <div className={styles.field}><label>Policy / Cover Note No:</label><input value={s1.policyNo} onChange={e => set1('policyNo', e.target.value)} /></div>
        <div className={styles.field}><label>Address:</label><input value={s1.address} onChange={e => set1('address', e.target.value)} /></div>
        <div className={styles.field}><label>Period of Insurance:</label><input value={s1.periodOfInsurance} onChange={e => set1('periodOfInsurance', e.target.value)} /></div>
        <div className={styles.field}><label>Contact Number:</label><input value={s1.contactNumber} onChange={e => set1('contactNumber', e.target.value)} /></div>
        <div className={styles.field}><label>Policy Type / Cover:</label><input value={s1.policyTypeCover} onChange={e => set1('policyTypeCover', e.target.value)} /></div>
        <div className={styles.field}><label>Survey Ref No:</label><input value={s1.surveyRefNo} onChange={e => set1('surveyRefNo', e.target.value)} /></div>
        <div className={styles.field}><label>Insured Declared Value (IDV):</label><input value={s1.idv} onChange={e => set1('idv', e.target.value)} /></div>
      </div>

      {/* Section 2 */}
      <div className={styles.sectionLabel}>2. VEHICLE PARTICULARS &amp; TECHNICAL DETAILS</div>
      <div className={styles.grid2}>
        <div className={styles.field}><label>Registration Number:</label><input value={s2.registrationNumber} onChange={e => set2('registrationNumber', e.target.value)} /></div>
        <div className={styles.field}><label>Engine Number:</label><input value={s2.engineNumber} onChange={e => set2('engineNumber', e.target.value)} /></div>
        <div className={styles.field}><label>Chassis Number:</label><input value={s2.chassisNumber} onChange={e => set2('chassisNumber', e.target.value)} /></div>
        <div className={styles.field}><label>Make / Model:</label><input value={s2.makeModel} onChange={e => set2('makeModel', e.target.value)} /></div>
        <div className={styles.field}><label>Date of Registration:</label><input value={s2.dateOfRegistration} onChange={e => set2('dateOfRegistration', e.target.value)} /></div>
        <div className={styles.field}><label>Odometer Reading:</label><input value={s2.odometerReading} onChange={e => set2('odometerReading', e.target.value)} /></div>
        <div className={styles.field}><label>Color of Vehicle:</label><input value={s2.colorOfVehicle} onChange={e => set2('colorOfVehicle', e.target.value)} /></div>
        <div className={styles.field}><label>Fuel Type:</label><input value={s2.fuelType} onChange={e => set2('fuelType', e.target.value)} /></div>
        <div className={styles.field}><label>Class of Vehicle:</label><input value={s2.classOfVehicle} onChange={e => set2('classOfVehicle', e.target.value)} /></div>
        <div className={styles.field}><label>Tax Paid Up To:</label><input value={s2.taxPaidUpTo} onChange={e => set2('taxPaidUpTo', e.target.value)} /></div>
      </div>

      {/* Section 3 */}
      <div className={styles.sectionLabel}>3. DRIVER PARTICULARS</div>
      <div className={styles.grid2}>
        <div className={styles.field}><label>Driver Name:</label><input value={s3.driverName} onChange={e => set3('driverName', e.target.value)} /></div>
        <div className={styles.field}><label>Driving License No:</label><input value={s3.drivingLicenseNo} onChange={e => set3('drivingLicenseNo', e.target.value)} /></div>
        <div className={styles.field}><label>Age / Gender:</label><input value={s3.ageGender} onChange={e => set3('ageGender', e.target.value)} /></div>
        <div className={styles.field}><label>License Class / Type:</label><input value={s3.licenseClassType} onChange={e => set3('licenseClassType', e.target.value)} /></div>
        <div className={styles.field}><label>Relation to Insured:</label><input value={s3.relationToInsured} onChange={e => set3('relationToInsured', e.target.value)} /></div>
        <div className={styles.field}><label>License Validity (Expiry):</label><input value={s3.licenseValidity} onChange={e => set3('licenseValidity', e.target.value)} /></div>
        <div className={styles.field}><label>Badge Details (if any):</label><input value={s3.badgeDetails} onChange={e => set3('badgeDetails', e.target.value)} /></div>
        <div className={styles.field}><label>Issuing Authority:</label><input value={s3.issuingAuthority} onChange={e => set3('issuingAuthority', e.target.value)} /></div>
      </div>

      {/* Section 4 */}
      <div className={styles.sectionLabel}>4. ACCIDENT, LOSS DETAILS &amp; CAUSE DESCRIPTION</div>
      <div className={styles.grid2}>
        <div className={styles.field}><label>Date &amp; Time of Accident:</label><input value={s4.dateTimeAccident} onChange={e => set4('dateTimeAccident', e.target.value)} /></div>
        <div className={styles.field}><label>Place / Spot of Accident:</label><input value={s4.placeOfAccident} onChange={e => set4('placeOfAccident', e.target.value)} /></div>
        <div className={styles.field}><label>Date &amp; Time of Inspection:</label><input value={s4.dateTimeInspection} onChange={e => set4('dateTimeInspection', e.target.value)} /></div>
        <div className={styles.field}><label>Workshop Name / Location:</label><input value={s4.workshopNameLocation} onChange={e => set4('workshopNameLocation', e.target.value)} /></div>
        <div className={`${styles.field} ${styles.span2}`}>
          <label>Cause of Loss &amp; Accident Description:</label>
          <textarea rows={4} value={s4.causeOfLoss} onChange={e => set4('causeOfLoss', e.target.value)} />
        </div>
        <div className={`${styles.field} ${styles.span2}`}>
          <label>Short Damages Summary:</label>
          <textarea rows={3} value={s4.shortDamagesSummary} onChange={e => set4('shortDamagesSummary', e.target.value)} />
        </div>
      </div>

      {/* Section 5 */}
      <div className={styles.sectionLabel}>5. DETAILED ITEMIZED LOSS ASSESSMENT SHEET</div>
      <div className={styles.tableWrap}>
        <table className={styles.partsTable}>
          <thead>
            <tr>
              <th>Sl</th>
              <th>HSN/SAC</th>
              <th>Item Description</th>
              <th>Material Type</th>
              <th>Coverage Status</th>
              <th>Est. Cost (₹)</th>
              <th>Dep. %</th>
              <th>Dep. Amt (₹)</th>
              <th>Net Assessed (₹)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((row, idx) => {
              const c = computed[idx];
              return (
                <tr key={row.id}>
                  <td className={styles.slNo}>{idx + 1}</td>
                  <td><input value={row.hsnSac} onChange={e => setPart(idx, 'hsnSac', e.target.value)} /></td>
                  <td><input value={row.itemDescription} onChange={e => setPart(idx, 'itemDescription', e.target.value)} /></td>
                  <td>
                    <select value={row.materialType} onChange={e => setPart(idx, 'materialType', e.target.value)}>
                      {PART_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={row.coverageStatus} onChange={e => setPart(idx, 'coverageStatus', e.target.value)}>
                      {COVERAGE_STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td><input type="number" min="0" value={row.estCost} onChange={e => setPart(idx, 'estCost', e.target.value)} /></td>
                  <td><input type="number" min="0" max="1" step="0.01" value={row.depPct} onChange={e => setPart(idx, 'depPct', e.target.value)} placeholder="0.00–1.00" /></td>
                  <td className={styles.calcCell}>{fmt(c.depAmt)}</td>
                  <td className={styles.calcCell}>{fmt(c.net)}</td>
                  <td>
                    {parts.length > 1 && (
                      <button className={styles.delBtn} onClick={() => removeRow(idx)}>×</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td colSpan={5} className={styles.totalLabel}>Total Net Parts Assessment</td>
              <td className={styles.calcCell}>{fmt(totalEstCost)}</td>
              <td></td>
              <td className={styles.calcCell}>{fmt(totalDepAmt)}</td>
              <td className={styles.calcCell}>{fmt(totalNet)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button className={styles.addRowBtn} onClick={addRow}>+ Add Row</button>

      {/* Section 6 */}
      <div className={styles.sectionLabel}>6. LABOUR CHARGES &amp; FINAL CLAIM RECONCILIATION</div>
      <div className={styles.labourBlock}>
        <div className={styles.labourRow}>
          <span>Assessed Denting &amp; Painting Labor Charges (SAC 997132)</span>
          <div className={styles.amtInput}><span>₹</span><input type="number" min="0" value={s6.labourCharges} onChange={e => set6('labourCharges', e.target.value)} /></div>
        </div>
        <div className={styles.labourRow}>
          <span>Less: Mutually Agreed Salvage / Wreck Value Deduction</span>
          <div className={styles.amtInput}><span>₹</span><input type="number" min="0" value={s6.salvageDeduction} onChange={e => set6('salvageDeduction', e.target.value)} /></div>
        </div>
        <div className={styles.labourRow}>
          <span>Less: Compulsory Policy Excess Deductible</span>
          <div className={styles.amtInput}><span>₹</span><input type="number" min="0" value={s6.excessDeductible} onChange={e => set6('excessDeductible', e.target.value)} /></div>
        </div>
        <div className={`${styles.labourRow} ${styles.netRow}`}>
          <span>NET LIABILITY OF INSURANCE COMPANY</span>
          <div className={styles.netAmt}>₹ {fmt(netLiability)}</div>
        </div>
      </div>

      {/* Section 7 */}
      <div className={styles.sectionLabel}>7. SURVEYOR OBSERVATIONS &amp; TECHNICAL REMARKS</div>
      <div className={styles.field}>
        <textarea rows={6} value={s7.observations} onChange={e => set7('observations', e.target.value)} placeholder="Enter surveyor observations and technical remarks..." className={styles.obsTextarea} />
      </div>
      <div className={styles.surveyorRow}>
        <span className={styles.surveyorLabel}>Licensed Motor Insurance Surveyor</span>
      </div>
    </div>
  );
}
