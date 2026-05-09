package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDTO {
    private String branchID;
    private String branchName;
    private String period;
    private long orderCount;
    private BigDecimal totalRevenue;
}
