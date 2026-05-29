import React, { useState, useRef } from 'react';
import AssessmentTemplate from './AssessmentTemplate';
import SurveyReport from './SurveyReport';
import { buildExcel } from './excelExport';
import JSZip from 'jszip';
import styles from './App.module.css';

const initialAssessmentTemplate = {
  header: {
    surveyRefNo: '',
    policyType: 'Regular',
    insuredName: '',
    vehicleAgeCategory: 'Exceeding 1 year up to 2 years',
    policyNumber: '',
    dateOfInspection: '',
    vehicleMakeModel: '',
    workshopNameLocation: '',
  },
  parts: [
    { id: 1, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 2, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 3, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 4, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 5, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 6, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 7, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
    { id: 8, hsnCode: '', description: '', partType: 'Metal', coverageType: 'Standard Policy', grossEstimate: '' },
  ],
  labour: {
    labourAmount: '',
    salvageDeduction: '',
    excessDeductible: '',
  },
};

const initialSurveyReport = {
  section1: {
    insuredName: '', policyNo: '', address: '', periodOfInsurance: '',
    contactNumber: '', policyTypeCover: '', surveyRefNo: '', idv: '',
  },
  section2: {
    registrationNumber: '', engineNumber: '', chassisNumber: '', makeModel: '',
    dateOfRegistration: '', odometerReading: '', colorOfVehicle: '', fuelType: '',
    classOfVehicle: '', taxPaidUpTo: '',
  },
  section3: {
    driverName: '', drivingLicenseNo: '', ageGender: '', licenseClassType: '',
    relationToInsured: '', licenseValidity: '', badgeDetails: '', issuingAuthority: '',
  },
  section4: {
    dateTimeAccident: '', placeOfAccident: '', dateTimeInspection: '',
    workshopNameLocation: '', causeOfLoss: '', shortDamagesSummary: '',
  },
  parts: [
    { id: 1, hsnSac: '', itemDescription: '', materialType: 'Metal', coverageStatus: 'Standard Policy', estCost: '', depPct: '' },
    { id: 2, hsnSac: '', itemDescription: '', materialType: 'Metal', coverageStatus: 'Standard Policy', estCost: '', depPct: '' },
    { id: 3, hsnSac: '', itemDescription: '', materialType: 'Metal', coverageStatus: 'Standard Policy', estCost: '', depPct: '' },
    { id: 4, hsnSac: '', itemDescription: '', materialType: 'Metal', coverageStatus: 'Standard Policy', estCost: '', depPct: '' },
    { id: 5, hsnSac: '', itemDescription: '', materialType: 'Metal', coverageStatus: 'Standard Policy', estCost: '', depPct: '' },
  ],
  section6: { labourCharges: '', salvageDeduction: '', excessDeductible: '' },
  section7: { observations: '' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('assessment');
  const [atData, setAtData] = useState(initialAssessmentTemplate);
  const [srData, setSrData] = useState(initialSurveyReport);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef();

  const handleATChange = (section, value) => {
    setAtData(prev => ({ ...prev, [section]: value }));
  };

  const handleSRChange = (section, value) => {
    setSrData(prev => ({ ...prev, [section]: value }));
  };

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setUploadedFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...arr.filter(f => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const xlsxData = buildExcel(atData, srData);
      const zip = new JSZip();
      zip.file('Motor_Survey_Report.xlsx', xlsxData);
      uploadedFiles.forEach(f => zip.file('attachments/' + f.name, f));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Motor_Survey_Bundle.zip';
      a.click();
      URL.revokeObjectURL(url);
      showToast('ZIP downloaded successfully!');
    } catch (e) {
      console.error(e);
      showToast('Error generating files. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setAtData(initialAssessmentTemplate);
    setSrData(initialSurveyReport);
    setUploadedFiles([]);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#1a56db"/><path d="M7 14l5 5 9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <span className={styles.logoTitle}>Motor Survey Tool</span>
              <span className={styles.logoSub}>Insurance Loss Assessment</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnReset} onClick={handleReset}>Reset Form</button>
            <button className={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Generating...' : '⬇ Download ZIP'}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'assessment' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('assessment')}
        >
          Sheet 1: Assessment Template
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'survey' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('survey')}
        >
          Sheet 2: Survey Report
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'files' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('files')}
        >
          File Attachments
          {uploadedFiles.length > 0 && (
            <span className={styles.badge}>{uploadedFiles.length}</span>
          )}
        </button>
      </div>

      <main className={styles.main}>
        {activeTab === 'assessment' && (
          <AssessmentTemplate formData={atData} onChange={handleATChange} />
        )}
        {activeTab === 'survey' && (
          <SurveyReport formData={srData} onChange={handleSRChange} />
        )}
        {activeTab === 'files' && (
          <div className={styles.filesPane}>
            <div className={styles.filesPaneTitle}>File Attachments</div>
            <p className={styles.filesHint}>
              Upload photos, documents, or any supporting files. They will be bundled into the ZIP along with the Excel report.
            </p>
            <div
              className={styles.dropZone}
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver); }}
              onDragLeave={e => e.currentTarget.classList.remove(styles.dragOver)}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove(styles.dragOver); handleFiles(e.dataTransfer.files); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />
              <div className={styles.dropIcon}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#ebf5ff"/><path d="M20 12v16M12 20l8-8 8 8" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className={styles.dropText}>Click or drag &amp; drop files here</p>
              <p className={styles.dropSub}>Images, PDFs, documents — all types accepted</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className={styles.fileList}>
                {uploadedFiles.map((f, i) => (
                  <div key={i} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileIcon}>
                        {f.type.startsWith('image/') ? '🖼' : f.type === 'application/pdf' ? '📄' : '📎'}
                      </span>
                      <div>
                        <div className={styles.fileName}>{f.name}</div>
                        <div className={styles.fileSize}>{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button className={styles.removeFile} onClick={() => removeFile(i)}>×</button>
                  </div>
                ))}
              </div>
            )}

            {uploadedFiles.length === 0 && (
              <p className={styles.noFiles}>No files uploaded yet.</p>
            )}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Fill both sheets, upload any supporting files, then click <strong>Download ZIP</strong> to get the Excel + all attachments bundled.</span>
          <div className={styles.footerActions}>
            <button className={styles.btnReset} onClick={handleReset}>Reset</button>
            <button className={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Generating...' : '⬇ Download ZIP'}
            </button>
          </div>
        </div>
      </footer>

      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}
    </div>
  );
}
