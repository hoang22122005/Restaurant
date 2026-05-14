package com.example.backend.controller;

import com.example.backend.dto.EmployeeDTO;
import com.example.backend.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService service;

    @GetMapping
    public List<EmployeeDTO> getAll(@RequestParam(required = false) String branchID) {
        if (branchID != null && !branchID.isBlank()) return service.findByBranch(branchID);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EmployeeDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public EmployeeDTO create(@Valid @RequestBody EmployeeDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public EmployeeDTO update(@PathVariable String id, @Valid @RequestBody EmployeeDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
