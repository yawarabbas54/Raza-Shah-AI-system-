// Deterministic allowlisted tools.
// Production integrations can be implemented behind these same schemas.

export const tools = {
  calculator: {
    risk: "low",
    description: "Evaluate a basic arithmetic expression.",
    run: async ({ expression }) => {
      if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
        throw new Error("Only basic arithmetic is allowed.");
      }
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict"; return (${expression})`)();
      if (!Number.isFinite(value)) throw new Error("Invalid result.");
      return { value };
    }
  },

  create_plan: {
    risk: "low",
    description: "Create a deterministic task plan.",
    run: async ({ goal }) => ({
      goal,
      steps: [
        "Understand the goal and constraints",
        "Select the minimum required skills",
        "Execute allowlisted tools",
        "Verify results",
        "Report outcome, confidence and next actions"
      ]
    })
  },

  request_confirmation: {
    risk: "high",
    description: "Gate an external or consequential action.",
    run: async ({ action }) => ({
      requiresConfirmation: true,
      action,
      message: "Confirmation required before this action can execute."
    })
  }
};
