import { buildWeakAreas, getWeakAreaStatus, getWeakAreaStatusLabel } from '@/utils/review';

describe('review utilities', () => {
  it('marks low-sample areas as not enough data', () => {
    expect(getWeakAreaStatus(0.2, 2)).toBe('not_enough_data');
  });

  it('classifies needs attention and strong areas', () => {
    expect(getWeakAreaStatus(0.6, 10)).toBe('needs_attention');
    expect(getWeakAreaStatus(0.9, 10)).toBe('strong');
  });

  it('returns readable labels', () => {
    expect(getWeakAreaStatusLabel('developing')).toBe('Developing');
  });

  it('sorts weak areas by lowest accuracy first and places low-sample areas last', () => {
    const weakAreas = buildWeakAreas(
      [
        {
          sectionId: 'section-a',
          sectionCode: 'CORE',
          sectionName: 'Core',
          topicId: null,
          topicName: null,
          answeredCount: 10,
          correctCount: 5,
          incorrectCount: 5,
          accuracy: 0.5,
        },
      ],
      [
        {
          sectionId: 'section-a',
          sectionCode: 'CORE',
          sectionName: 'Core',
          topicId: 'topic-a',
          topicName: 'Recovery Requirements',
          answeredCount: 2,
          correctCount: 1,
          incorrectCount: 1,
          accuracy: 0.5,
        },
      ],
    );

    expect(weakAreas[0]?.type).toBe('section');
    expect(weakAreas[weakAreas.length - 1]?.status).toBe('not_enough_data');
  });
});
