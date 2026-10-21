import type {
  CampaignEvent,
  ManifestoItem,
  ProgressItem,
  SiteSettings,
  UpdatePost,
  VisionPillar,
} from "./types";

/**
 * Last-known-good copy for the campaign.
 *
 * If the database is briefly unreachable the public site renders this instead
 * of an error page — a campaign site should never go blank because of a
 * transient network failure. It is also what `next build` renders when no
 * environment variables are present, which keeps builds hermetic.
 *
 * Production content lives in the database and is edited from /admin.
 */

const NOW = "2026-10-21T08:00:00.000Z";

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  candidate_name: "Suyash Pandey",
  campaign_slogan: "Your Voice. Our Campus. Our Future.",
  institution: "NIAT",
  position_label: "Candidate for Student Council President",
  hero_eyebrow: "NIAT · Student Council Presidential Campaign",
  hero_headline: "Your Voice. Our Campus. Our Future.",
  hero_supporting:
    "A campaign built around listening, meaningful participation, transparent progress, and ideas that bring students together.",
  portrait_url: null,
  portrait_alt: "Campaign portrait of Suyash Pandey",
  monogram: "SP",
  logo_url: null,
  logo_alt: "",
  statement_heading: "Leadership Starts With Listening.",
  statement_body:
    "I believe student leadership should create opportunities for people to speak up, participate, and contribute to campus life. Most good ideas on a campus already exist — they are simply sitting in a group chat that no one in charge has read.",
  about_heading: "A Student First. A Listener Always.",
  about_body:
    "A student at NIAT, standing for Student Council President because I believe the council should feel less like a distant office and more like a conversation.\n\nMy approach is straightforward: listen before proposing, publish what I hear, and report back on what happened next — including the parts that did not work out.\n\nThis campaign is built around six proposals. None of them are things I can deliver alone. All of them are commitments to how I would work with students, and with the college, if elected.",
  about_philosophy:
    "Leadership is not a louder voice. It is a longer attention span — the patience to hear fifty small things, and the discipline to turn them into one clear direction.",
  about_involvement: "",
  about_motivation:
    "Because the distance between students and the decisions that shape their days is usually smaller than it looks, and mostly made of questions nobody asked.",
  closing_heading: "Let's Make Our Voices Count.",
  closing_body:
    "A better campus experience begins with listening, participation, and working together. If you have an idea, a question, or a concern, this page is the beginning of that conversation — not the end of it.",
  election_date: null,
  social_links: [],
  contact_email: null,
  contact_note: null,
  featured_update_id: null,
  sections: {
    statement: true,
    about: true,
    vision: true,
    manifesto: true,
    updates: true,
    events: true,
    progress: true,
    voice: true,
    closing: true,
  },
  accent_color: "#76639A",
  accent_deep: "#443451",
  timezone: "Asia/Kolkata",
  site_title: "Suyash Pandey — Candidate for Student Council President, NIAT",
  site_description:
    "A campaign built around listening, meaningful participation, transparent progress, and ideas that bring students together.",
  og_image_url: null,
  updated_at: NOW,
};

export const SECTION_KEYS = [
  "statement",
  "about",
  "vision",
  "manifesto",
  "updates",
  "events",
  "progress",
  "voice",
  "closing",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  statement: "Campaign statement",
  about: "Meet the candidate",
  vision: "Campaign vision",
  manifesto: "Manifesto",
  updates: "Live updates",
  events: "Events",
  progress: "Progress & accountability",
  voice: "Student Voice form",
  closing: "Closing statement",
};

