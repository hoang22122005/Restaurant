package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {

    private String orderID;

    private String orderTime;

    @NotNull(message = "TotalAmount is required")
    private BigDecimal totalAmount;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "EmployeeID is required")
    private String employeeID;

    @NotBlank(message = "CustomerID is required")
    private String customerID;

    @NotNull(message = "VAT is required")
    private BigDecimal vat;

    // Read-only display fields
    private String employeeName;
    private String customerName;
    private String branchID;
    private String branchName;

    private java.util.List<OrderDetailDTO> orderDetails;
}
