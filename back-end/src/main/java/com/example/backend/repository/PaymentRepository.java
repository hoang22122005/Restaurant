package com.example.backend.repository;

import com.example.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByOrder_OrderID(String orderID);

    // Tìm thanh toán có ID lớn nhất của riêng chi nhánh đó
    Payment findFirstByPaymentIDStartingWithOrderByPaymentIDDesc(String prefix);
}
