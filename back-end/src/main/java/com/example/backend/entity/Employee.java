package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "EMPLOYEE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @Column(name = "EmployeeID", length = 20)
    private String employeeID;

    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;

    @Column(name = "Gender", nullable = false, length = 10)
    private String gender;

    @Column(name = "DateOfBirth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "Position", nullable = false, length = 50)
    private String position;

    @Column(name = "Salary", nullable = false, precision = 18, scale = 2)
    private BigDecimal salary;

    @Column(name = "HireDate", nullable = false)
    private LocalDate hireDate;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BranchID", nullable = false)
    private Branch branch;
}
