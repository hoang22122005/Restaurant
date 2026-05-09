package com.example.demo.service;

import com.example.demo.dto.RestaurantDTO;
import com.example.demo.entity.Restaurant;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantDTO> findAll() {
        return restaurantRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public RestaurantDTO findById(String id) {
        return toDTO(restaurantRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + id)));
    }

    public RestaurantDTO create(RestaurantDTO dto) {
        Restaurant entity = toEntity(dto);
        return toDTO(restaurantRepository.save(entity));
    }

    public RestaurantDTO update(String id, RestaurantDTO dto) {
        Restaurant entity = restaurantRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + id));
        entity.setRestaurantName(dto.getRestaurantName());
        entity.setType(dto.getType());
        entity.setBrand(dto.getBrand());
        entity.setTaxCode(dto.getTaxCode());
        return toDTO(restaurantRepository.save(entity));
    }

    public void delete(String id) {
        if (!restaurantRepository.existsById(id.trim())) {
            throw new ResourceNotFoundException("Restaurant not found: " + id);
        }
        restaurantRepository.deleteById(id.trim());
    }

    private RestaurantDTO toDTO(Restaurant e) {
        return RestaurantDTO.builder()
                .restaurantID(e.getRestaurantID() != null ? e.getRestaurantID().trim() : null)
                .restaurantName(e.getRestaurantName())
                .type(e.getType())
                .brand(e.getBrand())
                .taxCode(e.getTaxCode())
                .build();
    }

    private Restaurant toEntity(RestaurantDTO dto) {
        return Restaurant.builder()
                .restaurantID(dto.getRestaurantID())
                .restaurantName(dto.getRestaurantName())
                .type(dto.getType())
                .brand(dto.getBrand())
                .taxCode(dto.getTaxCode())
                .build();
    }
}
