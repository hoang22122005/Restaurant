package com.example.backend.controller;

import com.example.backend.dto.BranchDTO;
import com.example.backend.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {
    private final BranchService service;

    @GetMapping
    public List<BranchDTO> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public BranchDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public BranchDTO create(@Valid @RequestBody BranchDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public BranchDTO update(@PathVariable String id, @Valid @RequestBody BranchDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
