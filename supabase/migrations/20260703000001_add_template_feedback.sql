-- Faza 3 Korak 6 — feedback na kvalitet prepoznavanja obrasca (samo negativan se loguje).
-- Ne triggeruje automatsku re-analizu — samo evidencija. 3+ negativna za isti fingerprint
-- označavaju template za ručni pregled (needs_review), pregled je van obima (backlog).
-- Pristup isključivo preko service-role klijenta — RLS uključen bez policy-ja,
-- isti princip kao form_templates.

CREATE TABLE public.template_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX template_feedback_fingerprint_idx ON public.template_feedback(fingerprint);

ALTER TABLE public.template_feedback ENABLE ROW LEVEL SECURITY;
-- Namerno bez policy-ja — samo service-role (admin klijent, server-side) ima pristup.

-- Flag za ručni pregled templatea posle 3+ negativna feedbacka.
ALTER TABLE public.form_templates ADD COLUMN needs_review boolean NOT NULL DEFAULT false;
