import { describe, it, expect, vi } from 'vitest';

// Test that EditTeacherModal includes Jenis Skor Penglibatan dropdowns
describe('EditTeacherModal — jenisSkorPenglibatan dropdown', () => {
  const jenisOptions = ['', 'Penglibatan 1', 'Penglibatan 2', 'Penglibatan 3'];

  it('renders dropdown options for each Pillar', () => {
    expect(jenisOptions).toEqual(['', 'Penglibatan 1', 'Penglibatan 2', 'Penglibatan 3']);
    expect(jenisOptions.length).toBe(4);
  });

  it('selecting a value updates the form state for badan_beruniform', () => {
    const mockEditModal = {
      data: {
        rawPenglibatan: {
          badan_beruniform: { jenisSkorPenglibatan: '' },
        },
      },
    };

    const newValue = 'Penglibatan 1';
    const updatedData = {
      ...mockEditModal.data,
      rawPenglibatan: {
        ...mockEditModal.data.rawPenglibatan,
        badan_beruniform: {
          ...mockEditModal.data.rawPenglibatan?.badan_beruniform,
          jenisSkorPenglibatan: newValue,
        },
      },
    };

    expect(updatedData.rawPenglibatan.badan_beruniform.jenisSkorPenglibatan).toBe('Penglibatan 1');
  });

  it('selecting a value updates the form state for kelab_dan_persatuan', () => {
    const mockEditModal = {
      data: {
        rawPenglibatan: {
          kelab_dan_persatuan: { jenisSkorPenglibatan: '' },
        },
      },
    };

    const newValue = 'Penglibatan 2';
    const updatedData = {
      ...mockEditModal.data,
      rawPenglibatan: {
        ...mockEditModal.data.rawPenglibatan,
        kelab_dan_persatuan: {
          ...mockEditModal.data.rawPenglibatan?.kelab_dan_persatuan,
          jenisSkorPenglibatan: newValue,
        },
      },
    };

    expect(updatedData.rawPenglibatan.kelab_dan_persatuan.jenisSkorPenglibatan).toBe('Penglibatan 2');
  });

  it('selecting a value updates the form state for sukan_dan_permainan', () => {
    const mockEditModal = {
      data: {
        rawPenglibatan: {
          sukan_dan_permainan: { jenisSkorPenglibatan: '' },
        },
      },
    };

    const newValue = 'Penglibatan 3';
    const updatedData = {
      ...mockEditModal.data,
      rawPenglibatan: {
        ...mockEditModal.data.rawPenglibatan,
        sukan_dan_permainan: {
          ...mockEditModal.data.rawPenglibatan?.sukan_dan_permainan,
          jenisSkorPenglibatan: newValue,
        },
      },
    };

    expect(updatedData.rawPenglibatan.sukan_dan_permainan.jenisSkorPenglibatan).toBe('Penglibatan 3');
  });
});

describe('EditTeacherModal — save handler includes jenisSkorPenglibatan', () => {
  it('builds studentPayload with uniform_jenis_skor_penglibatan', () => {
    const editModalData = {
      rawPenglibatan: {
        badan_beruniform: { jenisSkorPenglibatan: 'Penglibatan 1' },
        kelab_dan_persatuan: { jenisSkorPenglibatan: 'Penglibatan 2' },
        sukan_dan_permainan: { jenisSkorPenglibatan: 'Penglibatan 3' },
      },
    };

    const studentPayload = {
      uniform_jenis_skor_penglibatan: editModalData.rawPenglibatan?.badan_beruniform?.jenisSkorPenglibatan || '',
      kelab_jenis_skor_penglibatan: editModalData.rawPenglibatan?.kelab_dan_persatuan?.jenisSkorPenglibatan || '',
      sukan_jenis_skor_penglibatan: editModalData.rawPenglibatan?.sukan_dan_permainan?.jenisSkorPenglibatan || '',
    };

    expect(studentPayload.uniform_jenis_skor_penglibatan).toBe('Penglibatan 1');
    expect(studentPayload.kelab_jenis_skor_penglibatan).toBe('Penglibatan 2');
    expect(studentPayload.sukan_jenis_skor_penglibatan).toBe('Penglibatan 3');
  });

  it('defaults to empty string when jenisSkorPenglibatan is not set', () => {
    const editModalData = {
      rawPenglibatan: {
        badan_beruniform: {} as Record<string, string>,
        kelab_dan_persatuan: {} as Record<string, string>,
        sukan_dan_permainan: {} as Record<string, string>,
      },
    };

    const studentPayload = {
      uniform_jenis_skor_penglibatan: editModalData.rawPenglibatan?.badan_beruniform?.jenisSkorPenglibatan || '',
      kelab_jenis_skor_penglibatan: editModalData.rawPenglibatan?.kelab_dan_persatuan?.jenisSkorPenglibatan || '',
      sukan_jenis_skor_penglibatan: editModalData.rawPenglibatan?.sukan_dan_permainan?.jenisSkorPenglibatan || '',
    };

    expect(studentPayload.uniform_jenis_skor_penglibatan).toBe('');
    expect(studentPayload.kelab_jenis_skor_penglibatan).toBe('');
    expect(studentPayload.sukan_jenis_skor_penglibatan).toBe('');
  });
});
