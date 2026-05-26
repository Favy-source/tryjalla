import { Minus, Plus } from "lucide-react";
import type { WizardState, RoomCounts } from "../wizardTypes";

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

interface RoomRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

function RoomRow({ label, value, min = 0, max = 20, onChange }: RoomRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-brand-border-grey last:border-b-0">
      <span className="text-sm font-medium text-brand-near-black">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border-grey text-brand-near-black hover:bg-brand-light-grey disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-brand-near-black">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border-grey text-brand-near-black hover:bg-brand-light-grey disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function RoomsForm({
  rooms,
  onChange,
}: {
  rooms: RoomCounts;
  onChange: (r: RoomCounts) => void;
}) {
  return (
    <div className="rounded-lg border border-brand-border-grey bg-white px-4">
      <RoomRow
        label="Bedrooms"
        value={rooms.bedrooms}
        min={1}
        onChange={(v) => onChange({ ...rooms, bedrooms: v })}
      />
      <RoomRow
        label="Bathrooms"
        value={rooms.bathrooms}
        min={1}
        onChange={(v) => onChange({ ...rooms, bathrooms: v })}
      />
      <RoomRow
        label="Living Rooms"
        value={rooms.livingRooms}
        min={1}
        onChange={(v) => onChange({ ...rooms, livingRooms: v })}
      />
      <RoomRow
        label="Kitchens"
        value={rooms.kitchens}
        min={1}
        onChange={(v) => onChange({ ...rooms, kitchens: v })}
      />
    </div>
  );
}

export function StepRooms({ state, onChange }: Props) {
  const isMultiFloor = state.floors > 1;

  function setPerFloor(enabled: boolean) {
    if (enabled) {
      // Initialise per-floor data from overall rooms
      const perFloorData = Array.from({ length: state.floors }, () => ({
        ...state.rooms,
      }));
      onChange({ perFloorRooms: true, perFloorData });
    } else {
      onChange({ perFloorRooms: false, perFloorData: null });
    }
  }

  function updateFloorRooms(floorIndex: number, rooms: RoomCounts) {
    const updated = [...(state.perFloorData ?? [])];
    updated[floorIndex] = rooms;
    onChange({ perFloorData: updated });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-mid-grey">
        Tell us how many of each room type you need.
      </p>

      {/* Per-floor toggle — only if multi-floor */}
      {isMultiFloor && (
        <div className="flex items-center justify-between rounded-lg border border-brand-border-grey bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-brand-near-black">
              Different rooms per floor
            </p>
            <p className="text-xs text-brand-mid-grey mt-0.5">
              Configure each floor separately
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.perFloorRooms}
            onClick={() => setPerFloor(!state.perFloorRooms)}
            className={[
              "relative h-6 w-10 rounded-full transition-colors",
              state.perFloorRooms ? "bg-brand-near-black" : "bg-brand-border-grey",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                state.perFloorRooms ? "translate-x-5" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        </div>
      )}

      {/* Room inputs */}
      {state.perFloorRooms && state.perFloorData ? (
        <div className="space-y-4">
          {state.perFloorData.map((floorRooms, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-2">
                {i === 0 ? "Ground Floor" : `Floor ${i + 1}`}
              </p>
              <RoomsForm
                rooms={floorRooms}
                onChange={(r) => updateFloorRooms(i, r)}
              />
            </div>
          ))}
        </div>
      ) : (
        <RoomsForm
          rooms={state.rooms}
          onChange={(r) => onChange({ rooms: r })}
        />
      )}
    </div>
  );
}
