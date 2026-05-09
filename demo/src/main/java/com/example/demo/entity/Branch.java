package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "BRANCH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    @Column(name = "BranchID", length = 10)
    private String branchID;

    @Column(name = "BranchName", nullable = false, length = 100)
    private String branchName;

    @Column(name = "Address", nullable = false, length = 200)
    private String address;

    @Column(name = "City", nullable = false, length = 50)
    private String city;

    @Column(name = "Region", nullable = false, length = 20)
    private String region;

    @Column(name = "PhoneNumber", nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "Email", nullable = false, length = 100)
    private String email;

    @Column(name = "EstablishedDate", nullable = false)
    private LocalDate establishedDate;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RestaurantID", nullable = false)
    private Restaurant restaurant;
}
