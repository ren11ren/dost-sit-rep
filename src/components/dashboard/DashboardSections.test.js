import { getHistoryTotals } from './DashboardSections';

describe('getHistoryTotals', () => {
  it('derives damage totals from event-level damage arrays when no offices snapshot is available', () => {
    const totals = getHistoryTotals({
      damage_details: [{ cost: '1250' }, { cost: '100' }],
      equipment_details: [{ cost: '500' }],
      affected_staff: [{ name: 'Ana' }, { name: 'Ben' }],
      casualties: 2
    });

    expect(totals.buildingCost).toBe(1350);
    expect(totals.equipmentCost).toBe(500);
    expect(totals.totalDamage).toBe(1850);
    expect(totals.staffCount).toBe(2);
    expect(totals.casualtyCount).toBe(2);
  });

  it('supports snake_case offices_snapshot payloads', () => {
    const totals = getHistoryTotals({
      offices_snapshot: {
        'PSTO-Test': {
          damage_details: [{ cost: '₱1,000' }],
          equipment_details: [{ cost: '750' }],
          affected_staff: [{ name: 'Ana' }],
          casualties: 1
        }
      }
    });

    expect(totals.buildingCost).toBe(1000);
    expect(totals.equipmentCost).toBe(750);
    expect(totals.totalDamage).toBe(1750);
    expect(totals.staffCount).toBe(1);
    expect(totals.casualtyCount).toBe(1);
  });

  it('parses currency-formatted damage costs for history totals', () => {
    const totals = getHistoryTotals({
      officesSnapshot: {
        'PSTO-Test': {
          damage_details: [{ cost: '₱1,250' }, { cost: '1,500.50' }],
          equipment_details: [{ cost: '₱2,000' }],
          affected_staff: [{ name: 'Ana' }, { name: 'Ben' }],
          casualties: '3'
        }
      }
    });

    expect(totals.buildingCost).toBe(2750.5);
    expect(totals.equipmentCost).toBe(2000);
    expect(totals.totalDamage).toBe(4750.5);
    expect(totals.staffCount).toBe(2);
    expect(totals.casualtyCount).toBe(3);
  });

  it('reads totals from nested data payloads when the snapshot is not on the root event', () => {
    const totals = getHistoryTotals({
      data: {
        damage_details: [{ cost: '300' }],
        equipment_details: [{ cost: '200' }],
        affected_staff: [{ name: 'Ana' }],
        casualties: 3
      }
    });

    expect(totals.buildingCost).toBe(300);
    expect(totals.equipmentCost).toBe(200);
    expect(totals.totalDamage).toBe(500);
    expect(totals.staffCount).toBe(1);
    expect(totals.casualtyCount).toBe(3);
  });

  it('uses explicit root totals fields written by archived event entries', () => {
    const totals = getHistoryTotals({
      buildingDamage: 1500,
      equipmentDamage: 2000,
      affectedStaff: 4,
      casualties: 2
    });

    expect(totals.buildingCost).toBe(1500);
    expect(totals.equipmentCost).toBe(2000);
    expect(totals.totalDamage).toBe(3500);
    expect(totals.staffCount).toBe(4);
    expect(totals.casualtyCount).toBe(2);
  });

  it('parses JSON-string history payloads from archived events', () => {
    const totals = getHistoryTotals({
      officesSnapshot: {
        'PSTO-Test': {
          damage_details: '[{"cost":"100"},{"cost":"200"}]',
          equipment_details: '[{"cost":"75"}]',
          affected_staff: '[{"name":"Ana"},{"name":"Ben"}]',
          casualties: '3'
        }
      }
    });

    expect(totals.buildingCost).toBe(300);
    expect(totals.equipmentCost).toBe(75);
    expect(totals.totalDamage).toBe(375);
    expect(totals.staffCount).toBe(2);
    expect(totals.casualtyCount).toBe(3);
  });

  it('uses explicit archived totals without double-counting office snapshot values', () => {
    const totals = getHistoryTotals({
      buildingDamage: 1500,
      equipmentDamage: 2000,
      affectedStaff: 4,
      casualties: 2,
      officesSnapshot: {
        'PSTO-Test': {
          damage_details: [{ cost: '1500' }],
          equipment_details: [{ cost: '2000' }],
          affected_staff: [{ name: 'Ana' }, { name: 'Ben' }, { name: 'Carla' }, { name: 'Dan' }],
          casualties: 2
        }
      }
    });

    expect(totals.buildingCost).toBe(1500);
    expect(totals.equipmentCost).toBe(2000);
    expect(totals.totalDamage).toBe(3500);
    expect(totals.staffCount).toBe(4);
    expect(totals.casualtyCount).toBe(2);
  });
});
