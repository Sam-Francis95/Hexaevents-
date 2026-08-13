// Participation Level (Octalysis Core Drive 2: Development & Accomplishment).
// Every input here already comes from data the app already fetches
// (registrations, attendance, certificates, feedback) — no new "points
// economy" or backend changes required. Thresholds/weights below are a
// deliberate starting point to tune later once real usage data exists; the
// important shape is "derive everything from existing counts, expose tier +
// progress-to-next" (Part I.1 of the redesign brief).

export const PARTICIPATION_TIERS = [
  { key: 'explorer', label: 'Explorer', min: 0, icon: 'Compass' },
  { key: 'regular', label: 'Regular', min: 5, icon: 'CalendarCheck' },
  { key: 'contributor', label: 'Contributor', min: 15, icon: 'Star' },
  { key: 'champion', label: 'Champion', min: 30, icon: 'Trophy' },
];

export function computeParticipationScore({
  registrationsCount = 0,
  attendedCount = 0,
  certificatesCount = 0,
  feedbackGivenCount = 0,
}) {
  return registrationsCount * 1 + attendedCount * 2 + certificatesCount * 3 + feedbackGivenCount * 2;
}

export function computeParticipationLevel(stats) {
  const score = computeParticipationScore(stats);
  const tier = [...PARTICIPATION_TIERS].reverse().find((t) => score >= t.min);
  const currentIndex = PARTICIPATION_TIERS.indexOf(tier);
  const next = PARTICIPATION_TIERS[currentIndex + 1] || null;
  const progress = next ? (score - tier.min) / (next.min - tier.min) : 1;
  return { score, tier, next, progress: Math.min(Math.max(progress, 0), 1) };
}
