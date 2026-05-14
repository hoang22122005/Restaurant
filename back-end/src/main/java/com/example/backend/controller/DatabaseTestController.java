package com.example.backend.controller;

import com.example.backend.config.DataSourceContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/db")
public class DatabaseTestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Kiểm tra trạng thái kết nối hiện tại
     * URL: http://localhost:8080/api/db/status
     */
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> response = new HashMap<>();
        String currentSite = DataSourceContextHolder.getBranchContext();
        if (currentSite == null) currentSite = "SITE1 (Default)";

        response.put("currentSite", currentSite);
        
        try {
            // Thử lấy tên server thực tế từ SQL Server
            String dbServerName = jdbcTemplate.queryForObject("SELECT @@SERVERNAME", String.class);
            response.put("databaseServer", dbServerName);
            response.put("status", "Connected successfully!");
        } catch (Exception e) {
            Throwable rootCause = e;
            while (rootCause.getCause() != null) rootCause = rootCause.getCause();
            response.put("status", "Connection failed: " + rootCause.getMessage());
        }
        
        return response;
    }

    /**
     * Chuyển đổi Site kết nối
     * URL ví dụ: http://localhost:8080/api/db/switch?site=MAIN
     * Các giá trị: MAIN, SITE1, SITE2
     */
    @GetMapping("/switch")
    public String switchSite(@RequestParam String site) {
        String siteUpper = site.toUpperCase();
        if (siteUpper.equals("MAIN") || siteUpper.equals("SITE1") || siteUpper.equals("SITE2")) {
            DataSourceContextHolder.setBranchContext(siteUpper);
            return "Switched to " + siteUpper + " successfully! Go to /api/db/status to verify.";
        }
        return "Invalid site! Use MAIN, SITE1, or SITE2.";
    }
}
