package com.example.demo.service;

import com.example.demo.config.DataSourceContextHolder;
import com.example.demo.dto.OrderDetailDTO;
import com.example.demo.entity.*;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderDetailService {
    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final DishRepository dishRepository;

    public List<OrderDetailDTO> findAll() {
        return orderDetailRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderDetailDTO> findByOrder(String orderID) {
        return orderDetailRepository.findByOrder_OrderID(orderID.trim()).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public OrderDetailDTO findById(String id) {
        return toDTO(orderDetailRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("OrderDetail not found: " + id)));
    }

    public OrderDetailDTO create(OrderDetailDTO dto) {
        // 1. Xác định Site hiện tại để lấy tiền tố
        String currentSite = DataSourceContextHolder.getBranchContext();
        String prefix = "BRA01"; 
        if ("SITE2".equals(currentSite)) {
            prefix = "BRA02";
        }

        // 2. Tìm ID lớn nhất theo tiền tố của chi nhánh này
        OrderDetail lastDetail = orderDetailRepository.findFirstByOrderDetailIDStartingWithOrderByOrderDetailIDDesc(prefix);
        long nextNumber = 1;
        if (lastDetail != null && lastDetail.getOrderDetailID() != null) {
            String lastId = lastDetail.getOrderDetailID().trim();
            try {
                String numberPart = lastId.substring(prefix.length());
                nextNumber = Long.parseLong(numberPart) + 1;
            } catch (Exception e) {
                nextNumber = 1;
            }
        }

        // 3. Tạo ID mới
        String newID = prefix + String.format("%04d", nextNumber);

        Order order = orderRepository.findById(dto.getOrderID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + dto.getOrderID().trim()));
        Dish dish = dishRepository.findById(dto.getDishID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with ID: " + dto.getDishID().trim()));
        
        OrderDetail entity = OrderDetail.builder()
                .orderDetailID(newID)
                .order(order).dish(dish)
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice() != null ? dto.getUnitPrice() : dish.getPrice())
                .build();
        return toDTO(orderDetailRepository.save(entity));
    }

    public OrderDetailDTO update(String id, OrderDetailDTO dto) {
        OrderDetail entity = orderDetailRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("OrderDetail not found: " + id));
        Order order = orderRepository.findById(dto.getOrderID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + dto.getOrderID().trim()));
        Dish dish = dishRepository.findById(dto.getDishID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with ID: " + dto.getDishID().trim()));
        entity.setOrder(order);
        entity.setDish(dish);
        entity.setQuantity(dto.getQuantity());
        entity.setUnitPrice(dto.getUnitPrice());
        return toDTO(orderDetailRepository.save(entity));
    }

    public void delete(String id) {
        if (!orderDetailRepository.existsById(id.trim()))
            throw new ResourceNotFoundException("OrderDetail not found: " + id);
        orderDetailRepository.deleteById(id.trim());
    }

    private OrderDetailDTO toDTO(OrderDetail e) {
        return OrderDetailDTO.builder()
                .orderDetailID(e.getOrderDetailID() != null ? e.getOrderDetailID().trim() : null)
                .orderID(e.getOrder() != null ? e.getOrder().getOrderID().trim() : null)
                .dishID(e.getDish() != null ? e.getDish().getDishID().trim() : null)
                .quantity(e.getQuantity()).unitPrice(e.getUnitPrice())
                .dishName(e.getDish() != null ? e.getDish().getDishName() : null)
                .dishPrice(e.getDish() != null ? e.getDish().getPrice() : null)
                .build();
    }
}
