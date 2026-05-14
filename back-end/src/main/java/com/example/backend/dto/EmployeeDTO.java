package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {

    private String employeeID;

    @NotBlank(message = "FullName is required")
    private String fullName;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String dateOfBirth;

    @NotBlank(message = "Position is required")
    private String position;

    @NotNull(message = "Salary is required")
    private BigDecimal salary;

    private String hireDate;

    @NotBlank(message = "Status is required")
    private String status;

    private String branchID;

    private String branchName;
}
