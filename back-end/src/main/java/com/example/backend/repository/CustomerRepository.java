package com.example.backend.repository;

import com.example.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    List<Customer> findByBranch_BranchID(String branchID);
    
    // Tìm khách hàng có ID lớn nhất của riêng chi nhánh đó
    Customer findFirstByCustomerIDStartingWithOrderByCustomerIDDesc(String prefix);
}
