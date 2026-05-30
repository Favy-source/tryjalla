/**
 * StageList — renders all 10 stages as StageAccordions.
 *
 * Handles local state updates when a substage is toggled or a stage
 * is approved — no full reload needed.
 */
import { useCallback } from "react";
import { StageAccordion, type StageData } from "./StageAccordion";
import type { SubstageData } from "./SubstageRow";

interface StageListProps {
  stages:         StageData[];
  canEdit:        boolean;
  isOwner:        boolean;
  isProfessional: boolean;
  ownerTier:      string;
  onUpdate:       (stages: StageData[]) => void;
}

export function StageList({
  stages, canEdit, isOwner, isProfessional, ownerTier, onUpdate,
}: StageListProps) {
  const handleSubstageUpdated = useCallback(
    (stageId: string, updatedSubstage: SubstageData) => {
      onUpdate(stages.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          substages: stage.substages.map((sub) =>
            sub.id === updatedSubstage.id ? updatedSubstage : sub,
          ),
        };
      }));
    },
    [stages, onUpdate],
  );

  const handleStageUpdated = useCallback(
    (updatedStage: StageData) => {
      // When a stage is approved/rejected, reload substages for the updated stage
      // and update the stage in the list. The caller (project detail page) handles
      // full reloads if needed.
      onUpdate(stages.map((stage) =>
        stage.id === updatedStage.id
          ? { ...updatedStage, substages: stage.substages }
          : stage,
      ));
    },
    [stages, onUpdate],
  );

  if (stages.length === 0) {
    return (
      <p className="text-sm text-brand-mid-grey py-8 text-center">
        No stages found for this project.
      </p>
    );
  }

  return (
    <div>
      {stages
        .sort((a, b) => a.stage_number - b.stage_number)
        .map((stage) => (
          <StageAccordion
            key={stage.id}
            stage={stage}
            canEdit={canEdit}
            isOwner={isOwner}
            isProfessional={isProfessional}
            ownerTier={ownerTier}
            onSubstageUpdated={handleSubstageUpdated}
            onStageUpdated={handleStageUpdated}
          />
        ))}
    </div>
  );
}
