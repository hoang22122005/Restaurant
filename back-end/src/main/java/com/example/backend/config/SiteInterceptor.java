package com.example.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SiteInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 1. Ưu tiên đọc từ URL parameter (?site=SITE2) để dễ test trình duyệt
        String siteId = request.getParameter("site");
        
        // 2. Nếu URL không có, mới đọc từ Header (dùng cho Frontend/Postman)
        if (siteId == null || siteId.isEmpty()) {
            siteId = request.getHeader("X-Site-Id");
        }
        
        System.out.println("--- INTERCEPTOR: Detected Site = [" + siteId + "] ---");
        
        if (siteId != null && !siteId.isEmpty()) {
            DataSourceContextHolder.setBranchContext(siteId.toUpperCase());
        } else {
            // Mặc định
            DataSourceContextHolder.setBranchContext("SITE1");
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Xóa ngữ cảnh sau khi xong để tránh rác bộ nhớ
        DataSourceContextHolder.clearBranchContext();
    }
}
