import { buildBondPaperReportHtml, buildExcelExportRows } from './reportUtils';

describe('reportUtils', () => {
  it('builds a bond-paper report preview with export actions', () => {
    const html = buildBondPaperReportHtml({
      activeEvent: { name: 'Typhoon A', category: 'Signal 3', alertLevel: 'RED' },
      officesData: {
        'PSTO-La Union': {
          warning_signals: { 'Agoo': 3 },
          general_weather: 'Rainy',
          related_incidents: 2,
          remark_related_incidents: 'Flooding',
          casualties: 1,
          remark_casualties: 'One injury',
          power_status: 'Restored',
          remark_power_status: 'Power back',
          communication_lines: 'Stable',
          remark_communication_lines: 'Signal improved',
          damage_facilities: 'Minor',
          remark_damage_facilities: 'Roof damage',
          work_suspension: true,
          remark_work_suspension: 'Suspended classes',
          assistance_provided: 'Food packs',
          remark_assistance_provided: 'Delivered',
          remark: 'Overall good',
          damage_details: [{ description: 'Roof', cost: '2000', status: 'Reported' }],
          equipment_details: [{ name: 'Laptop', description: 'Damaged', cost: '5000', status: 'Reported' }],
          affected_staff: [{ name: 'Juan', area: 'Agoo', assistance: 'Relief', status: 'Active' }]
        }
      }
    });

    expect(html).toContain('SITUATIONAL REPORT');
    expect(html).toContain('bond-paper-report');
    expect(html).toContain('Export Excel');
    expect(html).toContain('Export DOC');
    expect(html).toContain('Export PDF');
  });

  it('builds excel rows with the main summary sections', () => {
    const rows = buildExcelExportRows({
      activeEvent: { name: 'Typhoon A', category: 'Signal 3', alertLevel: 'RED' },
      officesData: {
        'PSTO-La Union': {
          warning_signals: { 'Agoo': 3 },
          general_weather: 'Rainy',
          related_incidents: 2,
          remark_related_incidents: 'Flooding',
          casualties: 1,
          remark_casualties: 'One injury',
          power_status: 'Restored',
          remark_power_status: 'Power back',
          communication_lines: 'Stable',
          remark_communication_lines: 'Signal improved',
          damage_facilities: 'Minor',
          remark_damage_facilities: 'Roof damage',
          work_suspension: true,
          remark_work_suspension: 'Suspended classes',
          assistance_provided: 'Food packs',
          remark_assistance_provided: 'Delivered',
          remark: 'Overall good'
        }
      }
    });

    expect(rows[0]).toEqual(['SITUATIONAL REPORT']);
    expect(rows[3]).toEqual(['TROPICAL CYCLONE:', 'Typhoon A']);
    expect(rows.some((row) => row[0] === 'I. SITUATION SUMMARY')).toBe(true);
    expect(rows.some((row) => row[0] === 'OFFICE' && row[1] === 'WARNING SIGNALS' && row[2] === 'GENERAL WEATHER')).toBe(true);
  });
});
