package com.example.demo.controller;

import com.example.demo.dto.DishDTO;
import com.example.demo.service.DishService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dishes")
@RequiredArgsConstructor
public class DishController {
    private final DishService service;

    @GetMapping
    public List<DishDTO> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public DishDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public DishDTO create(@Valid @RequestBody DishDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public DishDTO update(@PathVariable String id, @Valid @RequestBody DishDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
