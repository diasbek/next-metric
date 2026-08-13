export type ConsentChoice = "accepted" | "necessary";

export type ConsentDecision = {
  choice: ConsentChoice;
  version: number;
  decidedAt: number;
};

export type ConsentStatus = "pending" | "resolved";
