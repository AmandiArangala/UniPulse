package com.unipulse.unipulse_backend.dto.student;

public enum AttentionTriggerRule {
    LOW_ATTENDANCE(
            "ATTN_BELOW_60",
            "Low Attendance Rate",
            30,
            "Attendance rate drops below 60%",
            "Critical attendance shortfall detected. Attendance is below the 60% minimum threshold.",
            "Schedule attendance counseling and offer recorded lecture catch-up resources."
    ),
    LOW_AVERAGE_GRADE(
            "AVG_BELOW_50",
            "Low Average Mark",
            30,
            "Overall assessment average drops below 50%",
            "Academic performance risk. Average score across assessments is currently under 50%.",
            "Recommend subject tutoring, assignment revisions, and peer study groups."
    ),
    MISSED_TESTS(
            "MISSED_TESTS_GE_2",
            "Multiple Missed Assessments",
            20,
            "Missed tests or mandatory submissions count >= 2",
            "Assessment gaps flagged. Student has missed 2 or more graded assessments/tests.",
            "Verify missing assessment excuses, allow make-up submissions, or adjust deadlines."
    ),
    DECLINING_TREND(
            "DECLINING_TREND",
            "Declining Trajectory",
            10,
            "Assessment score trend slope is declining across recent modules",
            "Negative trend trajectory. Performance exhibits a declining pattern over recent assessments.",
            "Conduct check-in interview to identify external obstacles or workload burnout."
    ),
    LOW_ENGAGEMENT(
            "LOW_ENGAGEMENT",
            "Low LMS Engagement",
            10,
            "LMS resource activity and engagement score < 50%",
            "Engagement deficit. Student LMS portal activity and resource utilization is below 50%.",
            "Encourage participation in interactive discussion forums and digital learning modules."
    );

    private final String ruleCode;
    private final String ruleName;
    private final int points;
    private final String thresholdDescription;
    private final String diagnosticStatement;
    private final String actionRecommendation;

    AttentionTriggerRule(
            String ruleCode,
            String ruleName,
            int points,
            String thresholdDescription,
            String diagnosticStatement,
            String actionRecommendation
    ) {
        this.ruleCode = ruleCode;
        this.ruleName = ruleName;
        this.points = points;
        this.thresholdDescription = thresholdDescription;
        this.diagnosticStatement = diagnosticStatement;
        this.actionRecommendation = actionRecommendation;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public String getRuleName() {
        return ruleName;
    }

    public int getPoints() {
        return points;
    }

    public String getThresholdDescription() {
        return thresholdDescription;
    }

    public String getDiagnosticStatement() {
        return diagnosticStatement;
    }

    public String getActionRecommendation() {
        return actionRecommendation;
    }
}
