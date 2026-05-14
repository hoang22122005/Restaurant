package com.example.backend.service;

import com.example.backend.dto.DashboardDTO;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final BranchRepository branchRepository;
    private final DishRepository dishRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public DashboardDTO getStats() {
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardDTO.builder()
                .totalBranches(branchRepository.count())
                .totalDishes(dishRepository.count())
                .totalCustomers(customerRepository.count())
                .totalOrders(orderRepository.count())
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .build();
    }
}
