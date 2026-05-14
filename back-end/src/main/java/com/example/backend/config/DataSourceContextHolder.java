package com.example.backend.config;

public class DataSourceContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();

    public static void setBranchContext(String branchType) {
        contextHolder.set(branchType);
    }

    public static String getBranchContext() {
        return contextHolder.get();
    }

    public static void clearBranchContext() {
        contextHolder.remove();
    }
}