export const FALLBACK_VISION_PILLARS: VisionPillar[] = [
  {
    id: "fallback-vision-1",
    slug: "student-voice",
    title: "Student Voice",
    kicker: "Pillar 01",
    summary:
      "A standing channel for ideas and concerns, with a visible record of what was raised and how it was handled.",
    student_need:
      "Students often do not know who to tell, or whether anything happened after they did.",
    approach:
      "A simple, always-open submission route — online and in person — and a monthly summary of recurring themes.",
    benefit: "Fewer conversations that end in “I never heard back.”",
    status: "proposed",
    display_order: 1,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-vision-2",
    slug: "campus-engagement",
    title: "Campus Engagement",
    kicker: "Pillar 02",
    summary:
      "More reasons to take part: inclusive activities, interest-based meetups, and room for quieter students to join in.",
    student_need:
      "Campus life can feel divided between a few loud events and long stretches with nothing in between.",
    approach:
      "Support student-led activities with clear, low-friction processes, and publish how to propose one.",
    benefit:
      "A calendar that reflects more of the student body, not just the usual organisers.",
    status: "proposed",
    display_order: 2,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-vision-3",
    slug: "communication",
    title: "Communication",
    kicker: "Pillar 03",
    summary:
      "One dependable place for announcements, timelines and outcomes — instead of information scattered across apps.",
    student_need:
      "Updates arrive late, incomplete, or only in a channel some students never see.",
    approach:
      "A single campaign bulletin on this website, with dated updates and an archive that stays searchable.",
    benefit: "Everyone works from the same information.",
    status: "proposed",
    display_order: 3,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-vision-4",
    slug: "student-ideas",
    title: "Student Ideas",
    kicker: "Pillar 04",
    summary:
      "A structured way to collect suggestions, assess the promising ones, and explain the ones that cannot move forward.",
    student_need:
      "Good suggestions disappear because there is no process between “an idea” and “a decision”.",
    approach:
      "An intake form, a short review rhythm, and a published outcome for each idea that reaches review.",
    benefit: "Ideas get an answer rather than a shrug.",
    status: "proposed",
    display_order: 4,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-vision-5",
    slug: "transparency",
    title: "Transparency",
    kicker: "Pillar 05",
    summary:
      "An open progress board that shows what was proposed, what is in progress, and what is still waiting on approval.",
    student_need:
      "It is difficult to hold anyone accountable when the status of a proposal is never stated.",
    approach:
      "Publish every initiative with a clear status and a last-updated date, and keep it current.",
    benefit: "Accountability that is visible between elections, not only during them.",
    status: "proposed",
    display_order: 5,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-vision-6",
    slug: "inclusion",
    title: "Inclusion",
    kicker: "Pillar 06",
    summary:
      "Accessible, respectful and genuinely inclusive opportunities for every student to take part.",
    student_need:
      "Participation is not equally easy for everyone, and accessibility is usually considered last.",
    approach:
      "Ask students what access actually requires, and treat accessibility as a starting condition of any activity.",
    benefit:
      "A campus where taking part does not depend on already knowing the right people.",
    status: "proposed",
    display_order: 6,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const FALLBACK_MANIFESTO: ManifestoItem[] = [
  {
    id: "fallback-manifesto-1",
    slug: "student-voice-initiative",
    title: "The Student Voice Initiative",
    category: "Student Voice",
    issue:
      "There is no consistent, well-known way for a student to raise a concern and find out what happened to it.",
    proposal:
      "Create always-open channels for students to submit ideas and concerns — a form on this website, plus periodic in-person listening sessions — and publish a monthly summary of the recurring themes raised.",
    why_it_matters:
      "A student council is only representative if students can actually reach it.",
    outcome:
      "Students know exactly where to raise something, and can see that recurring issues are being tracked and answered.",
    first_step:
      "Launch the submission form on this website and commit to publishing the first themes summary within one month of taking office.",
    considerations:
      "Privacy must be respected: submissions are private by default and nothing is published without permission.",
    status: "proposed",
    display_order: 1,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-manifesto-2",
    slug: "open-progress-board",
    title: "The Open Progress Board",
    category: "Transparency",
    issue:
      "Proposals are made, then quietly disappear. Without a stated status, students cannot tell what is being worked on.",
    proposal:
      "Maintain a public progress board listing every initiative with its original proposal, current status, a short progress note, and the date it was last updated.",
    why_it_matters:
      "Accountability is a practice, not a slogan. A dated status is the simplest honest signal of whether anything is moving.",
    outcome:
      "No initiative can quietly vanish. Every entry carries a visible status and date.",
    first_step: "Publish the board with all six proposals marked as Proposed.",
    considerations:
      "Statuses must be updated honestly. Institutional decisions are not mine to make, so “Awaiting approval” must never be dressed up as completion.",
    status: "proposed",
    display_order: 2,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-manifesto-3",
    slug: "campus-connect",
    title: "Campus Connect",
    category: "Campus Engagement",
    issue:
      "Campus activities reach a fairly predictable group of students. Students who are not already organising rarely find an easy entry point.",
    proposal:
      "Encourage inclusive student activities and interest-based meetups, and make the process for proposing and hosting one clearly documented.",
    why_it_matters:
      "A campus feels like a community when participation is normal rather than exceptional.",
    outcome:
      "More students hosting and attending small, student-led activities.",
    first_step:
      "Publish a plain-language guide to proposing a campus activity, and collect the first round of meetup ideas.",
    considerations:
      "Activities need permissions, spaces and supervision — this is coordination work with the college.",
    status: "proposed",
    display_order: 3,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-manifesto-4",
    slug: "student-ideas-lab",
    title: "The Student Ideas Lab",
    category: "Student Ideas",
    issue:
      "Suggestions arrive in many places and mostly end without a recorded outcome.",
    proposal:
      "Create a structured intake and review process for student suggestions, and publish an outcome for each one reviewed — including a clear explanation when an idea cannot move forward.",
    why_it_matters:
      "A process is what separates listening from performing listening.",
    outcome:
      "Every idea that reaches review receives a documented response.",
    first_step:
      "Collect the first twenty ideas through the submission form and publish the first round of outcomes.",
    considerations:
      "Review is only credible if the right people take part, which means involving college staff early.",
    status: "proposed",
    display_order: 4,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-manifesto-5",
    slug: "niat-campaign-bulletin",
    title: "The NIAT Campaign Bulletin",
    category: "Communication",
    issue:
      "Announcements are spread across multiple apps and informal groups, so information arrives late or not at all.",
    proposal:
      "Centralise campaign announcements, event information and progress updates in one bulletin on this website, with categories, an archive and a shareable link for every item.",
    why_it_matters:
      "Shared, dated information is the difference between a rumour and a record.",
    outcome:
      "Anyone can find what was announced, when, and what happened next.",
    first_step:
      "This website is the first version of the bulletin: publish announcements, events and progress reports here.",
    considerations:
      "This is a campaign channel, not an official NIAT channel. Official college communications remain authoritative.",
    status: "in_progress",
    display_order: 5,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-manifesto-6",
    slug: "everyone-belongs",
    title: "Everyone Belongs",
    category: "Inclusion",
    issue:
      "Participation is not equally easy for everyone, and accessibility is usually considered last.",
    proposal:
      "Ask students what meaningful participation actually requires, and treat accessibility, respect and inclusion as starting conditions of every activity.",
    why_it_matters:
      "A council that represents students must be reachable by all of them.",
    outcome:
      "Activities and communication that more students can genuinely access.",
    first_step:
      "Run a short, accessible consultation specifically on barriers to participation, and publish what was raised.",
    considerations:
      "This requires listening carefully and avoiding assumptions. Physical access, timing, language and cost all matter.",
    status: "proposed",
    display_order: 6,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const FALLBACK_PROGRESS: ProgressItem[] = [
  {
    id: "fallback-progress-1",
    initiative_name: "The Student Voice Initiative",
    original_proposal:
      "Always-open channels for ideas and concerns, with a monthly summary of recurring themes.",
    status: "proposed",
    progress_note:
      "The submission form is live on this website. The review rhythm and first themes summary begin once the campaign is under way.",
    percent: null,
    related_update_id: null,
    display_order: 1,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-progress-2",
    initiative_name: "The Open Progress Board",
    original_proposal:
      "A public board listing every initiative with its status, progress note and last-updated date.",
    status: "in_progress",
    progress_note:
      "This section is the first version of the board. All six proposals are published with an explicit status.",
    percent: 35,
    related_update_id: null,
    display_order: 2,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-progress-3",
    initiative_name: "Campus Connect",
    original_proposal:
      "Inclusive student activities and interest-based meetups, with a documented route to propose one.",
    status: "proposed",
    progress_note:
      "Proposal published. The plain-language guide to proposing an activity is the first deliverable.",
    percent: null,
    related_update_id: null,
    display_order: 3,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-progress-4",
    initiative_name: "The Student Ideas Lab",
    original_proposal:
      "A structured intake and review process, with a published outcome for every idea reviewed.",
    status: "proposed",
    progress_note:
      "Proposal published. The intake form is live; the review process and published outcomes come next.",
    percent: null,
    related_update_id: null,
    display_order: 4,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-progress-5",
    initiative_name: "The NIAT Campaign Bulletin",
    original_proposal:
      "A single bulletin for announcements, events and progress, with categories, archive and shareable links.",
    status: "in_progress",
    progress_note:
      "This website is the bulletin, and it is live. Categories, archive and sharing work today.",
    percent: 55,
    related_update_id: null,
    display_order: 5,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-progress-6",
    initiative_name: "Everyone Belongs",
    original_proposal:
      "Accessibility, respect and inclusion treated as starting conditions of every activity.",
    status: "proposed",
    progress_note:
      "Proposal published. A consultation on barriers to participation is the first step.",
    percent: null,
    related_update_id: null,
    display_order: 6,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const FALLBACK_UPDATES: UpdatePost[] = [
  {
    id: "fallback-update-1",
    slug: "campaign-platform-is-live",
    title: "The campaign platform is live",
    summary:
      "The full campaign — six proposals, a progress board, an events calendar and an open channel for student ideas — is published today.",
    body: "This website is now live, and it is the campaign's primary home.\n\nIt is deliberately built as a record rather than a poster. Every proposal is published in full, with the issue it responds to, the intended outcome, a realistic first step and the considerations that could hold it back.\n\n## What you can do here\n\n- Read the six proposals in the manifesto\n- Follow the progress board as statuses change\n- See upcoming events once they are confirmed\n- Send an idea, question or concern through the Student Voice form",
    category: "announcements",
    status: "published",
    published_at: "2026-10-21T06:00:00.000Z",
    scheduled_for: null,
    cover_image_url: null,
    cover_image_alt: null,
    gallery: [],
    related_manifesto_id: null,
    external_url: null,
    external_label: null,
    is_pinned: true,
    author_id: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-update-2",
    slug: "six-proposals-published",
    title: "Six proposals, published in full",
    summary:
      "Each initiative now has a stated issue, proposal, intended outcome, first step and status — all labelled Proposed.",
    body: "All six campaign proposals are published in full today. Each one is written the same way, so they can be judged the same way.\n\nEvery item is marked **Proposed**. The one exception is the campaign bulletin, marked **In Progress** because this website is already its first version.",
    category: "manifesto_updates",
    status: "published",
    published_at: "2026-10-19T10:00:00.000Z",
    scheduled_for: null,
    cover_image_url: null,
    cover_image_alt: null,
    gallery: [],
    related_manifesto_id: "fallback-manifesto-1",
    external_url: null,
    external_label: null,
    is_pinned: false,
    author_id: null,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "fallback-update-3",
    slug: "how-the-progress-board-works",
    title: "How the progress board will work",
    summary:
      "Five honest statuses, a dated note for every change, and no percentage unless there is something real to measure.",
    body: "The progress board exists to answer one question quickly: what is actually happening?\n\nEvery initiative sits in one of five states — **Proposed**, **In Progress**, **Awaiting Approval**, **Completed** or **On Hold**.",
    category: "progress_reports",
    status: "published",
    published_at: "2026-10-17T10:00:00.000Z",
    scheduled_for: null,
    cover_image_url: null,
    cover_image_alt: null,
    gallery: [],
    related_manifesto_id: null,
    external_url: null,
    external_label: null,
    is_pinned: false,
    author_id: null,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const FALLBACK_EVENTS: CampaignEvent[] = [];
