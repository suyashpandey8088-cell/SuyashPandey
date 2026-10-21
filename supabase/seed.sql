-- =============================================================================
--  Initial campaign content
--  Every initiative below is a PROPOSAL. Nothing here claims approval,
--  funding, endorsement or adoption by NIAT.
-- =============================================================================

update public.site_settings set
  candidate_name    = 'Suyash Pandey',
  campaign_slogan   = 'Your Voice. Our Campus. Our Future.',
  institution       = 'NIAT',
  position_label    = 'Candidate for Student Council President',
  hero_eyebrow      = 'NIAT · Student Council Presidential Campaign',
  hero_headline     = 'Your Voice. Our Campus. Our Future.',
  hero_supporting   = 'A campaign built around listening, meaningful participation, transparent progress, and ideas that bring students together.',
  portrait_alt      = 'Campaign portrait of Suyash Pandey',
  monogram          = 'SP',
  statement_heading = 'Leadership Starts With Listening.',
  statement_body    = 'I believe student leadership should create opportunities for people to speak up, participate, and contribute to campus life. Most good ideas on a campus already exist — they are simply sitting in a group chat that no one in charge has read.',
  about_heading     = 'A Student First. A Listener Always.',
  about_body        = E'A student at NIAT, standing for Student Council President because I believe the council should feel less like a distant office and more like a conversation.\n\nMy approach is straightforward: listen before proposing, publish what I hear, and report back on what happened next — including the parts that did not work out.\n\nThis campaign is built around six proposals. None of them are things I can deliver alone. All of them are commitments to how I would work with students, and with the college, if elected.',
  about_philosophy  = 'Leadership is not a louder voice. It is a longer attention span — the patience to hear fifty small things, and the discipline to turn them into one clear direction.',
  about_involvement = '',
  about_motivation  = 'Because the distance between students and the decisions that shape their days is usually smaller than it looks, and mostly made of questions nobody asked.',
  closing_heading   = 'Let''s Make Our Voices Count.',
  closing_body      = 'A better campus experience begins with listening, participation, and working together. If you have an idea, a question, or a concern, this page is the beginning of that conversation — not the end of it.',
  election_date     = null,
  contact_email     = null,
  contact_note      = null,
  social_links      = '[]'::jsonb,
  sections          = '{"statement": true, "about": true, "vision": true, "manifesto": true, "updates": true, "events": true, "progress": true, "voice": true, "closing": true}'::jsonb,
  accent_color      = '#76639A',
  accent_deep       = '#443451',
  timezone          = 'Asia/Kolkata',
  site_title        = 'Suyash Pandey — Candidate for Student Council President, NIAT',
  site_description  = 'A campaign built around listening, meaningful participation, transparent progress, and ideas that bring students together.'
where id = 1;

