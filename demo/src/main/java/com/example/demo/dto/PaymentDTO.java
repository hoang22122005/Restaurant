package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {

    private String paymentID;

    @NotBlank(message = "Method is required")
    private String method;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String paymentTime;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "OrderID is required")
    private String orderID;
}
