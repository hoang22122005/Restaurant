package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RESTAURANT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @Column(name = "RestaurantID", length = 10)
    private String restaurantID;

    @Column(name = "RestaurantName", nullable = false, length = 100)
    private String restaurantName;

    @Column(name = "Type", nullable = false, length = 50)
    private String type;

    @Column(name = "Brand", nullable = false, length = 100)
    private String brand;

    @Column(name = "TaxCode", nullable = false)
    private Integer taxCode;
}
