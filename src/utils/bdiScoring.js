// Burns Depression Checklist Scoring Logic
// Based on "Feeling Good" book guidelines

export const interpretScore = (score) => {
  if (score >= 0 && score <= 5) {
    return {
      severity: "minimal",
      level: "Minimal Depression",
      message: "You're feeling pretty good! Minimal or no depression.",
      action: "maintain",
      color: "green",
      icon: "😊",
      recommendations: [
        "Continue your self-care routine",
        "Use CBT tools preventively",
        "Maintain healthy sleep and exercise habits",
        "Stay connected with supportive people"
      ]
    };
  }
  
  if (score >= 6 && score <= 10) {
    return {
      severity: "normal-but-unhappy",
      level: "Normal But Unhappy",
      message: "Normal mood range, but you might be feeling a bit 'lumpy'.",
      action: "tune-up",
      color: "yellow",
      icon: "🙂",
      recommendations: [
        "Try CBT exercises for a mental tune-up",
        "Practice thought records 2-3 times this week",
        "Focus on self-care activities",
        "Monitor your mood patterns"
      ]
    };
  }
  
  if (score >= 11 && score <= 25) {
    return {
      severity: "mild",
      level: "Mild Depression",
      message: "Mild depression. This is manageable with self-help.",
      action: "active-practice",
      color: "orange",
      icon: "😔",
      recommendations: [
        "Complete daily thought records",
        "Try 3 CBT exercises this week",
        "Increase physical activity and outdoor time",
        "If symptoms persist >2 weeks, consider professional help"
      ]
    };
  }
  
  if (score >= 26 && score <= 50) {
    return {
      severity: "moderate",
      level: "Moderate Depression",
      message: "Moderate depression. Professional help recommended.",
      action: "seek-help",
      color: "red",
      icon: "😞",
      recommendations: [
        "Strongly recommend speaking with a therapist",
        "Continue CBT exercises alongside professional treatment",
        "Contact: AASRA (9820466726), iCall (9152987821)",
        "Consider medication evaluation with a psychiatrist"
      ]
    };
  }
  
  if (score > 50) {
    return {
      severity: "severe",
      level: "Severe Depression",
      message: "Severe depression. Professional help is essential.",
      action: "urgent-help",
      color: "darkred",
      icon: "🚨",
      recommendations: [
        "URGENT: Contact a mental health professional immediately",
        "Crisis hotlines: AASRA (9820466726), Vandrevala (1860-2662-345)",
        "Visit nearest emergency room if feeling unsafe",
        "Do not face this alone - reach out for support now"
      ]
    };
  }
};

// Suicidal Ideation Check (Items 23, 24, 25)
export const checkSuicidalIdeation = (answers) => {
  const item23 = answers[23] || 0; // Do you have any suicidal thoughts?
  const item24 = answers[24] || 0; // Would you like to end your life?
  const item25 = answers[25] || 0; // Do you have a plan for harming yourself?
  
  // Critical: Any response > 0 on items 24 or 25
  if (item24 > 0 || item25 > 0) {
    return {
      alert: "CRITICAL",
      level: "critical",
      message: "Immediate intervention required",
      action: "Show crisis resources + notify emergency contact (with permission)",
      showCrisisAlert: true,
      urgency: "immediate"
    };
  }
  
  // Warning: Any response > 0 on item 23
  if (item23 > 0) {
    return {
      alert: "WARNING",
      level: "warning",
      message: "Suicidal thoughts present",
      action: "Recommend professional help + monitor closely",
      showCrisisAlert: true,
      urgency: "high"
    };
  }
  
  return { 
    alert: "NONE",
    level: "none",
    showCrisisAlert: false,
    urgency: "none"
  };
};

// Calculate next assessment date (7 days from now)
export const getNextAssessmentDate = () => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 7);
  return nextDate.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Main assessment processor
export const processAssessment = (answers) => {
  // Calculate total score (0-100)
  const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
  
  // Check for critical items
  const suicidalCheck = checkSuicidalIdeation(answers);
  
  // Determine severity level
  const interpretation = interpretScore(score);
  
  // Generate output
  return {
    score,
    severity: interpretation.severity,
    level: interpretation.level,
    interpretation: interpretation.message,
    recommendations: interpretation.recommendations,
    criticalAlert: suicidalCheck.level === "critical",
    suicidalIdeation: suicidalCheck.level !== "none",
    suicidalCheck,
    nextAssessmentDate: getNextAssessmentDate(),
    timestamp: new Date().toISOString(),
    icon: interpretation.icon,
    color: interpretation.color,
    action: interpretation.action
  };
};
