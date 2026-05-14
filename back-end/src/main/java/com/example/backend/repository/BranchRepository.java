package com.example.backend.repository;

import com.example.backend.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, String> {
    List<Branch> findByRestaurant_RestaurantID(String restaurantID);
    Branch findFirstByOrderByBranchIDDesc();
}
