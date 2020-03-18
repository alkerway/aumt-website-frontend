import { AumtMember } from "./AumtMember";

export interface AumtTrainingSession {
    limit: number
    title: string
    sessionId: string
    trainers: string[]
    members: AumtMember[]
    waitlist: AumtMember[]
    feedback: string[]
}
export interface AumtWeeklyTraining {
    sessions: AumtTrainingSession[]
    trainingId: string
    title: string
    opens: Date
    closes: Date
    notes?: string
}