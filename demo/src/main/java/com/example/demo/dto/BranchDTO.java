package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchDTO {

    @NotBlank(message = "BranchID is required")
    private String branchID;

    @NotBlank(message = "BranchName is required")
    private String branchName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Region is required")
    private String region;

    @NotBlank(message = "PhoneNumber is required")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    private String email;

    private String establishedDate;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "RestaurantID is required")
    private String restaurantID;

    // Read-only fields populated from relationships
    private String restaurantName;
}
