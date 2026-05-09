package com.example.demo.service;

import com.example.demo.dto.RevenueReportDTO;
import com.example.demo.entity.Branch;
import com.example.demo.entity.Order;
import com.example.demo.repository.BranchRepository;
import com.example.demo.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;

    public List<RevenueReportDTO> revenueByBranch() {
        List<Branch> branches = branchRepository.findAll();
        List<RevenueReportDTO> result = new ArrayList<>();
        for (Branch b : branches) {
            String bid = b.getBranchID().trim();
            List<Order> orders = orderRepository.findByEmployee_Branch_BranchID(bid);
            BigDecimal total = orders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(RevenueReportDTO.builder()
                    .branchID(bid).branchName(b.getBranchName())
                    .orderCount(orders.size()).totalRevenue(total).build());
        }
        return result;
    }

    public List<RevenueReportDTO> revenueByMonth(String branchID, int year) {
        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        List<Order> orders;
        if (branchID != null && !branchID.isBlank()) {
            orders = orderRepository.findByBranchAndTimeBetween(branchID.trim(), start, end);
        } else {
            orders = orderRepository.findByOrderTimeBetween(start, end);
        }

        Map<String, List<Order>> grouped = orders.stream()
                .collect(Collectors.groupingBy(o ->
                        o.getOrderTime().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        List<RevenueReportDTO> result = new ArrayList<>();
        for (Map.Entry<String, List<Order>> entry : grouped.entrySet()) {
            BigDecimal total = entry.getValue().stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(RevenueReportDTO.builder()
                    .period(entry.getKey()).orderCount(entry.getValue().size())
                    .totalRevenue(total).branchID(branchID).build());
        }
        result.sort(Comparator.comparing(RevenueReportDTO::getPeriod));
        return result;
    }
}
