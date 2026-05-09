package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private long totalBranches;
    private long totalDishes;
    private long totalCustomers;
    private long totalOrders;
    private BigDecimal totalRevenue;
}
