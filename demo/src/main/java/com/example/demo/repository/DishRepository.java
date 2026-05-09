package com.example.demo.repository;

import com.example.demo.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DishRepository extends JpaRepository<Dish, String> {
    List<Dish> findByCategory(String category);
    List<Dish> findByStatus(String status);
    Dish findFirstByOrderByDishIDDesc();
}
