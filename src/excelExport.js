import * as XLSX from 'xlsx';

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

export function buildExcel(atData, srData) {
  const wb = XLSX.utils.book_new();

  // ===== Sheet 1: Assessment Template =====
  const ws1 = {};

  const s = (cell, value) => { ws1[cell] = { v: value, t: typeof value === 'number' ? 'n' : 's' }; };

  s('A1', 'AUTOMATED MOTOR SURVEY ASSESSOR TOOL');
  s('A3', '  1. COVERAGE PROFILE, VEHICLE AGE & INSURED DETAILS');
  s('A4', 'Survey Reference No:');
  s('B4', atData.header.surveyRefNo);
  s('E4', 'Policy Type (Regular/Nil-Dep):');
  s('F4', atData.header.policyType);
  s('A5', 'Insured Name:');
  s('B5', atData.header.insuredName);
  s('E5', 'Vehicle Age Category:');
  s('F5', atData.header.vehicleAgeCategory);
  s('A6', 'Policy Number:');
  s('B6', atData.header.policyNumber);
  s('E6', 'Date of Inspection:');
  s('F6', atData.header.dateOfInspection);
  s('A7', 'Vehicle Make / Model:');
  s('B7', atData.header.vehicleMakeModel);
  s('E7', 'Workshop Name & Location:');
  s('F7', atData.header.workshopNameLocation);

  s('A10', '  2. ITEMIZED PARTS SCHEDULING (AUTOMATIC AGE DEPRECIATION MATRIX)');
  s('A11', 'Sl No.');
  s('B11', 'HSN / SAC Code');
  s('C11', 'Description of Damaged Part');
  s('D11', 'Part Type');
  s('E11', 'Coverage Type');
  s('F11', 'Gross Estimate (₹)');
  s('G11', 'Base Dep %');
  s('H11', 'Applied Dep %');
  s('I11', 'Depreciation Amt (₹)');
  s('J11', 'Net Part Assessment (₹)');

  const policyType = atData.header.policyType;
  const vehicleAge = atData.header.vehicleAgeCategory;

  atData.parts.forEach((row, i) => {
    const r = 12 + i;
    const gross = parseFloat(row.grossEstimate) || 0;
    const baseDep = getBaseDep(row.partType, vehicleAge);
    const appliedDep = getAppliedDep(row.coverageType, policyType, baseDep);
    const depAmt = gross * appliedDep;
    const netPart = row.coverageType === 'Not Covered' ? 0 : gross - depAmt;

    s(`A${r}`, i + 1);
    s(`B${r}`, row.hsnCode || '');
    s(`C${r}`, row.description || '');
    s(`D${r}`, row.partType || '');
    s(`E${r}`, row.coverageType || '');
    s(`F${r}`, gross);
    s(`G${r}`, baseDep);
    s(`H${r}`, appliedDep);
    s(`I${r}`, depAmt);
    s(`J${r}`, netPart);
  });

  const lastPartRow = 12 + atData.parts.length - 1;
  const subtotalRow = lastPartRow + 1;
  s(`C${subtotalRow}`, 'SUB-TOTAL PARTS MATRIX');
  s(`F${subtotalRow}`, atData.parts.reduce((sum, r) => sum + (parseFloat(r.grossEstimate) || 0), 0));

  const totalDep = atData.parts.reduce((sum, row) => {
    const gross = parseFloat(row.grossEstimate) || 0;
    const baseDep = getBaseDep(row.partType, vehicleAge);
    const appliedDep = getAppliedDep(row.coverageType, policyType, baseDep);
    return sum + gross * appliedDep;
  }, 0);
  const totalNet = atData.parts.reduce((sum, row) => {
    const gross = parseFloat(row.grossEstimate) || 0;
    const baseDep = getBaseDep(row.partType, vehicleAge);
    const appliedDep = getAppliedDep(row.coverageType, policyType, baseDep);
    const depAmt = gross * appliedDep;
    return sum + (row.coverageType === 'Not Covered' ? 0 : gross - depAmt);
  }, 0);

  s(`I${subtotalRow}`, totalDep);
  s(`J${subtotalRow}`, totalNet);

  const labRow = subtotalRow + 2;
  s(`A${labRow}`, '  3. REPAIR LABOR & FINAL PURE INSURER LIABILITY CLAIM RECONCILIATION');
  s(`B${labRow + 1}`, 'SAC: 997132 - Motor Repairing / Assessed Denting & Painting Labor');
  s(`J${labRow + 1}`, parseFloat(atData.labour.labourAmount) || 0);
  s(`B${labRow + 2}`, 'Gross Aggregated Claim Base (Net Parts Assessment + Assessed Labor)');
  s(`J${labRow + 2}`, totalNet + (parseFloat(atData.labour.labourAmount) || 0));
  s(`B${labRow + 3}`, 'Less: Net Salvage Deduction (As per Wreck Valuation Assessment)');
  s(`J${labRow + 3}`, parseFloat(atData.labour.salvageDeduction) || 0);
  s(`B${labRow + 4}`, 'Less: Standard Policy Compulsory Excess Deductible');
  s(`J${labRow + 4}`, parseFloat(atData.labour.excessDeductible) || 0);
  s(`B${labRow + 5}`, 'NET LIABILITY OUTLAY OF INSURER');
  const netLiab1 = totalNet + (parseFloat(atData.labour.labourAmount) || 0) - (parseFloat(atData.labour.salvageDeduction) || 0) - (parseFloat(atData.labour.excessDeductible) || 0);
  s(`J${labRow + 5}`, netLiab1);

  ws1['!ref'] = `A1:J${labRow + 6}`;
  ws1['!cols'] = [
    { wch: 25 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 18 },
    { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Assessment Template');

  // ===== Sheet 2: Survey Report =====
  const ws2 = {};
  const s2 = (cell, value) => { ws2[cell] = { v: value, t: typeof value === 'number' ? 'n' : 's' }; };
  const { section1: s1, section2: sec2, section3: sec3, section4: sec4, parts: srParts, section6: sec6, section7: sec7 } = srData;

  s2('A1', 'DETAILED MOTOR SURVEY & LOSS ASSESSMENT REPORT');
  s2('A3', '  1. INSURED & POLICY DETAILS');
  s2('A4', 'Insured Name:'); s2('B4', s1.insuredName);
  s2('E4', 'Policy / Cover Note No:'); s2('F4', s1.policyNo);
  s2('A5', 'Address:'); s2('B5', s1.address);
  s2('E5', 'Period of Insurance:'); s2('F5', s1.periodOfInsurance);
  s2('A6', 'Contact Number:'); s2('B6', s1.contactNumber);
  s2('E6', 'Policy Type / Cover:'); s2('F6', s1.policyTypeCover);
  s2('A7', 'Survey Ref No:'); s2('B7', s1.surveyRefNo);
  s2('E7', 'Insured Declared Value (IDV):'); s2('F7', s1.idv);

  s2('A9', '  2. VEHICLE PARTICULARS & TECHNICAL DETAILS');
  s2('A10', 'Registration Number:'); s2('B10', sec2.registrationNumber);
  s2('E10', 'Engine Number:'); s2('F10', sec2.engineNumber);
  s2('A11', 'Chassis Number:'); s2('B11', sec2.chassisNumber);
  s2('E11', 'Make / Model:'); s2('F11', sec2.makeModel);
  s2('A12', 'Date of Registration:'); s2('B12', sec2.dateOfRegistration);
  s2('E12', 'Odometer Reading:'); s2('F12', sec2.odometerReading);
  s2('A13', 'Color of Vehicle:'); s2('B13', sec2.colorOfVehicle);
  s2('E13', 'Fuel Type:'); s2('F13', sec2.fuelType);
  s2('A14', 'Class of Vehicle:'); s2('B14', sec2.classOfVehicle);
  s2('E14', 'Tax Paid Up To:'); s2('F14', sec2.taxPaidUpTo);

  s2('A16', '  3. DRIVER PARTICULARS');
  s2('A17', 'Driver Name:'); s2('B17', sec3.driverName);
  s2('E17', 'Driving License No:'); s2('F17', sec3.drivingLicenseNo);
  s2('A18', 'Age / Gender:'); s2('B18', sec3.ageGender);
  s2('E18', 'License Class / Type:'); s2('F18', sec3.licenseClassType);
  s2('A19', 'Relation to Insured:'); s2('B19', sec3.relationToInsured);
  s2('E19', 'License Validity (Expiry):'); s2('F19', sec3.licenseValidity);
  s2('A20', 'Badge Details (if any):'); s2('B20', sec3.badgeDetails);
  s2('E20', 'Issuing Authority:'); s2('F20', sec3.issuingAuthority);

  s2('A22', '  4. ACCIDENT, LOSS DETAILS & CAUSE DESCRIPTION');
  s2('A23', 'Date & Time of Accident:'); s2('B23', sec4.dateTimeAccident);
  s2('E23', 'Place / Spot of Accident:'); s2('F23', sec4.placeOfAccident);
  s2('A24', 'Date & Time of Inspection:'); s2('B24', sec4.dateTimeInspection);
  s2('E24', 'Workshop Name / Location:'); s2('F24', sec4.workshopNameLocation);
  s2('A25', 'Cause of Loss & Accident Description:'); s2('B25', sec4.causeOfLoss);
  s2('A29', 'Short Damages Summary:'); s2('B29', sec4.shortDamagesSummary);

  s2('A32', '  5. DETAILED ITEMIZED LOSS ASSESSMENT SHEET');
  s2('A33', 'Sl'); s2('B33', 'HSN/SAC'); s2('C33', 'Item Description');
  s2('D33', 'Material Type'); s2('E33', 'Coverage Status');
  s2('F33', 'Est. Cost (₹)'); s2('G33', 'Dep. %');
  s2('H33', 'Dep. Amt (₹)'); s2('I33', 'Net Assessed (₹)');

  srParts.forEach((row, i) => {
    const r = 34 + i;
    const est = parseFloat(row.estCost) || 0;
    const dep = parseFloat(row.depPct) || 0;
    const depAmt = est * dep;
    const net = row.coverageStatus === 'Not Covered' ? 0 : est - depAmt;
    s2(`A${r}`, i + 1);
    s2(`B${r}`, row.hsnSac || '');
    s2(`C${r}`, row.itemDescription || '');
    s2(`D${r}`, row.materialType || '');
    s2(`E${r}`, row.coverageStatus || '');
    s2(`F${r}`, est);
    s2(`G${r}`, dep);
    s2(`H${r}`, depAmt);
    s2(`I${r}`, net);
  });

  const lastSRRow = 34 + srParts.length - 1;
  const srTotalRow = lastSRRow + 1;
  const srTotalEst = srParts.reduce((sum, r) => sum + (parseFloat(r.estCost) || 0), 0);
  const srTotalDep = srParts.reduce((sum, r) => { const e = parseFloat(r.estCost) || 0; const d = parseFloat(r.depPct) || 0; return sum + e * d; }, 0);
  const srTotalNet = srParts.reduce((sum, r) => { const e = parseFloat(r.estCost) || 0; const d = parseFloat(r.depPct) || 0; return sum + (r.coverageStatus === 'Not Covered' ? 0 : e - e * d); }, 0);

  s2(`C${srTotalRow}`, 'Total Net Parts Assessment');
  s2(`F${srTotalRow}`, srTotalEst);
  s2(`H${srTotalRow}`, srTotalDep);
  s2(`I${srTotalRow}`, srTotalNet);

  const srLabRow = srTotalRow + 2;
  s2(`A${srLabRow}`, '  6. LABOUR CHARGES & FINAL CLAIM RECONCILIATION');
  s2(`B${srLabRow + 1}`, 'Assessed Denting & Painting Labor Charges (SAC 997132)');
  s2(`I${srLabRow + 1}`, parseFloat(sec6.labourCharges) || 0);
  s2(`B${srLabRow + 2}`, 'Less: Mutually Agreed Salvage / Wreck Value Deduction');
  s2(`I${srLabRow + 2}`, parseFloat(sec6.salvageDeduction) || 0);
  s2(`B${srLabRow + 3}`, 'Less: Compulsory Policy Excess Deductible');
  s2(`I${srLabRow + 3}`, parseFloat(sec6.excessDeductible) || 0);
  s2(`B${srLabRow + 4}`, 'NET LIABILITY OF INSURANCE COMPANY');
  const srNetLiab = srTotalNet + (parseFloat(sec6.labourCharges) || 0) - (parseFloat(sec6.salvageDeduction) || 0) - (parseFloat(sec6.excessDeductible) || 0);
  s2(`I${srLabRow + 4}`, srNetLiab);

  const srObsRow = srLabRow + 6;
  s2(`A${srObsRow}`, '  7. SURVEYOR OBSERVATIONS & TECHNICAL REMARKS');
  s2(`A${srObsRow + 1}`, sec7.observations);
  s2(`G${srObsRow + 7}`, 'Licensed Motor Insurance Surveyor');

  ws2['!ref'] = `A1:I${srObsRow + 10}`;
  ws2['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 35 }, { wch: 14 }, { wch: 18 },
    { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Survey Report');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}
