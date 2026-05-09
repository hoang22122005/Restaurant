package com.example.demo.service;

import com.example.demo.config.DataSourceContextHolder;
import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderDetailDTO;
import com.example.demo.entity.*;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final DishRepository dishRepository;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public List<OrderDTO> findAll() {
        return orderRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderDTO> findByBranch(String branchID) {
        return orderRepository.findByEmployee_Branch_BranchID(branchID.trim()).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public OrderDTO findById(String id) {
        return toDTO(orderRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)));
    }

    public OrderDTO create(OrderDTO dto) {
        // 1. Xác định Site hiện tại để lấy tiền tố
        String currentSite = DataSourceContextHolder.getBranchContext();
        String prefix = "BRA01"; 
        if ("SITE2".equals(currentSite)) {
            prefix = "BRA02";
        }

        // 2. Tìm ID lớn nhất theo tiền tố của chi nhánh này
        Order lastOrder = orderRepository.findFirstByOrderIDStartingWithOrderByOrderIDDesc(prefix);
        long nextNumber = 1;
        if (lastOrder != null && lastOrder.getOrderID() != null) {
            String lastId = lastOrder.getOrderID().trim();
            try {
                String numberPart = lastId.substring(prefix.length());
                nextNumber = Long.parseLong(numberPart) + 1;
            } catch (Exception e) {
                nextNumber = 1;
            }
        }

        // 3. Tạo ID mới
        String newID = prefix + String.format("%04d", nextNumber);

        Employee emp = employeeRepository.findById(dto.getEmployeeID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        Customer cus = customerRepository.findById(dto.getCustomerID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Order entity = Order.builder()
                .orderID(newID)
                .orderTime(dto.getOrderTime() != null ? LocalDateTime.parse(dto.getOrderTime(), FMT) : LocalDateTime.now())
                .totalAmount(dto.getTotalAmount()).status(dto.getStatus())
                .employee(emp).customer(cus).vat(dto.getVat()).build();
        
        Order savedOrder = orderRepository.save(entity);

        // 4. Lưu chi tiết hóa đơn
        if (dto.getOrderDetails() != null && !dto.getOrderDetails().isEmpty()) {
            String odPrefix = currentSite.equals("SITE2") ? "OD02" : "OD01";
            
            // Tìm IDOrderDetail lớn nhất hiện tại
            OrderDetail lastOD = orderDetailRepository.findFirstByOrderDetailIDStartingWithOrderByOrderDetailIDDesc(odPrefix);
            long nextODNum = 1;
            if (lastOD != null && lastOD.getOrderDetailID() != null) {
                String lastId = lastOD.getOrderDetailID().trim();
                nextODNum = Long.parseLong(lastId.substring(odPrefix.length())) + 1;
            }

            for (OrderDetailDTO odDto : dto.getOrderDetails()) {
                Dish dish = dishRepository.findById(odDto.getDishID().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Dish not found: " + odDto.getDishID()));
                
                String odID = odPrefix + String.format("%04d", nextODNum++);
                OrderDetail odEntity = OrderDetail.builder()
                        .orderDetailID(odID)
                        .order(savedOrder)
                        .dish(dish)
                        .quantity(odDto.getQuantity())
                        .unitPrice(dish.getPrice())
                        .build();
                orderDetailRepository.save(odEntity);
            }
        }

        return toDTO(savedOrder);
    }

    public OrderDTO update(String id, OrderDTO dto) {
        Order entity = orderRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        Employee emp = employeeRepository.findById(dto.getEmployeeID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        Customer cus = customerRepository.findById(dto.getCustomerID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (dto.getOrderTime() != null) entity.setOrderTime(LocalDateTime.parse(dto.getOrderTime(), FMT));
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setStatus(dto.getStatus());
        entity.setEmployee(emp);
        entity.setCustomer(cus);
        entity.setVat(dto.getVat());
        return toDTO(orderRepository.save(entity));
    }

    public void delete(String id) {
        if (!orderRepository.existsById(id.trim()))
            throw new ResourceNotFoundException("Order not found: " + id);
        orderRepository.deleteById(id.trim());
    }

    private OrderDTO toDTO(Order e) {
        return OrderDTO.builder()
                .orderID(e.getOrderID() != null ? e.getOrderID().trim() : null)
                .orderTime(e.getOrderTime() != null ? e.getOrderTime().format(FMT) : null)
                .totalAmount(e.getTotalAmount()).status(e.getStatus()).vat(e.getVat())
                .employeeID(e.getEmployee() != null ? e.getEmployee().getEmployeeID().trim() : null)
                .customerID(e.getCustomer() != null ? e.getCustomer().getCustomerID().trim() : null)
                .employeeName(e.getEmployee() != null ? e.getEmployee().getFullName() : null)
                .customerName(e.getCustomer() != null ? e.getCustomer().getFullName() : null)
                .branchID(e.getEmployee() != null && e.getEmployee().getBranch() != null
                        ? e.getEmployee().getBranch().getBranchID().trim() : null)
                .branchName(e.getEmployee() != null && e.getEmployee().getBranch() != null
                        ? e.getEmployee().getBranch().getBranchName() : null)
                .orderDetails(orderDetailRepository.findByOrder_OrderID(e.getOrderID()).stream()
                        .map(od -> OrderDetailDTO.builder()
                                .orderDetailID(od.getOrderDetailID().trim())
                                .dishID(od.getDish().getDishID().trim())
                                .dishName(od.getDish().getDishName())
                                .quantity(od.getQuantity())
                                .unitPrice(od.getUnitPrice())
                                .dishPrice(od.getDish().getPrice())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
