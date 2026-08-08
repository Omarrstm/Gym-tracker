import type { MuscleGroup } from "@/generated/prisma/client";

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  CHEST: "Chest",
  BACK: "Back",
  SHOULDERS: "Shoulders",
  ARMS: "Arms",
  LEGS: "Legs",
  CORE: "Core",
  FULL_BODY: "Full Body",
};

export const muscleGroupOrder: MuscleGroup[] = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "ARMS",
  "LEGS",
  "CORE",
  "FULL_BODY",
];
