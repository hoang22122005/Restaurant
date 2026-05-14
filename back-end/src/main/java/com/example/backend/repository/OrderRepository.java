package com.example.backend.repository;

import com.example.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByEmployee_Branch_BranchID(String branchID);

    @Query("SELECT o FROM Order o WHERE o.orderTime BETWEEN :start AND :end")
    List<Order> findByOrderTimeBetween(@Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.employee.branch.branchID = :branchID " +
           "AND o.orderTime BETWEEN :start AND :end")
    List<Order> findByBranchAndTimeBetween(@Param("branchID") String branchID,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    // Tìm hóa đơn có ID lớn nhất của riêng chi nhánh đó
    Order findFirstByOrderIDStartingWithOrderByOrderIDDesc(String prefix);
}
