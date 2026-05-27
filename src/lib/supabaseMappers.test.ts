import { describe, it, expect } from 'vitest';
import { mapStudent } from '../lib/supabaseMappers';

const mockUnits = [
  { code: 'pengakap', name: 'Pengakap', category: 'uniform', shortName: 'Pengakap', chief: '', advisors: [] },
  { code: 'bolasepak', name: 'Bolasepak', category: 'sukan', shortName: 'Bola', chief: '', advisors: [] },
  { code: 'bm', name: 'Bahasa Melayu', category: 'kelab', shortName: 'BM', chief: '', advisors: [] },
];

const mockClasses = [
  { id: '1', name: '4 Amanah', teacher: 'Ahmad', surname: 'Ahmad', givenName: '' },
];

function makeRow(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    nama: 'Ali bin Abu',
    kelas: '4 Amanah',
    student_number: 123,
    tahun: 2025,
    sukan_unit: 'bolasepak',
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
    ...overrides,
  };
}

describe('mapStudent — jenisSkorPenglibatan', () => {
  it('maps sukan_jenis_skor_penglibatan to rawPenglibatan.sukan_dan_permainan.jenisSkorPenglibatan', () => {
    const row = makeRow({ sukan_jenis_skor_penglibatan: 'Penglibatan 1' });
    const result = mapStudent(row, mockUnits, mockClasses);
    expect(result.rawPenglibatan?.sukan_dan_permainan?.jenisSkorPenglibatan).toBe('Penglibatan 1');
  });

  it('maps kelab_jenis_skor_penglibatan to rawPenglibatan.kelab_dan_persatuan.jenisSkorPenglibatan', () => {
    const row = makeRow({ kelab_jenis_skor_penglibatan: 'Penglibatan 2' });
    const result = mapStudent(row, mockUnits, mockClasses);
    expect(result.rawPenglibatan?.kelab_dan_persatuan?.jenisSkorPenglibatan).toBe('Penglibatan 2');
  });

  it('maps uniform_jenis_skor_penglibatan to rawPenglibatan.badan_beruniform.jenisSkorPenglibatan', () => {
    const row = makeRow({ uniform_jenis_skor_penglibatan: 'Penglibatan 3' });
    const result = mapStudent(row, mockUnits, mockClasses);
    expect(result.rawPenglibatan?.badan_beruniform?.jenisSkorPenglibatan).toBe('Penglibatan 3');
  });

  it('defaults jenisSkorPenglibatan to empty string when DB column is null', () => {
    const row = makeRow({
      sukan_jenis_skor_penglibatan: null,
      kelab_jenis_skor_penglibatan: null,
      uniform_jenis_skor_penglibatan: null,
    });
    const result = mapStudent(row, mockUnits, mockClasses);
    expect(result.rawPenglibatan?.sukan_dan_permainan?.jenisSkorPenglibatan).toBe('');
    expect(result.rawPenglibatan?.kelab_dan_persatuan?.jenisSkorPenglibatan).toBe('');
    expect(result.rawPenglibatan?.badan_beruniform?.jenisSkorPenglibatan).toBe('');
  });

  it('defaults jenisSkorPenglibatan to empty string when DB column is undefined', () => {
    const row = makeRow({});
    const result = mapStudent(row, mockUnits, mockClasses);
    expect(result.rawPenglibatan?.sukan_dan_permainan?.jenisSkorPenglibatan).toBe('');
    expect(result.rawPenglibatan?.kelab_dan_persatuan?.jenisSkorPenglibatan).toBe('');
    expect(result.rawPenglibatan?.badan_beruniform?.jenisSkorPenglibatan).toBe('');
  });
});
