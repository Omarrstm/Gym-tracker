import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MuscleGroup } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const exercises: { name: string; muscleGroup: MuscleGroup; imageUrl?: string; description: string }[] = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg", description: "Lie on a flat bench and press a barbell from chest level to full arm extension." },
  { name: "Incline Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg", description: "Bench press on an inclined bench to emphasize the upper chest." },
  { name: "Decline Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg", description: "Bench press on a declined bench to emphasize the lower chest." },
  { name: "Dumbbell Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg", description: "Press two dumbbells from chest level to full extension for a deeper range of motion than a barbell." },
  { name: "Dumbbell Fly", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg", description: "Lie on a bench and open dumbbells out to the sides in an arc to stretch and squeeze the chest." },
  { name: "Cable Crossover", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg", description: "Pull two cable handles down and across the body to squeeze the chest at full contraction." },
  { name: "Push-Up", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg", description: "Bodyweight press from a plank position, lowering the chest to the floor and pushing back up." },
  { name: "Chest Dip", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg", description: "Lower and press your bodyweight on parallel bars, leaning forward to target the chest." },
  { name: "Pec Deck Machine", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg", description: "Squeeze the chest by bringing the machine's arm pads together in front of the body." },

  // Back
  { name: "Deadlift", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg", description: "Lift a loaded barbell from the floor to hip level by extending the hips and knees together." },
  { name: "Pull-Up", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg", description: "Pull your bodyweight up to an overhead bar using an overhand grip." },
  { name: "Chin-Up", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg", description: "Pull your bodyweight up to an overhead bar using an underhand grip, emphasizing the biceps." },
  { name: "Lat Pulldown", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg", description: "Pull a cable bar down to the chest to build width in the back." },
  { name: "Bent-Over Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg", description: "Hinge forward and row a barbell into the torso to build back thickness." },
  { name: "Seated Cable Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg", description: "Pull a cable handle toward the torso while seated to target the mid-back." },
  { name: "T-Bar Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg", description: "Row a barbell loaded at one end toward the chest, supported by a chest pad." },
  { name: "Single-Arm Dumbbell Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg", description: "Row a dumbbell to the hip one side at a time, bracing on a bench." },
  { name: "Face Pull", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg", description: "Pull a cable rope toward the face to target the rear delts and upper back." },
  { name: "Hyperextension", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg", description: "Raise and lower the torso from a hip-hinged position to strengthen the lower back." },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg", description: "Press a barbell from shoulder height to overhead while standing." },
  { name: "Arnold Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Arnold_Press/0.jpg", description: "Press dumbbells overhead while rotating the palms outward, hitting all three delt heads." },
  { name: "Dumbbell Shoulder Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg", description: "Press two dumbbells overhead from shoulder height." },
  { name: "Lateral Raise", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg", description: "Raise dumbbells out to the sides to shoulder height to build the middle delts." },
  { name: "Front Raise", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise_And_Pullover/0.jpg", description: "Raise a weight straight out in front to shoulder height to target the front delts." },
  { name: "Rear Delt Fly", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rear_Delt_Fly/0.jpg", description: "Bend forward and raise weights out to the sides to target the rear delts." },
  { name: "Upright Row", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/0.jpg", description: "Pull a weight up along the body toward the chin to target the delts and traps." },
  { name: "Barbell Shrug", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg", description: "Lift the shoulders straight up toward the ears to build the traps." },

  // Arms
  { name: "Barbell Bicep Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg", description: "Curl a barbell from the thighs to the shoulders to build the biceps." },
  { name: "Dumbbell Bicep Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg", description: "Curl a dumbbell in each hand from the thighs to the shoulders." },
  { name: "Hammer Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg", description: "Curl dumbbells with a neutral grip to emphasize the brachialis and forearms." },
  { name: "Preacher Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg", description: "Curl a weight with the arms braced on an angled pad to isolate the biceps." },
  { name: "Concentration Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg", description: "Curl a dumbbell one arm at a time, bracing the elbow against the inner thigh." },
  { name: "Tricep Pushdown", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg", description: "Push a cable attachment down to full arm extension to target the triceps." },
  { name: "Skull Crusher", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg", description: "Lower a weight toward the forehead while lying down, then extend the arms." },
  { name: "Overhead Tricep Extension", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg", description: "Extend a weight overhead from behind the head to target the long head of the triceps." },
  { name: "Close-Grip Bench Press", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg", description: "Bench press with a narrow grip to shift emphasis onto the triceps." },
  { name: "Tricep Kickback", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg", description: "Extend a dumbbell backward from a bent-over position to isolate the triceps." },

  // Legs
  { name: "Barbell Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg", description: "Squat down with a barbell on the back and stand back up, the foundational lower-body movement." },
  { name: "Front Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squat_Clean_Grip/0.jpg", description: "Squat with the barbell racked across the front of the shoulders, emphasizing the quads." },
  { name: "Leg Press", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg", description: "Push a weighted sled away with the legs while seated in a reclined machine." },
  { name: "Walking Lunge", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg", description: "Step forward into alternating lunges, walking across the floor." },
  { name: "Bulgarian Split Squat", muscleGroup: "LEGS", description: "Squat on one leg with the rear foot elevated behind you on a bench." },
  { name: "Leg Extension", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg", description: "Extend the knees against resistance while seated to isolate the quads." },
  { name: "Leg Curl", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg", description: "Curl the heels toward the glutes against resistance to isolate the hamstrings." },
  { name: "Romanian Deadlift", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg", description: "Hinge at the hips with a slight knee bend to stretch and load the hamstrings." },
  { name: "Standing Calf Raise", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg", description: "Rise onto the toes while standing to build the calves." },
  { name: "Seated Calf Raise", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg", description: "Rise onto the toes while seated, targeting the soleus." },
  { name: "Hip Thrust", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg", description: "Drive the hips upward with the upper back braced on a bench to build the glutes." },
  { name: "Goblet Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg", description: "Squat while holding a single dumbbell or kettlebell at chest height." },

  // Core
  { name: "Plank", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg", description: "Hold a straight-body position on the forearms and toes to build core stability." },
  { name: "Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg", description: "Curl the shoulders off the floor toward the hips to target the upper abs." },
  { name: "Cable Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg", description: "Kneel and crunch down against a cable rope to add resistance to the abs." },
  { name: "Russian Twist", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg", description: "Rotate a weight side to side while seated with the feet off the floor." },
  { name: "Hanging Leg Raise", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg", description: "Hang from a bar and raise the legs to target the lower abs." },
  { name: "Sit-Up", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/0.jpg", description: "Lift the torso fully off the floor to the knees to work the entire abdominal wall." },
  { name: "Ab Wheel Rollout", muscleGroup: "CORE", description: "Roll a wheel forward from the knees and pull back in, bracing the core." },
  { name: "Side Plank", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg", description: "Hold a sideways plank on one forearm to target the obliques." },

  // Full Body
  { name: "Clean and Jerk", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Jerk/0.jpg", description: "Explosively lift a barbell from the floor to the shoulders, then overhead." },
  { name: "Snatch", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/0.jpg", description: "Lift a barbell from the floor to overhead in one explosive motion." },
  { name: "Kettlebell Swing", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/0.jpg", description: "Hinge at the hips to swing a kettlebell up using hip drive." },
  { name: "Burpee", muscleGroup: "FULL_BODY", description: "Drop into a push-up, then jump up explosively, a bodyweight conditioning move." },
  { name: "Thruster", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Thruster/0.jpg", description: "Combine a front squat with an overhead press in one fluid motion." },
  { name: "Farmer's Carry", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmers_Walk/0.jpg", description: "Walk while carrying a heavy weight in each hand to build grip and full-body stability." },
  { name: "Power Clean", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Power_Clean/0.jpg", description: "Explosively pull a barbell from the floor to the shoulders in one motion, without the overhead jerk." },
  { name: "Tire Flip", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tire_Flip/0.jpg", description: "Squat down and flip a heavy tire end over end, a strongman full-body power movement." },
  { name: "Sled Push", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Push/0.jpg", description: "Drive a weighted sled forward across the floor for full-body conditioning and leg drive." },
  { name: "Turkish Get-Up", muscleGroup: "FULL_BODY", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Turkish_Get-Up_Squat_style/0.jpg", description: "Rise from lying to standing while holding a weight locked out overhead, a full-body stability drill." },

  // Chest (additional)
  { name: "Wide-Grip Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg", description: "Bench press with a wider-than-shoulder grip to emphasize the outer chest." },
  { name: "Machine Chest Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg", description: "Press the machine's handles forward from chest level along a fixed, supported path." },
  { name: "Incline Dumbbell Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg", description: "Press two dumbbells from shoulder height on an inclined bench to emphasize the upper chest." },
  { name: "Decline Dumbbell Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg", description: "Press two dumbbells from chest level on a declined bench to emphasize the lower chest." },
  { name: "Svend Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Svend_Press/0.jpg", description: "Squeeze two plates together at chest height and press them straight out to isolate the inner chest." },
  { name: "Smith Machine Bench Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/0.jpg", description: "Bench press along the fixed vertical track of a Smith machine." },
  { name: "Standing Cable Chest Press", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Chest_Press/0.jpg", description: "Press cable handles forward from chest height while standing, keeping constant tension through the chest." },
  { name: "Dumbbell Pullover", muscleGroup: "CHEST", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg", description: "Lower a dumbbell in an arc behind the head, then pull it back over the chest with straight arms." },

  // Back (additional)
  { name: "Sumo Deadlift", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Deadlift/0.jpg", description: "Deadlift with a wide stance and hands inside the knees, sitting the hips down into the pull." },
  { name: "Rack Pull", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pulls/0.jpg", description: "Deadlift a barbell from knee height off safety pins for a shortened, heavier-loading range of motion." },
  { name: "Muscle-Up", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Up/0.jpg", description: "Pull up and transition over a bar or rings into a dip, combining a pull-up and a dip in one motion." },
  { name: "Inverted Row", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg", description: "Row your bodyweight up to a fixed bar while hanging beneath it at an angle." },
  { name: "Dumbbell Shrug", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg", description: "Lift dumbbells straight up toward the ears to build the traps." },
  { name: "Straight-Arm Pulldown", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg", description: "Pull a cable bar down to the thighs with straight arms to isolate the lats." },
  { name: "Weighted Pull-Up", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg", description: "Pull up to an overhead bar with extra weight added via a belt or vest." },
  { name: "Trap Bar Deadlift", muscleGroup: "BACK", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Bar_Deadlift/0.jpg", description: "Deadlift a hexagonal bar from inside its frame for a more upright, joint-friendly pulling position." },

  // Shoulders (additional)
  { name: "Push Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press/0.jpg", description: "Use a slight leg drive to help press a barbell overhead, allowing heavier loads than a strict press." },
  { name: "Cable Lateral Raise", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg", description: "Raise a low cable out to the side to shoulder height, keeping constant tension on the middle delt." },
  { name: "Reverse Fly", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg", description: "Bend forward and raise dumbbells out to the sides to target the rear delts and upper back." },
  { name: "Seated Dumbbell Shoulder Press", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/0.jpg", description: "Press two dumbbells overhead while seated for a stricter, more supported pressing motion." },
  { name: "Cable Front Raise", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg", description: "Raise a low cable straight out in front to shoulder height to isolate the front delt." },
  { name: "Handstand Push-Up", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Handstand_Push-Ups/0.jpg", description: "Press your bodyweight up and down in a handstand against a wall for advanced shoulder strength." },
  { name: "Band Pull-Apart", muscleGroup: "SHOULDERS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg", description: "Pull a resistance band apart at chest height to strengthen the rear delts and upper back." },

  // Arms (additional)
  { name: "EZ-Bar Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg", description: "Curl an EZ-bar from the thighs to the shoulders; the angled grip is easier on the wrists than a straight bar." },
  { name: "Cable Bicep Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Cable_Curl/0.jpg", description: "Curl a low cable up to the shoulder to keep constant tension on the biceps through the full range." },
  { name: "Zottman Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Zottman_Curl/0.jpg", description: "Curl dumbbells up with palms facing up, then rotate and lower them with palms facing down to hit both the biceps and forearms." },
  { name: "Reverse Barbell Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Barbell_Curl/0.jpg", description: "Curl a barbell with an overhand grip to emphasize the forearms and brachialis." },
  { name: "Bench Dip", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg", description: "Lower and press your bodyweight between two benches, hands behind you, to target the triceps." },
  { name: "Standing Tricep Extension", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg", description: "Lower a dumbbell behind the head and extend it overhead to isolate the triceps." },
  { name: "Barbell Wrist Curl", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg", description: "Curl a barbell using only the wrists, palms up, to build the forearm flexors." },
  { name: "Reverse-Grip Tricep Pushdown", muscleGroup: "ARMS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg", description: "Push a cable bar down with an underhand grip to shift emphasis onto the inner triceps head." },

  // Legs (additional)
  { name: "Box Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg", description: "Squat down to lightly touch a box before driving back up, building explosive strength out of the hole." },
  { name: "Bodyweight Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg", description: "Squat down and stand back up using only your bodyweight, the foundational squat pattern." },
  { name: "Barbell Lunge", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg", description: "Step forward into a lunge with a barbell on the back, alternating legs." },
  { name: "Dumbbell Lunge", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg", description: "Step forward into a lunge holding a dumbbell in each hand." },
  { name: "Good Morning", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg", description: "Hinge forward at the hips with a barbell on the back to load the hamstrings and lower back." },
  { name: "Hack Squat", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg", description: "Squat against a fixed sled on an angled machine to load the quads with a supported back." },
  { name: "Dumbbell Step-Up", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg", description: "Step up onto a bench or box holding dumbbells, driving through the lead leg." },
  { name: "Barbell Glute Bridge", muscleGroup: "LEGS", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg", description: "Drive the hips up from the floor with a barbell across the hips to build the glutes." },

  // Core (additional)
  { name: "Reverse Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg", description: "Curl the hips off the floor toward the ribs to target the lower abs." },
  { name: "Dead Bug", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/0.jpg", description: "Lower opposite arm and leg toward the floor while lying on your back, keeping the lower back pressed down." },
  { name: "Pallof Press", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/0.jpg", description: "Press a cable straight out from the chest while resisting its pull to rotate you, training anti-rotation core strength." },
  { name: "Dumbbell Side Bend", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Side_Bend/0.jpg", description: "Bend sideways at the waist holding a dumbbell to target the obliques." },
  { name: "Cable Woodchopper", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Cable_Wood_Chop/0.jpg", description: "Pull a high cable diagonally down across the body to train rotational core strength." },
  { name: "Weighted Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/0.jpg", description: "Perform a crunch while holding extra weight against the chest for added resistance." },
  { name: "Bicycle Crunch", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross-Body_Crunch/0.jpg", description: "Alternate bringing elbow to opposite knee in a pedaling motion to target the obliques and abs." },
  { name: "Hanging Pike", muscleGroup: "CORE", imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Pike/0.jpg", description: "Hang from a bar and raise straight legs up toward the bar to heavily target the lower abs." },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const exercise of exercises) {
    const existing = await prisma.exercise.findUnique({ where: { name: exercise.name } });
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: { imageUrl: exercise.imageUrl, description: exercise.description },
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
