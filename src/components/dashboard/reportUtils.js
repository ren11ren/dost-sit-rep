export const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getOfficeDisplayName = (office) => {
  if (!office || typeof office !== 'string') return office;
  if (office.startsWith('PSTO-')) return office.replace(/^PSTO-/, 'DOST ');
  return office;
};

export const buildExcelExportRows = ({ activeEvent, officesData }) => {
  const reportData = [];
  reportData.push(['SITUATIONAL REPORT']);
  reportData.push([]);
  reportData.push(['SITUATIONAL REPORT NO.', '1']);
  reportData.push(['TROPICAL CYCLONE:', activeEvent?.name || 'N/A']);
  reportData.push(['CATEGORY:', activeEvent?.category || 'N/A']);
  reportData.push(['ALERT LEVEL:', activeEvent?.alertLevel || 'N/A']);
  reportData.push(['DATE:', new Date().toLocaleString()]);
  reportData.push([]);
  reportData.push(['I. SITUATION SUMMARY']);
  reportData.push([]);
  reportData.push(['OFFICE', 'WARNING SIGNALS', 'GENERAL WEATHER']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    const warningTags = Object.entries(officeData.warning_signals || {})
      .map(([municipality, signal]) => `${municipality} (Signal ${signal})`)
      .join('; ') || 'None';
    reportData.push([getOfficeDisplayName(officeName), warningTags, officeData.general_weather || 'N/A']);
  });
  reportData.push([]);
  reportData.push(['II. EFFECTS']);
  reportData.push([]);
  reportData.push(['OFFICE', 'RELATED INCIDENTS', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.related_incidents ?? 0, officeData.remark_related_incidents || '-']);
  });
  reportData.push([]);
  reportData.push(['OFFICE', 'CASUALTIES', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.casualties ?? 0, officeData.remark_casualties || '-']);
  });
  reportData.push([]);
  reportData.push(['OFFICE', 'POWER STATUS', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.power_status || '—', officeData.remark_power_status || '-']);
  });
  reportData.push([]);
  reportData.push(['OFFICE', 'COMMUNICATION STATUS', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.communication_lines || '—', officeData.remark_communication_lines || '-']);
  });
  reportData.push([]);
  reportData.push(['OFFICE', 'DAMAGE STATUS', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.damage_facilities || '—', officeData.remark_damage_facilities || '-']);
  });
  reportData.push([]);
  reportData.push(['OFFICE', 'WORK SUSPENSION', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.work_suspension ? 'Suspended' : 'No suspension', officeData.remark_work_suspension || '-']);
  });
  reportData.push([]);
  reportData.push(['OFFICE', 'ASSISTANCE PROVIDED', 'REMARKS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    reportData.push([getOfficeDisplayName(officeName), officeData.assistance_provided || '—', officeData.remark_assistance_provided || '-']);
  });
  reportData.push([]);
  reportData.push(['III. DAMAGE BUILDING']);
  reportData.push(['OFFICE', 'DAMAGE RECORDS']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    const damages = (officeData.damage_details || []).map((damage) => {
      const details = [damage.description, damage.cost ? `₱${damage.cost}` : '', damage.status].filter(Boolean);
      return details.join(' • ');
    }).join(' | ');
    reportData.push([getOfficeDisplayName(officeName), damages || 'No damage records']);
  });
  reportData.push([]);
  reportData.push(['IV. AFFECTED STAFF']);
  reportData.push(['OFFICE', 'STAFF']);
  Object.entries(officesData || {}).forEach(([officeName, officeData]) => {
    const staff = (officeData.affected_staff || []).map((person) => {
      const details = [person.name, person.area, person.assistance, person.status].filter(Boolean);
      return details.join(' • ');
    }).join(' | ');
    reportData.push([getOfficeDisplayName(officeName), staff || 'No affected staff']);
  });
  reportData.push([]);
  reportData.push(['NARRATIVE SUMMARY']);
  reportData.push([Object.values(officesData || {}).map((office) => office.remark).filter(Boolean).join(' ') || 'No additional remarks.']);
  return reportData;
};

