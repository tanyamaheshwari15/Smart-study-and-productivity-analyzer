import mongoose from "mongoose";

// User schema for authentication
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    studyHours: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notifications: { type: Boolean, default: true },
      dailyGoalMinutes: { type: Number, min: 0, default: 120 },
      preferredTime: { type: String, enum: ["Morning", "Afternoon", "Evening", "Night"], default: "Evening" },
      availableHours: { type: Number, min: 0, max: 16, default: 2 },
      breakMinutes: { type: Number, min: 5, max: 60, default: 10 },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving (we'll add this logic in auth controller)
// userSchema.pre("save", async function(next) {
//   if (!this.isModified("password")) return next();
//   // Password hashing logic will go here
// });

const User = mongoose.model("User", userSchema);
export default User;
