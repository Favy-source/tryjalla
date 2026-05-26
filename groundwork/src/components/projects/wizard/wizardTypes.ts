/**
 * Shared types for the 9-step project creation wizard.
 */

export interface RoomCounts {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
}

export interface WizardState {
  // Step 1
  country: string;
  // Step 2
  projectType: string;
  // Step 3
  buildingType: string;
  // Step 4
  floors: number;
  // Step 5
  rooms: RoomCounts;
  perFloorRooms: boolean;
  perFloorData: RoomCounts[] | null;
  // Step 6
  boysQuartersCount: number;
  // Step 7
  roofType: string;
  // Step 8
  name: string;
  budget: string;             // string input — convert to number on submit
  targetCompletionDate: string;
}

export const WIZARD_INITIAL_STATE: WizardState = {
  country: "",
  projectType: "residential_single",
  buildingType: "",
  floors: 1,
  rooms: { bedrooms: 3, bathrooms: 2, livingRooms: 1, kitchens: 1 },
  perFloorRooms: false,
  perFloorData: null,
  boysQuartersCount: 0,
  roofType: "",
  name: "",
  budget: "",
  targetCompletionDate: "",
};

export const PROJECT_TYPES = [
  { value: "residential_single", label: "Residential — Single Family" },
  { value: "residential_multi",  label: "Residential — Multi Family" },
  { value: "commercial",         label: "Commercial" },
  { value: "mixed_use",          label: "Mixed Use" },
] as const;

export const BUILDING_TYPES = [
  { value: "bungalow",   label: "Bungalow",   description: "Single-storey home" },
  { value: "duplex",     label: "Duplex",      description: "Two-storey home" },
  { value: "triplex",    label: "Triplex",     description: "Three-storey home" },
  { value: "villa",      label: "Villa",       description: "Detached luxury home" },
  { value: "apartment",  label: "Apartment",   description: "Multi-unit building" },
  { value: "townhouse",  label: "Townhouse",   description: "Terraced home" },
  { value: "mansion",    label: "Mansion",     description: "Premium large home" },
] as const;

export const ROOF_TYPES = [
  { value: "hip",         label: "Hip Roof",       description: "Slopes on all four sides" },
  { value: "gable",       label: "Gable Roof",     description: "Two sloping sides, triangular ends" },
  { value: "flat",        label: "Flat Roof",       description: "Nearly level surface with slight pitch" },
  { value: "mansard",     label: "Mansard Roof",    description: "Four sides, double slope" },
  { value: "dutch_gable", label: "Dutch Gable",     description: "Combination hip and gable" },
  { value: "mono_pitch",  label: "Mono Pitch",      description: "Single slope in one direction" },
] as const;
