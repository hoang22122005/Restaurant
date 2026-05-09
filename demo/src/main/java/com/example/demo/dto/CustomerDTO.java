package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {

    private String customerID;

    @NotBlank(message = "FullName is required")
    private String fullName;

    @NotBlank(message = "PhoneNumber is required")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "CustomerType is required")
    private String customerType;

    private String branchID;

    private String branchName;
}
