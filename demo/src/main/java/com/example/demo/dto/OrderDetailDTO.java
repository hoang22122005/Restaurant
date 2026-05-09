package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailDTO {
    private String orderDetailID;
    private String orderID;
    private String dishID;
    private String dishName;
    private Integer quantity;
    private BigDecimal price;
}
