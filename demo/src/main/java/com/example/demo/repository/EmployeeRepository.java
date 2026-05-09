package com.example.demo.repository;

import com.example.demo.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, String> {
    List<Employee> findByBranch_BranchID(String branchID);

    // Tìm nhân viên có ID lớn nhất của riêng chi nhánh đó
    Employee findFirstByEmployeeIDStartingWithOrderByEmployeeIDDesc(String prefix);
}
