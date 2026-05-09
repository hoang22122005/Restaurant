package com.example.demo.repository;

import com.example.demo.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, String> {
    List<OrderDetail> findByOrder_OrderID(String orderID);

    // Tìm chi tiết hóa đơn có ID lớn nhất của riêng chi nhánh đó
    OrderDetail findFirstByOrderDetailIDStartingWithOrderByOrderDetailIDDesc(String prefix);
}