export const buildBondPaperReportHtml = ({ activeEvent, officesData }) => {
  const generatedAt = new Date().toLocaleString();
  const reportOffices = Object.entries(officesData || {});
  const narrative = Object.values(officesData || {}).map((office) => office.remark).filter(Boolean).join(' ') || 'No additional remarks.';

  const summaryRows = reportOffices.map(([officeName, officeData]) => {
    const displayName = getOfficeDisplayName(officeName);
    const warningTags = Object.entries(officeData.warning_signals || {})
      .map(([municipality, signal]) => `${municipality} (Signal ${signal})`)
      .join('; ') || 'None';
    return `<tr><td>${escapeHtml(displayName)}</td><td>${escapeHtml(warningTags)}</td><td>${escapeHtml(officeData.general_weather || 'N/A')}</td></tr>`;
  }).join('');

  const sectionRows = (key, label) => reportOffices.map(([officeName, officeData]) => {
    const value = officeData[key] || '—';
    const remarks = officeData[`remark_${key}`] || '-';
    return `<tr><td>${escapeHtml(getOfficeDisplayName(officeName))}</td><td>${escapeHtml(value)}</td><td>${escapeHtml(remarks)}</td></tr>`;
  }).join('');

  const buildingRows = reportOffices.map(([officeName, officeData]) => {
    const displayName = getOfficeDisplayName(officeName);
    const damageRecords = (officeData.damage_details || []).map((damage) => {
      const details = [damage.description, damage.cost ? `₱${damage.cost}` : '', damage.status].filter(Boolean);
      return `<div>${escapeHtml(details.join(' • '))}</div>`;
    }).join('');
    return `<tr><td>${escapeHtml(displayName)}</td><td>${damageRecords || '<em>No damage records</em>'}</td></tr>`;
  }).join('');

  const staffRows = reportOffices.map(([officeName, officeData]) => {
    const displayName = getOfficeDisplayName(officeName);
    const staffRecords = (officeData.affected_staff || []).map((person) => {
      const details = [person.name, person.area, person.assistance, person.status].filter(Boolean);
      return `<div>${escapeHtml(details.join(' • '))}</div>`;
    }).join('');
    return `<tr><td>${escapeHtml(displayName)}</td><td>${staffRecords || '<em>No affected staff</em>'}</td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>DOST-1 Situational Report</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body {
      font-family: "Times New Roman", serif;
      color: #111;
      margin: 0;
      padding: 0;
      background: #f6f6f6;
    }
    .bond-paper-report {
      max-width: 210mm;
      margin: 0 auto;
      padding: 16mm 18mm;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.14);
    }
    .report-header {
      border-bottom: 2px solid #0d3b66;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .report-title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; color: #0d3b66; }
    .report-subtitle { margin: 4px 0 0; font-size: 12px; color: #555; }
    .report-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0 16px;
    }
    .report-actions button {
      border: 1px solid #0d3b66;
      background: #0d3b66;
      color: white;
      padding: 7px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .report-meta { font-size: 12px; margin: 6px 0 10px; }
    .report-section { margin-top: 16px; }
    .report-section h3 { font-size: 13px; margin: 0 0 6px; text-transform: uppercase; color: #0d3b66; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th, td { border: 1px solid #1f1f1f; padding: 7px; font-size: 11px; vertical-align: top; text-align: left; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; table-layout: fixed; }
    td { word-break: break-word; }
    th { background: #f2f2f2; text-align: left; }
    .signature-block { margin-top: 20px; display: flex; justify-content: space-between; gap: 16px; font-size: 12px; }
    .signature-block div { width: 45%; }
    .footer-note { margin-top: 18px; font-size: 11px; color: #444; }
    @media print {
      body { background: white; }
      .report-actions { display: none !important; }
      .bond-paper-report { box-shadow: none; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="bond-paper-report">
    <div class="report-actions">
      <button type="button" onclick="window.opener && window.opener.__dashboardReportExport && window.opener.__dashboardReportExport.exportExcel && window.opener.__dashboardReportExport.exportExcel()">Export Excel</button>
      <button type="button" onclick="window.opener && window.opener.__dashboardReportExport && window.opener.__dashboardReportExport.downloadDoc && window.opener.__dashboardReportExport.downloadDoc()">Export DOC</button>
      <button type="button" onclick="window.opener && window.opener.__dashboardReportExport && window.opener.__dashboardReportExport.exportPdf && window.opener.__dashboardReportExport.exportPdf()">Export PDF</button>
      <button type="button" onclick="window.print()">Print</button>
    </div>
    <div class="report-header">
      <p class="report-title">SITUATIONAL REPORT</p>
      <p class="report-subtitle">Department of Science and Technology - Region 1 • Disaster Risk Reduction and Management Unit</p>
    </div>
    <div class="report-meta">
      <div><strong>Event:</strong> ${escapeHtml(activeEvent?.name || 'None')}</div>
      <div><strong>Category:</strong> ${escapeHtml(activeEvent?.category || 'N/A')}</div>
      <div><strong>Alert Level:</strong> ${escapeHtml(activeEvent?.alertLevel || 'N/A')}</div>
      <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
    </div>

    <div class="report-section">
      <h3>I. Situation Summary</h3>
      <table>
        <thead><tr><th>OFFICE</th><th>WARNING SIGNALS</th><th>GENERAL WEATHER</th></tr></thead>
        <tbody>${summaryRows}</tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>II. Effects</h3>
      <table>
        <thead><tr><th>OFFICE</th><th>RELATED INCIDENTS</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('related_incidents', 'RELATED INCIDENTS')}</tbody>
      </table>
      <table>
        <thead><tr><th>OFFICE</th><th>CASUALTIES</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('casualties', 'CASUALTIES')}</tbody>
      </table>
      <table>
        <thead><tr><th>OFFICE</th><th>POWER STATUS</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('power_status', 'POWER STATUS')}</tbody>
      </table>
      <table>
        <thead><tr><th>OFFICE</th><th>COMMUNICATION STATUS</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('communication_lines', 'COMMUNICATION STATUS')}</tbody>
      </table>
      <table>
        <thead><tr><th>OFFICE</th><th>DAMAGE STATUS</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('damage_facilities', 'DAMAGE STATUS')}</tbody>
      </table>
      <table>
        <thead><tr><th>OFFICE</th><th>WORK SUSPENSION</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('work_suspension', 'WORK SUSPENSION')}</tbody>
      </table>
      <table>
        <thead><tr><th>OFFICE</th><th>ASSISTANCE PROVIDED</th><th>REMARKS</th></tr></thead>
        <tbody>${sectionRows('assistance_provided', 'ASSISTANCE PROVIDED')}</tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>III. Damage Building</h3>
      <table>
        <thead><tr><th>OFFICE</th><th>DAMAGE RECORDS</th></tr></thead>
        <tbody>${buildingRows}</tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>IV. Affected Staff</h3>
      <table>
        <thead><tr><th>OFFICE</th><th>STAFF</th></tr></thead>
        <tbody>${staffRows}</tbody>
      </table>
    </div>

    <div class="report-section">
      <h3>V. Narrative Summary</h3>
      <p>${escapeHtml(narrative)}</p>
    </div>

    <div class="signature-block">
      <div>
        <p><strong>Prepared by:</strong></p>
        <p>________________________</p>
        <p>DOST 1 DRRM Unit</p>
      </div>
      <div>
        <p><strong>Noted by:</strong></p>
        <p>________________________</p>
        <p>Regional Director</p>
      </div>
    </div>
    <div class="footer-note">Generated from the DOST Ilocos Region Disaster Management Dashboard.</div>
  </div>
</body>
</html>`;
};
