import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MuscleGroup } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const exercises: { name: string; muscleGroup: MuscleGroup }[] = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "CHEST" },
  { name: "Incline Bench Press", muscleGroup: "CHEST" },
  { name: "Decline Bench Press", muscleGroup: "CHEST" },
  { name: "Dumbbell Bench Press", muscleGroup: "CHEST" },
  { name: "Dumbbell Fly", muscleGroup: "CHEST" },
  { name: "Cable Crossover", muscleGroup: "CHEST" },
  { name: "Push-Up", muscleGroup: "CHEST" },
  { name: "Chest Dip", muscleGroup: "CHEST" },
  { name: "Pec Deck Machine", muscleGroup: "CHEST" },

  // Back
  { name: "Deadlift", muscleGroup: "BACK" },
  { name: "Pull-Up", muscleGroup: "BACK" },
  { name: "Chin-Up", muscleGroup: "BACK" },
  { name: "Lat Pulldown", muscleGroup: "BACK" },
  { name: "Bent-Over Row", muscleGroup: "BACK" },
  { name: "Seated Cable Row", muscleGroup: "BACK" },
  { name: "T-Bar Row", muscleGroup: "BACK" },
  { name: "Single-Arm Dumbbell Row", muscleGroup: "BACK" },
  { name: "Face Pull", muscleGroup: "BACK" },
  { name: "Hyperextension", muscleGroup: "BACK" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "SHOULDERS" },
  { name: "Arnold Press", muscleGroup: "SHOULDERS" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "SHOULDERS" },
  { name: "Lateral Raise", muscleGroup: "SHOULDERS" },
  { name: "Front Raise", muscleGroup: "SHOULDERS" },
  { name: "Rear Delt Fly", muscleGroup: "SHOULDERS" },
  { name: "Upright Row", muscleGroup: "SHOULDERS" },
  { name: "Barbell Shrug", muscleGroup: "SHOULDERS" },

  // Arms
  { name: "Barbell Bicep Curl", muscleGroup: "ARMS" },
  { name: "Dumbbell Bicep Curl", muscleGroup: "ARMS" },
  { name: "Hammer Curl", muscleGroup: "ARMS" },
  { name: "Preacher Curl", muscleGroup: "ARMS" },
  { name: "Concentration Curl", muscleGroup: "ARMS" },
  { name: "Tricep Pushdown", muscleGroup: "ARMS" },
  { name: "Skull Crusher", muscleGroup: "ARMS" },
  { name: "Overhead Tricep Extension", muscleGroup: "ARMS" },
  { name: "Close-Grip Bench Press", muscleGroup: "ARMS" },
  { name: "Tricep Kickback", muscleGroup: "ARMS" },

  // Legs
  { name: "Barbell Squat", muscleGroup: "LEGS" },
  { name: "Front Squat", muscleGroup: "LEGS" },
  { name: "Leg Press", muscleGroup: "LEGS" },
  { name: "Walking Lunge", muscleGroup: "LEGS" },
  { name: "Bulgarian Split Squat", muscleGroup: "LEGS" },
  { name: "Leg Extension", muscleGroup: "LEGS" },
  { name: "Leg Curl", muscleGroup: "LEGS" },
  { name: "Romanian Deadlift", muscleGroup: "LEGS" },
  { name: "Standing Calf Raise", muscleGroup: "LEGS" },
  { name: "Seated Calf Raise", muscleGroup: "LEGS" },
  { name: "Hip Thrust", muscleGroup: "LEGS" },
  { name: "Goblet Squat", muscleGroup: "LEGS" },

  // Core
  { name: "Plank", muscleGroup: "CORE" },
  { name: "Crunch", muscleGroup: "CORE" },
  { name: "Cable Crunch", muscleGroup: "CORE" },
  { name: "Russian Twist", muscleGroup: "CORE" },
  { name: "Hanging Leg Raise", muscleGroup: "CORE" },
  { name: "Sit-Up", muscleGroup: "CORE" },
  { name: "Ab Wheel Rollout", muscleGroup: "CORE" },
  { name: "Side Plank", muscleGroup: "CORE" },

  // Full Body
  { name: "Clean and Jerk", muscleGroup: "FULL_BODY" },
  { name: "Snatch", muscleGroup: "FULL_BODY" },
  { name: "Kettlebell Swing", muscleGroup: "FULL_BODY" },
  { name: "Burpee", muscleGroup: "FULL_BODY" },
  { name: "Thruster", muscleGroup: "FULL_BODY" },
  { name: "Farmer's Carry", muscleGroup: "FULL_BODY" },
];

async function main() {
  const result = await prisma.exercise.createMany({
    data: exercises,
    skipDuplicates: true,
  });
  console.log(`Seeded ${result.count} new exercises (${exercises.length} total in list).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
