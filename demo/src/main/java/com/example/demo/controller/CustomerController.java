package com.example.demo.controller;

import com.example.demo.dto.CustomerDTO;
import com.example.demo.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService service;

    @GetMapping
    public List<CustomerDTO> getAll(@RequestParam(required = false) String branchID) {
        if (branchID != null && !branchID.isBlank()) return service.findByBranch(branchID);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CustomerDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public CustomerDTO create(@Valid @RequestBody CustomerDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public CustomerDTO update(@PathVariable String id, @Valid @RequestBody CustomerDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
