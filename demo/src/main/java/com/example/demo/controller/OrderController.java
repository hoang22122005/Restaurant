package com.example.demo.controller;

import com.example.demo.dto.OrderDTO;
import com.example.demo.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @GetMapping
    public List<OrderDTO> getAll(@RequestParam(required = false) String branchID) {
        if (branchID != null && !branchID.isBlank()) return service.findByBranch(branchID);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public OrderDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public OrderDTO create(@Valid @RequestBody OrderDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public OrderDTO update(@PathVariable String id, @Valid @RequestBody OrderDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
