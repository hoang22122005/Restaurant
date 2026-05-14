package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "DISH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dish {

    @Id
    @Column(name = "DishID", length = 10)
    private String dishID;

    @Column(name = "DishName", nullable = false, length = 100)
    private String dishName;

    @Column(name = "Price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "Category", nullable = false, length = 50)
    private String category;

    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;
}
