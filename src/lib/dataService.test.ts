import { describe, it, expect } from 'vitest';
import { UnitAdvisorAssignment, mapUnitAdvisorRow, transformToPenglibatan, StudentRecord } from '../lib/dataService';

describe('mapUnitAdvisorRow', () => {
  it('maps a raw DB row to UnitAdvisorAssignment', () => {
    const rawRow = {
      id: 'uuid-1',
      user_id: 'user-123',
      unit_code: 'pengakap',
      tahun: 2025,
      created_at: '2025-01-01T00:00:00Z',
    };

    const result = mapUnitAdvisorRow(rawRow);

    expect(result).toEqual({
      userId: 'user-123',
      unitCode: 'pengakap',
      tahun: 2025,
    });
  });

  it('handles missing optional fields', () => {
    const rawRow = {
      user_id: 'user-456',
      unit_code: 'bola',
      tahun: 2024,
    };

    const result = mapUnitAdvisorRow(rawRow);

    expect(result).toEqual({
      userId: 'user-456',
      unitCode: 'bola',
      tahun: 2024,
    });
  });
});

describe('StudentRecord — jenisSkorPenglibatan fields', () => {
  it('accepts jenisSkorPenglibatan fields on StudentRecord', () => {
    const record: StudentRecord = {
      id: 1,
      nama: 'Test',
      kelas: '4A',
      student_number: 1,
      tahun: 2025,
      sukan_unit: 'bola',
      sukan_jawatan: 'Ahli',
      sukan_ahli: 'Ya',
      sukan_kehadiran: 10,
      sukan_pencapaian: '',
      kelab_unit: 'bm',
      kelab_jawatan: 'Ahli',
      kelab_ahli: 'Ya',
      kelab_kehadiran: 8,
      kelab_pencapaian: '',
      uniform_unit: 'pengakap',
      uniform_jawatan: 'Ahli',
      uniform_ahli: 'Ya',
      uniform_kehadiran: 12,
      uniform_pencapaian: '',
      sukan_jenis_skor_penglibatan: 'Penglibatan 1',
      kelab_jenis_skor_penglibatan: 'Penglibatan 2',
      uniform_jenis_skor_penglibatan: 'Penglibatan 3',
    };

    expect(record.sukan_jenis_skor_penglibatan).toBe('Penglibatan 1');
    expect(record.kelab_jenis_skor_penglibatan).toBe('Penglibatan 2');
    expect(record.uniform_jenis_skor_penglibatan).toBe('Penglibatan 3');
  });
});

describe('transformToPenglibatan — jenisSkorPenglibatan', () => {
  function makeRecord(overrides: Partial<StudentRecord> = {}): StudentRecord {
    return {
      id: 1,
      nama: 'Test',
      kelas: '4A',
      student_number: 1,
      tahun: 2025,
      sukan_unit: 'bola',
      sukan_jawatan: 'Ahli',
      sukan_ahli: 'Ya',
      sukan_kehadiran: 10,
      sukan_pencapaian: '',
      kelab_unit: 'bm',
      kelab_jawatan: 'Ahli',
      kelab_ahli: 'Ya',
      kelab_kehadiran: 8,
      kelab_pencapaian: '',
      uniform_unit: 'pengakap',
      uniform_jawatan: 'Ahli',
      uniform_ahli: 'Ya',
      uniform_kehadiran: 12,
      uniform_pencapaian: '',
      sukan_jenis_skor_penglibatan: null,
      kelab_jenis_skor_penglibatan: null,
      uniform_jenis_skor_penglibatan: null,
      ...overrides,
    };
  }

  it('includes jenisSkorPenglibatan in sukan_dan_permainan when set', () => {
    const record = makeRecord({ sukan_jenis_skor_penglibatan: 'Penglibatan 1' });
    const result = transformToPenglibatan(record);
    expect(result.sukan_dan_permainan?.jenisSkorPenglibatan).toBe('Penglibatan 1');
  });

  it('includes jenisSkorPenglibatan in kelab_dan_persatuan when set', () => {
    const record = makeRecord({ kelab_jenis_skor_penglibatan: 'Penglibatan 2' });
    const result = transformToPenglibatan(record);
    expect(result.kelab_dan_persatuan?.jenisSkorPenglibatan).toBe('Penglibatan 2');
  });

  it('includes jenisSkorPenglibatan in badan_beruniform when set', () => {
    const record = makeRecord({ uniform_jenis_skor_penglibatan: 'Penglibatan 3' });
    const result = transformToPenglibatan(record);
    expect(result.badan_beruniform?.jenisSkorPenglibatan).toBe('Penglibatan 3');
  });

  it('omits jenisSkorPenglibatan when not set', () => {
    const record = makeRecord({});
    const result = transformToPenglibatan(record);
    expect(result.sukan_dan_permainan?.jenisSkorPenglibatan).toBeUndefined();
    expect(result.kelab_dan_persatuan?.jenisSkorPenglibatan).toBeUndefined();
    expect(result.badan_beruniform?.jenisSkorPenglibatan).toBeUndefined();
  });
});