-- ---------------------------------------------------------------------------
-- Stage 1 — vision pillars
-- ---------------------------------------------------------------------------
insert into public.vision_pillars (slug, title, kicker, summary, student_need, approach, benefit, status, display_order)
values
  ('student-voice', 'Student Voice', 'Pillar 01',
   'A standing channel for ideas and concerns, with a visible record of what was raised and how it was handled.',
   'Students often do not know who to tell, or whether anything happened after they did.',
   'A simple, always-open submission route — online and in person — and a monthly summary of recurring themes.',
   'Fewer conversations that end in "I never heard back."', 'proposed', 1),

  ('campus-engagement', 'Campus Engagement', 'Pillar 02',
   'More reasons to take part: inclusive activities, interest-based meetups, and room for quieter students to join in.',
   'Campus life can feel divided between a few loud events and long stretches with nothing in between.',
   'Support student-led activities with clear, low-friction processes, and publish how to propose one.',
   'A calendar that reflects more of the student body, not just the usual organisers.', 'proposed', 2),

  ('communication', 'Communication', 'Pillar 03',
   'One dependable place for announcements, timelines and outcomes — instead of information scattered across apps.',
   'Updates arrive late, incomplete, or only in a channel some students never see.',
   'A single campaign bulletin on this website, with dated updates and an archive that stays searchable.',
   'Everyone works from the same information.', 'proposed', 3),

  ('student-ideas', 'Student Ideas', 'Pillar 04',
   'A structured way to collect suggestions, assess the promising ones, and explain the ones that cannot move forward.',
   'Good suggestions disappear because there is no process between "an idea" and "a decision".',
   'An intake form, a short review rhythm, and a published outcome for each idea that reaches review.',
   'Ideas get an answer rather than a shrug.', 'proposed', 4),

  ('transparency', 'Transparency', 'Pillar 05',
   'An open progress board that shows what was proposed, what is in progress, and what is still waiting on approval.',
   'It is difficult to hold anyone accountable when the status of a proposal is never stated.',
   'Publish every initiative with a clear status and a last-updated date, and keep it current.',
   'Accountability that is visible between elections, not only during them.', 'proposed', 5),

  ('inclusion', 'Inclusion', 'Pillar 06',
   'Accessible, respectful and genuinely inclusive opportunities for every student to take part.',
   'Participation is not equally easy for everyone, and accessibility is usually considered last.',
   'Ask students what access actually requires, and treat accessibility as a starting condition of any activity.',
   'A campus where taking part does not depend on already knowing the right people.', 'proposed', 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Stage 2 — manifesto
-- ---------------------------------------------------------------------------
insert into public.manifesto_items
  (slug, title, category, issue, proposal, why_it_matters, outcome, first_step, considerations, status, display_order)
values
  ('student-voice-initiative', 'The Student Voice Initiative', 'Student Voice',
   'There is no consistent, well-known way for a student to raise a concern and find out what happened to it. Feedback tends to travel through informal channels, which means the students who speak loudest are heard most often.',
   'Create always-open channels for students to submit ideas and concerns — a form on this website, plus periodic in-person listening sessions — and publish a monthly summary of the recurring themes raised, with a note on how each theme is being handled.',
   'A student council is only representative if students can actually reach it. A predictable channel turns scattered complaints into visible patterns the council can act on.',
   'Students know exactly where to raise something, and can see that the same issue, raised by several people, is being tracked and answered.',
   'Launch the submission form on this website and commit to publishing the first themes summary within one month of taking office.',
   'Privacy must be respected: submissions are private by default and nothing is published without permission. The summary reports themes and volumes, never individuals. Requires a reliable review rhythm so submissions do not accumulate unanswered.',
   'proposed', 1),

  ('open-progress-board', 'The Open Progress Board', 'Transparency',
   'Proposals are made, then quietly disappear. Without a stated status, students have no way to tell whether something is being worked on, waiting on approval, or simply dropped.',
   'Maintain a public progress board on this website listing every initiative with its original proposal, current status, a short progress note, and the date it was last updated.',
   'Accountability is a practice, not a slogan. A dated status is the simplest honest signal of whether anything is actually moving.',
   'No initiative can quietly vanish. Every entry carries a visible status and a date, and changes are explained in the campaign updates feed.',
   'Publish the board with all six proposals marked as Proposed, before any work begins.',
   'Statuses must be updated honestly, including when something is on hold. Institutional decisions are not mine to make, so "Awaiting approval" must be used precisely and never dressed up as completion.',
   'proposed', 2),

  ('campus-connect', 'Campus Connect', 'Campus Engagement',
   'Campus activities reach a fairly predictable group of students. Students who are not already involved in organising rarely find an easy entry point.',
   'Encourage inclusive student activities and interest-based meetups, and make the process for proposing and hosting one clearly documented and easy to start.',
   'A campus feels like a community when participation is normal rather than exceptional. Lowering the barrier matters more than adding bigger events.',
   'More students hosting and attending small, student-led activities — including those outside the usual event organisers.',
   'Publish a short, plain-language guide to proposing a campus activity, and collect the first round of interest-based meetup ideas.',
   'Activities need appropriate permissions, spaces and supervision. This is coordination work with the college, not something the council can arrange unilaterally. Safety, accessibility and inclusion must be built into the guide from the start.',
   'proposed', 3),

  ('student-ideas-lab', 'The Student Ideas Lab', 'Student Ideas',
   'Suggestions arrive in many places and mostly end without a recorded outcome. There is no visible process between a good idea and a decision.',
   'Create a structured intake and review process for student suggestions: collect ideas, assess feasibility with the relevant people, and publish an outcome for each one reviewed — including a clear explanation when an idea cannot move forward.',
   'A process is what separates listening from performing listening. Students deserve to know why an idea did or did not progress.',
   'Every idea that reaches review receives a documented response, and the strongest ones become tracked proposals on the progress board.',
   'Collect the first twenty ideas through the submission form and publish the first round of outcomes.',
   'Review is only credible if the right people take part, which means involving college staff early. Turnaround times must be realistic; a slow honest answer is better than a fast empty one.',
   'proposed', 4),

  ('niat-campaign-bulletin', 'The NIAT Campaign Bulletin', 'Communication',
   'Announcements are spread across multiple apps and informal groups. Information arrives late, partially, or not at all for students outside those groups.',
   'Centralise campaign announcements, event information and progress updates in one bulletin on this website, organised by category with a permanent archive and a shareable link for every item.',
   'Shared, dated information is the difference between a rumour and a record. A single source also makes the campaign easier to hold to account.',
   'Students, and anyone else who needs to, can find what was announced, when, and what happened next — without scrolling through months of chat history.',
   'This website is the first version of the bulletin: publish announcements, events and progress reports here, with categories and an archive.',
   'This is a campaign communication channel, not an official NIAT channel. Official college communications remain authoritative and should always be linked rather than duplicated. Keeping it current takes consistent, small effort.',
   'in_progress', 5),

  ('everyone-belongs', 'Everyone Belongs', 'Inclusion',
   'Participation is not equally easy for everyone. Students with accessibility needs, commuters, and those outside dominant social groups can find campus life harder to access, and accessibility is usually considered last.',
   'Ask students what meaningful participation actually requires, and treat accessibility, respect and inclusion as starting conditions — not optional extras — of every activity the council supports.',
   'A council that represents students must be reachable by all of them. Inclusion is a design requirement, not a gesture.',
   'Activities and communication that more students can genuinely access, shaped by what students say they need rather than what is assumed.',
   'Run a short, accessible consultation specifically on barriers to participation, and publish what was raised.',
   'This requires listening carefully and avoiding assumptions about what students need. Physical access, timing, language and cost all matter. Any changes to campus facilities need college involvement.',
   'proposed', 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Progress board
-- ---------------------------------------------------------------------------
insert into public.progress_items (initiative_name, original_proposal, status, progress_note, percent, display_order)
values
  ('The Student Voice Initiative',
   'Always-open channels for ideas and concerns, with a monthly summary of recurring themes.',
   'proposed',
   'The submission form is live on this website. The review rhythm and the first themes summary begin once the campaign is under way.',
   null, 1),

  ('The Open Progress Board',
   'A public board listing every initiative with its status, progress note and last-updated date.',
   'in_progress',
   'This section is the first version of the board. All six proposals are published with an explicit status, and entries will carry dated updates as things move.',
   35, 2),

  ('Campus Connect',
   'Inclusive student activities and interest-based meetups, with a documented route to propose one.',
   'proposed',
   'Proposal published. The plain-language guide to proposing an activity is the first deliverable.',
   null, 3),

  ('The Student Ideas Lab',
   'A structured intake and review process, with a published outcome for every idea reviewed.',
   'proposed',
   'Proposal published. The intake form is live; the review process and published outcomes come next.',
   null, 4),

  ('The NIAT Campaign Bulletin',
   'A single bulletin for announcements, events and progress, with categories, archive and shareable links.',
   'in_progress',
   'This website is the bulletin, and it is live. Announcements, categories, archive and sharing work today; the publishing rhythm is being established.',
   55, 5),

  ('Everyone Belongs',
   'Accessibility, respect and inclusion treated as starting conditions of every activity.',
   'proposed',
   'Proposal published. A consultation on barriers to participation is the first step.',
   null, 6)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Launch updates (factual statements about this site and the campaign)
-- ---------------------------------------------------------------------------
insert into public.update_posts
  (slug, title, summary, body, category, status, published_at, is_pinned, external_url, external_label)
values
  ('campaign-platform-is-live', 'The campaign platform is live',
   'The full campaign — six proposals, a progress board, an events calendar and an open channel for student ideas — is published today.',
   E'This website is now live, and it is the campaign''s primary home.\n\nIt is deliberately built as a record rather than a poster. Every proposal is published in full, with the issue it responds to, the intended outcome, a realistic first step and the considerations that could hold it back. Each entry carries a status and a date.\n\nNothing on this site claims approval, funding or endorsement. All six initiatives are proposals — ideas put forward for students to judge, and for the college to consider with the student council if the campaign succeeds.\n\n## What you can do here\n\n- Read the six proposals in the manifesto\n- Follow the progress board as statuses change\n- See upcoming events once they are confirmed\n- Send an idea, question or concern through the Student Voice form\n\nIf something here is unclear, that is worth telling me. The form at the bottom of the site reaches the campaign directly.',
   'announcements', 'published', now() - interval '6 hours', true, null, null),

  ('six-proposals-published', 'Six proposals, published in full',
   'Each initiative now has a stated issue, proposal, intended outcome, first step and status — all labelled Proposed.',
   E'All six campaign proposals are published in full today: the Student Voice Initiative, the Open Progress Board, Campus Connect, the Student Ideas Lab, the NIAT Campaign Bulletin and Everyone Belongs.\n\nEach one is written the same way, so they can be judged the same way:\n\n1. The issue or opportunity\n2. The proposed initiative\n3. Why it matters to students\n4. The intended outcome\n5. A realistic first step\n6. Implementation considerations\n\nEvery item is marked **Proposed**. The one exception is the campaign bulletin, which is marked **In Progress** because this website is already its first version.\n\nThese are commitments to a way of working, not promises of outcomes that depend on decisions I do not control.',
   'manifesto_updates', 'published', now() - interval '2 days', false, null, null),

  ('how-the-progress-board-works', 'How the progress board will work',
   'Five honest statuses, a dated note for every change, and no percentage unless there is something real to measure.',
   E'The progress board exists to answer one question quickly: what is actually happening?\n\nEvery initiative sits in one of five states — **Proposed**, **In Progress**, **Awaiting Approval**, **Completed** or **On Hold**. Each carries a short note explaining the current position and the date it was last updated.\n\nTwo rules keep it honest:\n\n- A percentage is only shown when there is something meaningful to measure. Most entries show a status and a note instead.\n- Nothing is marked complete because time has passed. Completion means the thing described has happened.\n\n"Awaited approval" is not a hiding place. When something depends on a college decision, the board will say so plainly, and the campaign updates feed will explain it.',
   'progress_reports', 'published', now() - interval '4 days', false, null, null)
on conflict (slug) do nothing;

update public.site_settings
set featured_update_id = (select id from public.update_posts where slug = 'campaign-platform-is-live')
where id = 1;

update public.update_posts
set related_manifesto_id = (select id from public.manifesto_items where slug = 'student-voice-initiative')
where slug = 'six-proposals-published';

-- ---------------------------------------------------------------------------
-- Two clearly-labelled drafts so the events module is not empty on first login.
-- Drafts are never visible on the public site.
-- ---------------------------------------------------------------------------
insert into public.events (slug, title, description, starts_at, venue, additional_info, state, is_published)
values
  ('draft-listening-session', 'Draft — Open Listening Session',
   'Internal draft. Replace this title, date and venue with confirmed details before publishing. This is not a confirmed event and does not appear on the public site.',
   now() + interval '21 days',
   'To be confirmed',
   'Add the confirmed date, time, venue and any registration link before publishing.',
   'scheduled', false),
  ('draft-campus-conversation', 'Draft — Campus Conversation',
   'Internal draft. Replace this title, date and venue with confirmed details before publishing. This is not a confirmed event and does not appear on the public site.',
   now() + interval '35 days',
   'To be confirmed',
   'Add the confirmed date, time, venue and any registration link before publishing.',
   'scheduled', false)
on conflict (slug) do nothing;
