package com.example.demo.controller;

import com.example.demo.dto.RestaurantDTO;
import com.example.demo.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService service;

    @GetMapping
    public List<RestaurantDTO> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public RestaurantDTO getById(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public RestaurantDTO create(@Valid @RequestBody RestaurantDTO dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public RestaurantDTO update(@PathVariable String id, @Valid @RequestBody RestaurantDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
