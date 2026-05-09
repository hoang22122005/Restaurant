package com.example.demo.controller;

import com.example.demo.dto.OrderDetailDTO;
import com.example.demo.service.OrderDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/order-details")
@RequiredArgsConstructor
public class OrderDetailController {
    private final OrderDetailService service;

    @GetMapping
    public List<OrderDetailDTO> getAll(@RequestParam(required = false) String orderID) {
        if (orderID != null && !orderID.isBlank()) return service.findByOrder(orderID);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public OrderDetailDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public OrderDetailDTO create(@Valid @RequestBody OrderDetailDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public OrderDetailDTO update(@PathVariable String id, @Valid @RequestBody OrderDetailDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
