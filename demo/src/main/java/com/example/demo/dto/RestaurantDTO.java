package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDTO {

    @NotBlank(message = "RestaurantID is required")
    private String restaurantID;

    @NotBlank(message = "RestaurantName is required")
    private String restaurantName;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotNull(message = "TaxCode is required")
    private Integer taxCode;
}
