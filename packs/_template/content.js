window.PREP_CONTENT = {
  meta: { id: "company-role-round", title: "Company Role Prep", eyebrow: "Company · Role · Round", heading: "Prep", footer: "Exercises are graded by Claude against a rubric; progress is saved locally and, when published as an artifact, server-side." },
  // One sentence naming the candidate's verified record; substituted for {{HONESTY}} in every rubric.
  honesty: "Honesty rule: the candidate's verified record is <record>; any claim beyond it is an automatic retry with the overclaim named.",
  interviewAt: null,
  groups: [
    { id: "intel", label: "The round", sub: "what it is and how it is scored", ids: ["round-intel"] },
    { id: "core", label: "Core subjects", sub: "the substance of the round", ids: ["system-design-fundamentals"] }
  ],
  useCore: ["system-design-fundamentals"],
  interviewer: null,
  readings: {},
  glossary: [],
  topics: [
    {
      id: "round-intel", title: "The round", level: "warning", levelLabel: "Read first",
      why: `One sentence on what this round is and why it matters.`,
      learn: [
        { id: "ri-0", part: "field", title: "Foundations: the words you need first",
          body: `<p>Define every term this chapter uses.</p><ul><li><b>term</b> — definition. <i>Example.</i></li></ul><p><b>In the room:</b> …</p>`,
          deeper: null, check: null }
      ],
      connect: null,
      activities: [],
      sayQuestion: null, sayItOutLoud: null
    }
  ]
};
