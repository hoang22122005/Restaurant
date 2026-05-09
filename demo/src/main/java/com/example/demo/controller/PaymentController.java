package com.example.demo.controller;

import com.example.demo.dto.PaymentDTO;
import com.example.demo.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @GetMapping
    public List<PaymentDTO> getAll(@RequestParam(required = false) String orderID) {
        if (orderID != null && !orderID.isBlank()) return service.findByOrder(orderID);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public PaymentDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public PaymentDTO create(@Valid @RequestBody PaymentDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public PaymentDTO update(@PathVariable String id, @Valid @RequestBody PaymentDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
