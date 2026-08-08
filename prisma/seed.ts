import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MuscleGroup } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const exercises: { name: string; muscleGroup: MuscleGroup; imageUrl?: string }[] = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg" },
  { name: "Incline Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg" },
  { name: "Decline Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg" },
  { name: "Dumbbell Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg" },
  { name: "Dumbbell Fly", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg" },
  { name: "Cable Crossover", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg" },
  { name: "Push-Up", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg" },
  { name: "Chest Dip", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg" },
  { name: "Pec Deck Machine", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg" },

  // Back
  { name: "Deadlift", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg" },
  { name: "Pull-Up", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg" },
  { name: "Chin-Up", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg" },
  { name: "Lat Pulldown", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg" },
  { name: "Bent-Over Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg" },
  { name: "Seated Cable Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg" },
  { name: "T-Bar Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg" },
  { name: "Single-Arm Dumbbell Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg" },
  { name: "Face Pull", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg" },
  { name: "Hyperextension", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg" },
  { name: "Arnold Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Arnold_Press/0.jpg" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg" },
  { name: "Lateral Raise", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg" },
  { name: "Front Raise", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg" },
  { name: "Rear Delt Fly", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg" },
  { name: "Upright Row", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/0.jpg" },
  { name: "Barbell Shrug", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg" },

  // Arms
  { name: "Barbell Bicep Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg" },
  { name: "Dumbbell Bicep Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg" },
  { name: "Hammer Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg" },
  { name: "Preacher Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg" },
  { name: "Concentration Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg" },
  { name: "Tricep Pushdown", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg" },
  { name: "Skull Crusher", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg" },
  { name: "Overhead Tricep Extension", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg" },
  { name: "Close-Grip Bench Press", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg" },
  { name: "Tricep Kickback", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg" },

  // Legs
  { name: "Barbell Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg" },
  { name: "Front Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squat_Clean_Grip/0.jpg" },
  { name: "Leg Press", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg" },
  { name: "Walking Lunge", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg" },
  { name: "Bulgarian Split Squat", muscleGroup: "LEGS" },
  { name: "Leg Extension", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg" },
  { name: "Leg Curl", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg" },
  { name: "Romanian Deadlift", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg" },
  { name: "Standing Calf Raise", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg" },
  { name: "Seated Calf Raise", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg" },
  { name: "Hip Thrust", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg" },
  { name: "Goblet Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg" },

  // Core
  { name: "Plank", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg" },
  { name: "Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg" },
  { name: "Cable Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg" },
  { name: "Russian Twist", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg" },
  { name: "Hanging Leg Raise", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg" },
  { name: "Sit-Up", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/0.jpg" },
  { name: "Ab Wheel Rollout", muscleGroup: "CORE" },
  { name: "Side Plank", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg" },

  // Full Body
  { name: "Clean and Jerk", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Jerk/0.jpg" },
  { name: "Snatch", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/0.jpg" },
  { name: "Kettlebell Swing", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/0.jpg" },
  { name: "Burpee", muscleGroup: "FULL_BODY" },
  { name: "Thruster", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Thruster/0.jpg" },
  { name: "Farmer's Carry", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg" },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const exercise of exercises) {
    const existing = await prisma.exercise.findUnique({ where: { name: exercise.name } });
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: { imageUrl: exercise.imageUrl },
      create: exercise,
    });
    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated (${exercises.length} total).`);
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
