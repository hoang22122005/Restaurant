package com.example.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private SiteInterceptor siteInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Áp dụng bộ lọc cho tất cả các API
        registry.addInterceptor(siteInterceptor).addPathPatterns("/api/**");
    }
}
