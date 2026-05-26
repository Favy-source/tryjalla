/**
 * /projects/new — 9-step project creation wizard.
 *
 * Step flow:
 *   1 Country → 2 Project Type → 3 Building Type → 4 Floors →
 *   5 Rooms → 6 Boys Quarters → 7 Roof Type → 8 Details → 9 Summary
 *
 * On final step the wizard calls create-project (edge function — Day 4).
 * For now it logs the payload and navigates to /projects.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { WizardShell } from "@/components/projects/wizard/WizardShell";
import { StepCountry }       from "@/components/projects/wizard/steps/StepCountry";
import { StepProjectType }   from "@/components/projects/wizard/steps/StepProjectType";
import { StepBuildingType }  from "@/components/projects/wizard/steps/StepBuildingType";
import { StepFloors }        from "@/components/projects/wizard/steps/StepFloors";
import { StepRooms }         from "@/components/projects/wizard/steps/StepRooms";
import { StepBoysQuarters }  from "@/components/projects/wizard/steps/StepBoysQuarters";
import { StepRoofType }      from "@/components/projects/wizard/steps/StepRoofType";
import { StepDetails }       from "@/components/projects/wizard/steps/StepDetails";
import { StepSummary }       from "@/components/projects/wizard/steps/StepSummary";
import { type WizardState, WIZARD_INITIAL_STATE } from "@/components/projects/wizard/wizardTypes";

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  { title: "Where are you building?",       subtitle: "Select the country for your construction project." },
  { title: "What type of project?",         subtitle: "Choose the category that best describes your build." },
  { title: "What type of building?",        subtitle: "Select the structure you're planning to build." },
  { title: "How many floors?",              subtitle: "Include ground floor in your count." },
  { title: "How many rooms?",               subtitle: "Configure the number of rooms on each floor." },
  { title: "Boys quarters?",                subtitle: "Add separate staff accommodation units if needed." },
  { title: "Choose a roof style",           subtitle: "This informs your Stage 6 specification." },
  { title: "Project details",               subtitle: "Give your project a name and set the budget." },
  { title: "Review and create",             subtitle: "Confirm your project details before we create it." },
] as const;

// ── Validation (which Next buttons are enabled) ────────────────────────────────

function isStepValid(step: number, state: WizardState): boolean {
  switch (step) {
    case 1: return !!state.country;
    case 2: return !!state.projectType;
    case 3: return !!state.buildingType;
    case 4: return state.floors >= 1;
    case 5: return state.rooms.bedrooms >= 1;
    case 6: return true; // 0 is valid
    case 7: return !!state.roofType;
    case 8: return !!state.name.trim();
    case 9: return true;
    default: return false;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(WIZARD_INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);

  function patch(updates: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...updates }));
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
    else void navigate("/projects");
  }

  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleNext() {
    if (step < 9) {
      setStep((s) => s + 1);
      return;
    }
    // Step 9 — call create-project edge function
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name:                   state.name.trim(),
        country:                state.country,
        project_type:           state.projectType,
        building_type:          state.buildingType || undefined,
        floors:                 state.floors,
        rooms:                  state.rooms,
        per_floor_rooms:        state.perFloorRooms,
        per_floor_data:         state.perFloorData,
        boys_quarters_count:    state.boysQuartersCount,
        roof_type:              state.roofType || undefined,
        budget:                 state.budget ? Number(state.budget.replace(/,/g, "")) : null,
        target_completion_date: state.targetCompletionDate || null,
      };

      const { data, error } = await supabase.functions.invoke("create-project", {
        body: payload,
      });

      if (error) {
        setSubmitError(error.message ?? "Failed to create project. Please try again.");
        return;
      }

      const projectId: string = (data as { project_id: string }).project_id;
      await navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("[create-project] failed:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const meta = STEPS[step - 1];

  const stepContent: Record<number, React.ReactNode> = {
    1: <StepCountry      state={state} onChange={patch} />,
    2: <StepProjectType  state={state} onChange={patch} />,
    3: <StepBuildingType state={state} onChange={patch} />,
    4: <StepFloors       state={state} onChange={patch} />,
    5: <StepRooms        state={state} onChange={patch} />,
    6: <StepBoysQuarters state={state} onChange={patch} />,
    7: <StepRoofType     state={state} onChange={patch} />,
    8: <StepDetails      state={state} onChange={patch} />,
    9: <StepSummary      state={state} />,
  };

  return (
    <WizardShell
      currentStep={step}
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={step === 9 ? "Create Project" : "Next"}
      nextDisabled={!isStepValid(step, state)}
      isSubmitting={submitting}
    >
      {stepContent[step]}
      {submitError && (
        <p className="mt-4 rounded-lg border border-brand-border-grey bg-brand-light-grey px-4 py-3 text-sm text-brand-near-black">
          {submitError}
        </p>
      )}
    </WizardShell>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-brand-mid-grey">
        Failed to load project wizard. Please refresh.
      </p>
    </div>
  );
}
