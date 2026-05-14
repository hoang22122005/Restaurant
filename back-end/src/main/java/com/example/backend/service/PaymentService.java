package com.example.backend.service;

import com.example.backend.config.DataSourceContextHolder;
import com.example.backend.dto.PaymentDTO;
import com.example.backend.entity.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public List<PaymentDTO> findAll() {
        return paymentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PaymentDTO> findByOrder(String orderID) {
        return paymentRepository.findByOrder_OrderID(orderID.trim()).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public PaymentDTO findById(String id) {
        return toDTO(paymentRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id)));
    }

    public PaymentDTO create(PaymentDTO dto) {
        // 1. Xác định Site hiện tại để lấy tiền tố
        String currentSite = DataSourceContextHolder.getBranchContext();
        String prefix = "BRA01"; 
        if ("SITE2".equals(currentSite)) {
            prefix = "BRA02";
        }

        // 2. Tìm ID lớn nhất theo tiền tố của chi nhánh này
        Payment lastPayment = paymentRepository.findFirstByPaymentIDStartingWithOrderByPaymentIDDesc(prefix);
        long nextNumber = 1;
        if (lastPayment != null && lastPayment.getPaymentID() != null) {
            String lastId = lastPayment.getPaymentID().trim();
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
        Payment entity = Payment.builder()
                .paymentID(newID).method(dto.getMethod()).amount(dto.getAmount())
                .paymentTime(dto.getPaymentTime() != null ? LocalDateTime.parse(dto.getPaymentTime(), FMT) : LocalDateTime.now())
                .status(dto.getStatus()).order(order).build();
        return toDTO(paymentRepository.save(entity));
    }

    public PaymentDTO update(String id, PaymentDTO dto) {
        Payment entity = paymentRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        Order order = orderRepository.findById(dto.getOrderID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + dto.getOrderID().trim()));
        entity.setMethod(dto.getMethod());
        entity.setAmount(dto.getAmount());
        if (dto.getPaymentTime() != null) entity.setPaymentTime(LocalDateTime.parse(dto.getPaymentTime(), FMT));
        entity.setStatus(dto.getStatus());
        entity.setOrder(order);
        return toDTO(paymentRepository.save(entity));
    }

    public void delete(String id) {
        if (!paymentRepository.existsById(id.trim()))
            throw new ResourceNotFoundException("Payment not found: " + id);
        paymentRepository.deleteById(id.trim());
    }

    private PaymentDTO toDTO(Payment e) {
        return PaymentDTO.builder()
                .paymentID(e.getPaymentID() != null ? e.getPaymentID().trim() : null)
                .method(e.getMethod()).amount(e.getAmount())
                .paymentTime(e.getPaymentTime() != null ? e.getPaymentTime().format(FMT) : null)
                .status(e.getStatus())
                .orderID(e.getOrder() != null ? e.getOrder().getOrderID().trim() : null)
                .build();
    }
}
