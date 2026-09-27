package com.unipulse.unipulse_backend.dto.student;

public enum AttentionCategoryTier {
    LOW_ATTENTION("Low Attention", "Good Standing", "emerald", 0, 29),
    MEDIUM_ATTENTION("Medium Attention", "Moderate Focus Needed", "amber", 30, 59),
    HIGH_ATTENTION("High Attention", "Priority Support Recommended", "rose", 60, 100);

    private final String displayName;
    private final String nonStigmatizingBadgeLabel;
    private final String colorTheme;
    private final int minScore;
    private final int maxScore;

    AttentionCategoryTier(String displayName, String nonStigmatizingBadgeLabel, String colorTheme, int minScore, int maxScore) {
        this.displayName = displayName;
        this.nonStigmatizingBadgeLabel = nonStigmatizingBadgeLabel;
        this.colorTheme = colorTheme;
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getNonStigmatizingBadgeLabel() {
        return nonStigmatizingBadgeLabel;
    }

    public String getColorTheme() {
        return colorTheme;
    }

    public int getMinScore() {
        return minScore;
    }

    public int getMaxScore() {
        return maxScore;
    }

    public static AttentionCategoryTier fromScore(int score) {
        if (score >= 60) {
            return HIGH_ATTENTION;
        } else if (score >= 30) {
            return MEDIUM_ATTENTION;
        } else {
            return LOW_ATTENTION;
        }
    }
}
