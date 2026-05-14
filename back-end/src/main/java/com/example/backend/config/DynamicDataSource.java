package com.example.backend.config;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class DynamicDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        Object key = DataSourceContextHolder.getBranchContext();
        System.out.println("--- DB ROUTING: Using DataSource Key = [" + key + "] ---");
        return key;
    }
}
